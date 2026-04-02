package com.taskmaster.service;

import com.taskmaster.dto.BuildingDTO;
import com.taskmaster.dto.CityDTO;
import com.taskmaster.dto.CityMemberDTO;
import com.taskmaster.dto.ExpeditionDTO;
import com.taskmaster.exception.ResourceNotFoundException;
import com.taskmaster.exception.TaskStateException;
import com.taskmaster.model.Building;
import com.taskmaster.model.City;
import com.taskmaster.model.CityMembership;
import com.taskmaster.model.Expedition;
import com.taskmaster.model.ResourceType;
import com.taskmaster.model.User;
import com.taskmaster.repository.BuildingRepository;
import com.taskmaster.repository.CityMembershipRepository;
import com.taskmaster.repository.CityRepository;
import com.taskmaster.repository.ExpeditionRepository;
import com.taskmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;
    private final CityMembershipRepository cityMembershipRepository;
    private final BuildingRepository buildingRepository;
    private final UserRepository userRepository;
    private final ExpeditionRepository expeditionRepository;

    @Transactional
    public CityDTO createCity(Long userId, String cityName) {
        if (cityMembershipRepository.existsByUserId(userId)) {
            throw new TaskStateException("User is already a member of a city");
        }
        String inviteCode = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        City city = cityRepository.save(City.builder()
                .name(cityName)
                .founderUserId(userId)
                .inviteCode(inviteCode)
                .build());

        cityMembershipRepository.save(CityMembership.builder()
                .cityId(city.getId())
                .userId(userId)
                .role(CityMembership.Role.FOUNDER)
                .build());

        // Bootstrap all four buildings at level 1
        Arrays.stream(Building.BuildingType.values()).forEach(bt ->
                buildingRepository.save(Building.builder()
                        .cityId(city.getId())
                        .buildingType(bt)
                        .build()));

        return toDTO(city, true);
    }

    @Transactional
    public CityDTO joinCity(Long userId, String inviteCode) {
        if (cityMembershipRepository.existsByUserId(userId)) {
            throw new TaskStateException("User is already a member of a city");
        }
        City city = cityRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException("City not found with invite code: " + inviteCode));

        cityMembershipRepository.save(CityMembership.builder()
                .cityId(city.getId())
                .userId(userId)
                .role(CityMembership.Role.CITIZEN)
                .build());

        return toDTO(city, true);
    }

    @Transactional
    public void leaveCity(Long userId) {
        CityMembership membership = cityMembershipRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of any city"));
        if (membership.getRole() == CityMembership.Role.FOUNDER) {
            throw new TaskStateException("Founders cannot leave their city");
        }
        cityMembershipRepository.delete(membership);
    }

    /**
     * Called on task completion. Adds resources to city pool and advances building progress.
     * Returns the amount contributed (0 if user is not in a city).
     */
    @Transactional
    public int contributeResource(Long userId, ResourceType resourceType, int amount) {
        return cityMembershipRepository.findByUserId(userId).map(membership -> {
            City city = cityRepository.findById(membership.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City not found"));

            // Add to city resource pool
            addResourceToCity(city, resourceType, amount);
            cityRepository.save(city);

            // Update membership contribution tracking
            addResourceToMembership(membership, resourceType, amount);
            cityMembershipRepository.save(membership);

            // Advance matching building progress
            Building.BuildingType bt = Building.getBuildingType(resourceType);
            buildingRepository.findByCityIdAndBuildingType(city.getId(), bt).ifPresent(building -> {
                if (building.getLevel() < Building.MAX_LEVEL) {
                    building.setProgress(building.getProgress() + amount);
                    // Auto level-up if progress threshold reached
                    while (building.getProgress() >= building.getProgressRequired()
                            && building.getLevel() < Building.MAX_LEVEL) {
                        building.setProgress(building.getProgress() - building.getProgressRequired());
                        building.setLevel(building.getLevel() + 1);
                    }
                    buildingRepository.save(building);
                    // Recalculate city level
                    recalculateCityLevel(city);
                }
            });

            return amount;
        }).orElse(0);
    }

    public CityDTO getCityForUser(Long userId) {
        CityMembership membership = cityMembershipRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of any city"));
        City city = cityRepository.findById(membership.getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City not found"));
        return toDTO(city, true);
    }

    public CityDTO getCity(Long cityId) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("City not found with id: " + cityId));
        return toDTO(city, true);
    }

    public boolean isUserInCity(Long userId) {
        return cityMembershipRepository.existsByUserId(userId);
    }

    /**
     * Credits each building's daily passive production to the matching city
     * resource pool. Called by the scheduler once per day for every city.
     */
    @Transactional
    public void applyDailyProduction(Long cityId) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("City not found with id: " + cityId));
        buildingRepository.findByCityId(cityId).forEach(building -> {
            ResourceType rt = Building.getResourceType(building.getBuildingType());
            addResourceToCity(city, rt, building.getDailyProduction());
        });
        cityRepository.save(city);
    }

    public Long getCityIdForUser(Long userId) {
        return cityMembershipRepository.findByUserId(userId)
                .map(CityMembership::getCityId)
                .orElse(null);
    }

    // ── Expedition methods ────────────────────────────────────────────────────

    /**
     * Launches a new expedition on behalf of the given user.
     * A user may only have one ACTIVE expedition at a time within their city.
     * Rewards are pre-calculated at launch so the player knows what to expect.
     */
    @Transactional
    public ExpeditionDTO launchExpedition(Long userId, Expedition.ExpeditionType type,
                                          Expedition.ExpeditionDuration duration) {
        CityMembership membership = cityMembershipRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of any city"));
        Long cityId = membership.getCityId();

        if (expeditionRepository.existsByCityIdAndLaunchedByUserIdAndStatus(
                cityId, userId, Expedition.Status.ACTIVE)) {
            throw new TaskStateException("You already have an active expedition");
        }

        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("City not found"));

        int multiplier = duration.getMultiplier();
        int resourceReward = city.getLevel() * 15 * multiplier;
        int smallReward   = city.getLevel() * multiplier;

        Expedition.ExpeditionBuilder builder = Expedition.builder()
                .cityId(cityId)
                .launchedByUserId(userId)
                .expeditionType(type)
                .duration(duration)
                .completesAt(LocalDateTime.now().plusMinutes(duration.getMinutes()));

        switch (type) {
            case FORAGING       -> builder.rewardFood(resourceReward);
            case LOGGING        -> builder.rewardWood(resourceReward);
            case MINING         -> builder.rewardStone(resourceReward);
            case TREASURY_RAID  -> builder.rewardGold(resourceReward);
            case RECRUITMENT    -> builder.rewardCitizens(smallReward);
            case CULTURAL_VOYAGE -> builder.rewardCulture(smallReward);
        }

        return toExpeditionDTO(expeditionRepository.save(builder.build()));
    }

    /**
     * Claims the rewards of a completed expedition and credits them to the city.
     */
    @Transactional
    public ExpeditionDTO claimExpedition(Long userId, Long expeditionId) {
        CityMembership membership = cityMembershipRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of any city"));

        Expedition expedition = expeditionRepository
                .findByIdAndCityId(expeditionId, membership.getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("Expedition not found"));

        if (expedition.getStatus() == Expedition.Status.CLAIMED) {
            throw new TaskStateException("Expedition already claimed");
        }
        if (LocalDateTime.now().isBefore(expedition.getCompletesAt())) {
            throw new TaskStateException("Expedition not yet complete");
        }

        City city = cityRepository.findById(membership.getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City not found"));

        city.setFood(city.getFood() + expedition.getRewardFood());
        city.setWood(city.getWood() + expedition.getRewardWood());
        city.setStone(city.getStone() + expedition.getRewardStone());
        city.setGold(city.getGold() + expedition.getRewardGold());
        city.setPopulation(city.getPopulation() + expedition.getRewardCitizens());
        city.setCulture(city.getCulture() + expedition.getRewardCulture());
        cityRepository.save(city);

        expedition.setStatus(Expedition.Status.CLAIMED);
        expeditionRepository.save(expedition);

        return toExpeditionDTO(expedition);
    }

    /** Returns all expeditions for the city the user belongs to. */
    public List<ExpeditionDTO> getExpeditionsForCity(Long userId) {
        CityMembership membership = cityMembershipRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of any city"));
        return fetchExpeditionDTOs(membership.getCityId());
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private void addResourceToCity(City city, ResourceType rt, int amount) {
        switch (rt) {
            case FOOD  -> city.setFood(city.getFood() + amount);
            case WOOD  -> city.setWood(city.getWood() + amount);
            case STONE -> city.setStone(city.getStone() + amount);
            case GOLD  -> city.setGold(city.getGold() + amount);
        }
    }

    private void addResourceToMembership(CityMembership m, ResourceType rt, int amount) {
        switch (rt) {
            case FOOD  -> m.setFoodContributed(m.getFoodContributed() + amount);
            case WOOD  -> m.setWoodContributed(m.getWoodContributed() + amount);
            case STONE -> m.setStoneContributed(m.getStoneContributed() + amount);
            case GOLD  -> m.setGoldContributed(m.getGoldContributed() + amount);
        }
    }

    private void recalculateCityLevel(City city) {
        List<Building> buildings = buildingRepository.findByCityId(city.getId());
        if (buildings.isEmpty()) return;
        int avgLevel = (int) Math.floor(
                buildings.stream().mapToInt(Building::getLevel).average().orElse(1));
        city.setLevel(Math.max(1, avgLevel));
        cityRepository.save(city);
    }

    public CityDTO toDTO(City city, boolean includeDetails) {
        CityDTO.CityDTOBuilder builder = CityDTO.builder()
                .id(city.getId())
                .name(city.getName())
                .founderUserId(city.getFounderUserId())
                .inviteCode(city.getInviteCode())
                .level(city.getLevel())
                .food(city.getFood())
                .wood(city.getWood())
                .stone(city.getStone())
                .gold(city.getGold())
                .population(city.getPopulation())
                .culture(city.getCulture())
                .createdAt(city.getCreatedAt());

        if (includeDetails) {
            List<BuildingDTO> buildingDTOs = buildingRepository.findByCityId(city.getId())
                    .stream()
                    .map(this::toBuildingDTO)
                    .collect(Collectors.toList());
            builder.buildings(buildingDTOs);

            List<CityMemberDTO> memberDTOs = cityMembershipRepository.findByCityId(city.getId())
                    .stream()
                    .map(this::toMemberDTO)
                    .collect(Collectors.toList());
            builder.members(memberDTOs);

            List<ExpeditionDTO> expeditionDTOs = fetchExpeditionDTOs(city.getId());
            builder.expeditions(expeditionDTOs);
        }

        return builder.build();
    }

    public BuildingDTO toBuildingDTO(Building b) {
        return BuildingDTO.builder()
                .id(b.getId())
                .cityId(b.getCityId())
                .buildingType(b.getBuildingType())
                .name(getBuildingName(b.getBuildingType()))
                .icon(getBuildingIcon(b.getBuildingType()))
                .level(b.getLevel())
                .progress(b.getProgress())
                .progressRequired(b.getProgressRequired())
                .dailyProduction(b.getDailyProduction())
                .builtAt(b.getBuiltAt())
                .build();
    }

    public ExpeditionDTO toExpeditionDTO(Expedition e) {
        String launchedByUsername = userRepository.findById(e.getLaunchedByUserId())
                .map(User::getUsername)
                .orElse("Unknown");
        return ExpeditionDTO.builder()
                .id(e.getId())
                .cityId(e.getCityId())
                .launchedByUserId(e.getLaunchedByUserId())
                .launchedByUsername(launchedByUsername)
                .expeditionType(e.getExpeditionType())
                .name(getExpeditionName(e.getExpeditionType()))
                .icon(getExpeditionIcon(e.getExpeditionType()))
                .duration(e.getDuration())
                .status(e.getStatus())
                .launchedAt(e.getLaunchedAt())
                .completesAt(e.getCompletesAt())
                .rewardFood(e.getRewardFood())
                .rewardWood(e.getRewardWood())
                .rewardStone(e.getRewardStone())
                .rewardGold(e.getRewardGold())
                .rewardCitizens(e.getRewardCitizens())
                .rewardCulture(e.getRewardCulture())
                .build();
    }

    public CityMemberDTO toMemberDTO(CityMembership m) {
        String username = userRepository.findById(m.getUserId())
                .map(User::getUsername)
                .orElse("Unknown");
        return CityMemberDTO.builder()
                .id(m.getId())
                .cityId(m.getCityId())
                .userId(m.getUserId())
                .username(username)
                .role(m.getRole())
                .foodContributed(m.getFoodContributed())
                .woodContributed(m.getWoodContributed())
                .stoneContributed(m.getStoneContributed())
                .goldContributed(m.getGoldContributed())
                .totalContributed(m.getTotalContributed())
                .joinedAt(m.getJoinedAt())
                .build();
    }

    private static String getBuildingName(Building.BuildingType bt) {
        return switch (bt) {
            case FARM -> "Farm";
            case LUMBERMILL -> "Lumbermill";
            case QUARRY -> "Quarry";
            case TREASURY -> "Treasury";
        };
    }

    private static String getBuildingIcon(Building.BuildingType bt) {
        return switch (bt) {
            case FARM -> "🌾";
            case LUMBERMILL -> "🪵";
            case QUARRY -> "⛏️";
            case TREASURY -> "🏦";
        };
    }

    private List<ExpeditionDTO> fetchExpeditionDTOs(Long cityId) {
        return expeditionRepository.findByCityIdOrderByLaunchedAtDesc(cityId)
                .stream()
                .map(this::toExpeditionDTO)
                .collect(Collectors.toList());
    }

    private static String getExpeditionName(Expedition.ExpeditionType type) {
        return switch (type) {
            case FORAGING        -> "Foraging";
            case LOGGING         -> "Logging";
            case MINING          -> "Mining";
            case TREASURY_RAID   -> "Treasury Raid";
            case RECRUITMENT     -> "Recruitment";
            case CULTURAL_VOYAGE -> "Cultural Voyage";
        };
    }

    private static String getExpeditionIcon(Expedition.ExpeditionType type) {
        return switch (type) {
            case FORAGING        -> "🌿";
            case LOGGING         -> "🪓";
            case MINING          -> "⛏️";
            case TREASURY_RAID   -> "💰";
            case RECRUITMENT     -> "👥";
            case CULTURAL_VOYAGE -> "🎭";
        };
    }
}


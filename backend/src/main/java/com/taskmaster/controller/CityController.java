package com.taskmaster.controller;

import com.taskmaster.dto.CityDTO;
import com.taskmaster.dto.ExpeditionDTO;
import com.taskmaster.exception.ResourceNotFoundException;
import com.taskmaster.model.Expedition;
import com.taskmaster.repository.UserRepository;
import com.taskmaster.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
    }

    /** Get the city the authenticated user belongs to. */
    @GetMapping("/me")
    public ResponseEntity<CityDTO> getMyCity(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cityService.getCityForUser(getUserId(userDetails)));
    }

    /** Get a city by its id. */
    @GetMapping("/{id}")
    public ResponseEntity<CityDTO> getCity(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getCity(id));
    }

    /** Create a new city. Body: { "name": "..." } */
    @PostMapping
    public ResponseEntity<CityDTO> createCity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cityService.createCity(getUserId(userDetails), name.trim()));
    }

    /** Join a city via invite code. Body: { "inviteCode": "..." } */
    @PostMapping("/join")
    public ResponseEntity<CityDTO> joinCity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String inviteCode = body.get("inviteCode");
        if (inviteCode == null || inviteCode.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cityService.joinCity(getUserId(userDetails), inviteCode.trim().toUpperCase()));
    }

    /** Leave a city (founders cannot leave). */
    @DeleteMapping("/me")
    public ResponseEntity<Void> leaveCity(@AuthenticationPrincipal UserDetails userDetails) {
        cityService.leaveCity(getUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    // ── Expedition endpoints ─────────────────────────────────────────────────

    /** List all expeditions for the authenticated user's city. */
    @GetMapping("/me/expeditions")
    public ResponseEntity<List<ExpeditionDTO>> getExpeditions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cityService.getExpeditionsForCity(getUserId(userDetails)));
    }

    /**
     * Launch a new expedition.
     * Body: { "expeditionType": "FORAGING", "duration": "SHORT" }
     */
    @PostMapping("/me/expeditions")
    public ResponseEntity<ExpeditionDTO> launchExpedition(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String typeStr     = body.get("expeditionType");
        String durationStr = body.get("duration");
        if (typeStr == null || durationStr == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Expedition.ExpeditionType type = Expedition.ExpeditionType.valueOf(typeStr);
            Expedition.ExpeditionDuration duration = Expedition.ExpeditionDuration.valueOf(durationStr);
            return ResponseEntity.ok(cityService.launchExpedition(getUserId(userDetails), type, duration));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** Claim the rewards of a completed expedition. */
    @PostMapping("/me/expeditions/{expeditionId}/claim")
    public ResponseEntity<ExpeditionDTO> claimExpedition(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long expeditionId) {
        return ResponseEntity.ok(cityService.claimExpedition(getUserId(userDetails), expeditionId));
    }
}


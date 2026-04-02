package com.taskmaster.service;

import com.taskmaster.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Fires once per day at midnight (server time) and credits each city's
 * buildings with their passive daily resource production.
 * The amount produced per building is level × 10, so levelling up a
 * building meaningfully increases its output.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BuildingProductionScheduler {

    private final CityRepository cityRepository;
    private final CityService cityService;

    @Scheduled(cron = "0 0 0 * * *")
    public void applyDailyProduction() {
        log.info("Applying daily building production for all cities");
        cityRepository.findAll().forEach(city -> {
            try {
                cityService.applyDailyProduction(city.getId());
            } catch (Exception e) {
                log.error("Failed to apply daily production for city {}: {}", city.getId(), e.getMessage());
            }
        });
    }
}

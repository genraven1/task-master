package com.taskmaster.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "buildings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cityId", "buildingType"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long cityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BuildingType buildingType;

    @Builder.Default
    private int level = 1;

    /** Accumulated progress toward the next level-up. */
    @Builder.Default
    private int progress = 0;

    @Builder.Default
    private LocalDateTime builtAt = LocalDateTime.now();

    public static final int MAX_LEVEL = 5;

    /** Progress required to advance from current level to level+1. */
    public int getProgressRequired() {
        return level * 100;
    }

    public enum BuildingType {
        FARM,        // food
        LUMBERMILL,  // wood
        QUARRY,      // stone
        TREASURY     // gold
    }

    public static ResourceType getResourceType(BuildingType bt) {
        return switch (bt) {
            case FARM -> ResourceType.FOOD;
            case LUMBERMILL -> ResourceType.WOOD;
            case QUARRY -> ResourceType.STONE;
            case TREASURY -> ResourceType.GOLD;
        };
    }

    public static BuildingType getBuildingType(ResourceType rt) {
        return switch (rt) {
            case FOOD -> BuildingType.FARM;
            case WOOD -> BuildingType.LUMBERMILL;
            case STONE -> BuildingType.QUARRY;
            case GOLD -> BuildingType.TREASURY;
        };
    }
}

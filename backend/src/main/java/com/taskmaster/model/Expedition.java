package com.taskmaster.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "expeditions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expedition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long cityId;

    @Column(nullable = false)
    private Long launchedByUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpeditionType expeditionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpeditionDuration duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Builder.Default
    private LocalDateTime launchedAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime completesAt;

    // Pre-calculated rewards (set once at launch time)
    @Builder.Default private int rewardFood = 0;
    @Builder.Default private int rewardWood = 0;
    @Builder.Default private int rewardStone = 0;
    @Builder.Default private int rewardGold = 0;
    @Builder.Default private int rewardCitizens = 0;
    @Builder.Default private int rewardCulture = 0;

    public enum ExpeditionType {
        FORAGING,        // +food
        LOGGING,         // +wood
        MINING,          // +stone
        TREASURY_RAID,   // +gold
        RECRUITMENT,     // +citizens (population)
        CULTURAL_VOYAGE  // +culture
    }

    /**
     * Duration options – each carries the number of real-time minutes until
     * the expedition returns.  Reward scales with the duration multiplier.
     */
    public enum ExpeditionDuration {
        SHORT(60),
        MEDIUM(240),
        LONG(480);

        private final int minutes;

        ExpeditionDuration(int minutes) {
            this.minutes = minutes;
        }

        public int getMinutes() { return minutes; }

        /** Multiplier used in the reward formula (1 / 4 / 8). */
        public int getMultiplier() {
            return switch (this) {
                case SHORT -> 1;
                case MEDIUM -> 4;
                case LONG -> 8;
            };
        }
    }

    public enum Status {
        ACTIVE, CLAIMED
    }
}

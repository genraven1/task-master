package com.taskmaster.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long founderUserId;

    @Column(unique = true, nullable = false)
    private String inviteCode;

    @Builder.Default
    private int level = 1;

    @Builder.Default
    private int food = 0;

    @Builder.Default
    private int wood = 0;

    @Builder.Default
    private int stone = 0;

    @Builder.Default
    private int gold = 0;

    /** Number of NPC inhabitants brought back by Recruitment expeditions. */
    @Builder.Default
    private int population = 0;

    /** Cultural points accumulated through Cultural Voyage expeditions. */
    @Builder.Default
    private int culture = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

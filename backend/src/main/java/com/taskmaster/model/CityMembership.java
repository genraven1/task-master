package com.taskmaster.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "city_memberships",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cityId", "userId"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CityMembership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long cityId;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.CITIZEN;

    @Builder.Default
    private int foodContributed = 0;

    @Builder.Default
    private int woodContributed = 0;

    @Builder.Default
    private int stoneContributed = 0;

    @Builder.Default
    private int goldContributed = 0;

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();

    public enum Role {
        FOUNDER, CITIZEN
    }

    public int getTotalContributed() {
        return foodContributed + woodContributed + stoneContributed + goldContributed;
    }
}

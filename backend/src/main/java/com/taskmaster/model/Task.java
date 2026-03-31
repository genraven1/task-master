package com.taskmaster.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Difficulty difficulty = Difficulty.EASY;

    @Builder.Default
    private int xpReward = 10;

    @Builder.Default
    private int goldReward = 5;

    @Builder.Default
    private boolean completed = false;

    private LocalDateTime completedAt;

    @Builder.Default
    private int streak = 0;

    private LocalDate dueDate;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private String tags;

    public enum TaskType {
        DAILY, TODO, HABIT
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD, EPIC
    }
}

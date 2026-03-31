package com.taskmaster.dto;

import com.taskmaster.model.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private Task.TaskType type;
    private Task.Difficulty difficulty;
    private int xpReward;
    private int goldReward;
    private boolean completed;
    private LocalDateTime completedAt;
    private int streak;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private String tags;
}

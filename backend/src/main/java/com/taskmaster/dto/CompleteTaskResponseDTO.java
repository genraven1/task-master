package com.taskmaster.dto;

import com.taskmaster.model.ResourceType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteTaskResponseDTO {
    private TaskDTO task;
    private UserDTO user;
    private int xpGained;
    private int goldGained;
    private boolean leveledUp;
    private ResourceType resourceType;
    private int resourceGained;
    private Long cityId;
    private int cityResourceContributed;
}

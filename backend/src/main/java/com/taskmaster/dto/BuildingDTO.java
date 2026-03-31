package com.taskmaster.dto;

import com.taskmaster.model.Building;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildingDTO {
    private Long id;
    private Long cityId;
    private Building.BuildingType buildingType;
    private String name;
    private String icon;
    private int level;
    private int progress;
    private int progressRequired;
    private LocalDateTime builtAt;
}

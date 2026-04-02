package com.taskmaster.dto;

import com.taskmaster.model.Expedition;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpeditionDTO {
    private Long id;
    private Long cityId;
    private Long launchedByUserId;
    private String launchedByUsername;
    private Expedition.ExpeditionType expeditionType;
    private String name;
    private String icon;
    private Expedition.ExpeditionDuration duration;
    private Expedition.Status status;
    private LocalDateTime launchedAt;
    private LocalDateTime completesAt;
    private int rewardFood;
    private int rewardWood;
    private int rewardStone;
    private int rewardGold;
    private int rewardCitizens;
    private int rewardCulture;
}

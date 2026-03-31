package com.taskmaster.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityDTO {
    private Long id;
    private String name;
    private Long founderUserId;
    private String inviteCode;
    private int level;
    private int food;
    private int wood;
    private int stone;
    private int gold;
    private LocalDateTime createdAt;
    private List<BuildingDTO> buildings;
    private List<CityMemberDTO> members;
}

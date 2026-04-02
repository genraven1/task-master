package com.taskmaster.dto;

import com.taskmaster.model.CityMembership;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityMemberDTO {
    private Long id;
    private Long cityId;
    private Long userId;
    private String username;
    private CityMembership.Role role;
    private int foodContributed;
    private int woodContributed;
    private int stoneContributed;
    private int goldContributed;
    private int totalContributed;
    private LocalDateTime joinedAt;
}

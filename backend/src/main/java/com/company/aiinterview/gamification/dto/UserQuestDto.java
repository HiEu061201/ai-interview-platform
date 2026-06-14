package com.company.aiinterview.gamification.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class UserQuestDto {
    private Long id;
    private String questType;
    private String title;
    private String description;
    private Integer targetValue;
    private Integer currentValue;
    private Integer rewardExp;
    private Boolean isCompleted;
    private LocalDate assignedDate;
}

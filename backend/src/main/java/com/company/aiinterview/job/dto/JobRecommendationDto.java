package com.company.aiinterview.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRecommendationDto {
    private String title;
    private String company;
    private String salary;
    private String requirements;
    private String link;
}

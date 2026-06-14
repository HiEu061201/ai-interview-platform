package com.company.aiinterview.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserAnalyticsDto {
    private Long sessionId;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime date;
    private String positionRole;
    private Integer overallScore;
    private Integer technicalScore;
    private Integer clarityScore;
    private Integer confidenceScore;
}

package com.company.aiinterview.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long sessionId;
    private Integer overallScore;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer clarityScore;
    private Integer confidenceScore;
    private String strengths;
    private String weaknesses;
    private String detailedReview;
    private String improvementPlan;
    private String recommendationLevel;
    private java.util.List<QaPairDto> qaReview;
}

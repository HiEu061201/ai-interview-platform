package com.company.aiinterview.study.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InterviewNoteResponse {
    private Long id;
    private String questionContent;
    private String userContent;
    private String suggestedAnswer;
    private Integer scoreClarity;
    private Integer scoreTechnical;
    private Integer scoreConfidence;
    private String categoryTopic;
    private String createdAt;
}

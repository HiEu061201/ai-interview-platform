package com.company.aiinterview.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QaPairDto {
    private String question;
    private String answer;
    private String suggestedAnswer;
    private Integer scoreClarity;
    private Integer scoreTechnical;
    private Integer scoreConfidence;
}

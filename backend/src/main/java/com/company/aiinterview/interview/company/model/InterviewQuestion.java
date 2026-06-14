package com.company.aiinterview.interview.company.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestion {
    private String difficulty;
    private String title;
    private String frequency;
    private String acceptanceRate;
    private String link;
    private String topics;
}

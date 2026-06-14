package com.company.aiinterview.study.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudyMaterialSummaryResponse {
    private Long id;
    private String title;
    private String slug;
    private Integer displayOrder;
}

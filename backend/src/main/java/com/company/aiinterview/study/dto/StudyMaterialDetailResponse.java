package com.company.aiinterview.study.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudyMaterialDetailResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private Long categoryId;
    private String categoryName;
    private Integer displayOrder;
}

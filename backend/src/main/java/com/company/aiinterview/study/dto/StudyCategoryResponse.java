package com.company.aiinterview.study.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudyCategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Integer displayOrder;
}

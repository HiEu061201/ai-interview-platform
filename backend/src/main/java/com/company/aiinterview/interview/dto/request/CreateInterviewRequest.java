package com.company.aiinterview.interview.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateInterviewRequest {

    @NotBlank(message = "Position role is required")
    private String positionRole;

    @NotBlank(message = "Experience level is required")
    private String experienceLevel;

    @NotBlank(message = "Interview type is required")
    private String interviewType;

    @NotBlank(message = "Language is required")
    private String language;

    @Min(value = 3, message = "Target turns must be at least 3")
    @Max(value = 20, message = "Target turns must be at most 20")
    private Integer targetTurns;

    private java.util.List<String> techStack;

    private String jobDescription;

    private String resumeText;

    private Boolean isHardcore;
}

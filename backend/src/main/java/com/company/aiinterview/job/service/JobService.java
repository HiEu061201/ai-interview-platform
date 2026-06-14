package com.company.aiinterview.job.service;

import com.company.aiinterview.job.dto.JobRecommendationDto;
import java.util.List;

public interface JobService {
    List<JobRecommendationDto> getRecommendations(String keyword);
}

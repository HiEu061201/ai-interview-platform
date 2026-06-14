package com.company.aiinterview.job.controller;

import com.company.aiinterview.job.dto.JobRecommendationDto;
import com.company.aiinterview.job.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<JobRecommendationDto>> getRecommendations(
            @RequestParam(required = false, defaultValue = "Java") String keyword) {
        return ResponseEntity.ok(jobService.getRecommendations(keyword));
    }
}

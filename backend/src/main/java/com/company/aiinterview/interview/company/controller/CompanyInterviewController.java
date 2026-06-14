package com.company.aiinterview.interview.company.controller;

import com.company.aiinterview.interview.company.model.InterviewQuestion;
import com.company.aiinterview.interview.company.service.InterviewDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interviews/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow frontend to call
public class CompanyInterviewController {

    private final InterviewDataService interviewDataService;

    @GetMapping
    public ResponseEntity<List<String>> getAllCompanies() {
        return ResponseEntity.ok(interviewDataService.getAllCompanies());
    }

    @GetMapping("/{company}/questions")
    public ResponseEntity<List<InterviewQuestion>> getCompanyQuestions(@PathVariable String company) {
        return ResponseEntity.ok(interviewDataService.getQuestionsForCompany(company));
    }
}

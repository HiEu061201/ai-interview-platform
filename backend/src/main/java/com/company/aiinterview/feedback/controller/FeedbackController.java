package com.company.aiinterview.feedback.controller;

import com.company.aiinterview.feedback.dto.FeedbackResponse;
import com.company.aiinterview.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interviews/{sessionId}/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<FeedbackResponse> getFeedback(@PathVariable Long sessionId) {
        FeedbackResponse response = feedbackService.getFeedback(sessionId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/prompt")
    public ResponseEntity<java.util.Map<String, String>> getFeedbackPrompt(@PathVariable Long sessionId) {
        String prompt = feedbackService.getFeedbackPrompt(sessionId);
        return ResponseEntity.ok(java.util.Map.of("prompt", prompt));
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<FeedbackResponse> saveFeedback(@PathVariable Long sessionId, @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> payload) {
        String jsonResponse = payload.get("jsonResponse");
        if (jsonResponse == null || jsonResponse.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(feedbackService.saveFeedbackFromJson(sessionId, jsonResponse));
    }

    @org.springframework.web.bind.annotation.PostMapping("/generate")
    public ResponseEntity<FeedbackResponse> generateFeedback(@PathVariable Long sessionId) {
        return ResponseEntity.ok(feedbackService.generateAndSaveFeedback(sessionId));
    }
}

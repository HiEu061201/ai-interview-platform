package com.company.aiinterview.feedback.service;

import com.company.aiinterview.feedback.dto.FeedbackResponse;

public interface FeedbackService {
    FeedbackResponse getFeedback(Long sessionId);
    String getFeedbackPrompt(Long sessionId);
    FeedbackResponse saveFeedbackFromJson(Long sessionId, String jsonResponse);
    FeedbackResponse generateAndSaveFeedback(Long sessionId);
}

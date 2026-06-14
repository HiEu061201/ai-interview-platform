package com.company.aiinterview.feedback.service.impl;

import com.company.aiinterview.ai.service.AiService;
import com.company.aiinterview.chat.entity.ChatMessage;
import com.company.aiinterview.chat.repository.ChatMessageRepository;
import com.company.aiinterview.common.security.SecurityUtils;
import com.company.aiinterview.exception.AppException;
import com.company.aiinterview.exception.ErrorCode;
import com.company.aiinterview.feedback.dto.FeedbackResponse;
import com.company.aiinterview.feedback.entity.InterviewFeedback;
import com.company.aiinterview.feedback.repository.InterviewFeedbackRepository;
import com.company.aiinterview.feedback.service.FeedbackService;
import com.company.aiinterview.interview.entity.InterviewSession;
import com.company.aiinterview.interview.repository.InterviewSessionRepository;
import com.company.aiinterview.user.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.gemini.service.GeminiService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackServiceImpl implements FeedbackService {

    private final InterviewFeedbackRepository feedbackRepository;
    private final InterviewSessionRepository sessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AiService aiService;
    private final SecurityUtils securityUtils;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public FeedbackResponse getFeedback(Long sessionId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied to this session");
        }

        Optional<InterviewFeedback> existingFeedback = feedbackRepository.findBySessionId(sessionId);
        if (existingFeedback.isPresent()) {
            List<ChatMessage> chatHistory = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
            FeedbackResponse response = mapToResponse(existingFeedback.get());
            response.setQaReview(buildQaReview(chatHistory));
            return response;
        }

        return null; // Return null to indicate feedback not yet generated
    }

    @Override
    @Transactional
    public FeedbackResponse generateAndSaveFeedback(Long sessionId) {
        String prompt = getFeedbackPrompt(sessionId);
        String jsonResponse = geminiService.generateText(prompt);
        return saveFeedbackFromJson(sessionId, jsonResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public String getFeedbackPrompt(Long sessionId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied to this session");
        }

        List<ChatMessage> chatHistory = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        if (chatHistory.isEmpty()) {
            throw new IllegalStateException("Cannot generate feedback for an empty session");
        }

        return aiService.buildFeedbackPrompt(session, chatHistory);
    }

    @Override
    @Transactional
    public FeedbackResponse saveFeedbackFromJson(Long sessionId, String jsonResponse) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied to this session");
        }

        // Check if already exists
        if (feedbackRepository.findBySessionId(sessionId).isPresent()) {
            return getFeedback(sessionId);
        }

        InterviewFeedback feedback = new InterviewFeedback();
        feedback.setSession(session);

        try {
            // Clean up Markdown JSON block if AI adds it
            if (jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7);
            }
            if (jsonResponse.endsWith("```")) {
                jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 3);
            }

            JsonNode resultNode = objectMapper.readTree(jsonResponse.trim());
            feedback.setOverallScore(resultNode.path("overallScore").asInt(0));
            feedback.setTechnicalScore(resultNode.path("technicalScore").asInt(0));
            feedback.setCommunicationScore(resultNode.path("communicationScore").asInt(0));
            feedback.setClarityScore(resultNode.path("clarityScore").asInt(0));
            feedback.setConfidenceScore(resultNode.path("confidenceScore").asInt(0));
            feedback.setStrengths(resultNode.path("strengths").asText());
            feedback.setWeaknesses(resultNode.path("weaknesses").asText());
            feedback.setDetailedReview(resultNode.path("detailedReview").asText());
            feedback.setImprovementPlan(resultNode.path("improvementPlan").asText());
            feedback.setRecommendationLevel(resultNode.path("recommendationLevel").asText());
        } catch (Exception e) {
            log.error("Failed to parse AI feedback JSON", e);
            throw new RuntimeException("Failed to generate feedback", e);
        }

        InterviewFeedback savedFeedback = feedbackRepository.save(feedback);

        session.setOverallAiSummary(savedFeedback.getDetailedReview());
        session.setOverallScore(savedFeedback.getOverallScore());
        sessionRepository.save(session);

        List<ChatMessage> chatHistory = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        FeedbackResponse response = mapToResponse(savedFeedback);
        response.setQaReview(buildQaReview(chatHistory));
        return response;
    }

    private List<com.company.aiinterview.feedback.dto.QaPairDto> buildQaReview(List<ChatMessage> chatHistory) {
        List<com.company.aiinterview.feedback.dto.QaPairDto> pairs = new java.util.ArrayList<>();
        String currentQuestion = null;

        for (ChatMessage msg : chatHistory) {
            if ("AI".equals(msg.getSender().name())) {
                currentQuestion = msg.getMessageContent();
            } else if ("USER".equals(msg.getSender().name())) {
                if (currentQuestion != null) {
                    pairs.add(com.company.aiinterview.feedback.dto.QaPairDto.builder()
                            .question(currentQuestion)
                            .answer(msg.getMessageContent())
                            .suggestedAnswer(msg.getSuggestedAnswer())
                            .scoreClarity(msg.getScoreClarity())
                            .scoreTechnical(msg.getScoreTechnical())
                            .scoreConfidence(msg.getScoreConfidence())
                            .build());
                    currentQuestion = null;
                }
            }
        }
        return pairs;
    }

    private FeedbackResponse mapToResponse(InterviewFeedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .sessionId(feedback.getSession().getId())
                .overallScore(feedback.getOverallScore())
                .technicalScore(feedback.getTechnicalScore())
                .communicationScore(feedback.getCommunicationScore())
                .clarityScore(feedback.getClarityScore())
                .confidenceScore(feedback.getConfidenceScore())
                .strengths(feedback.getStrengths())
                .weaknesses(feedback.getWeaknesses())
                .detailedReview(feedback.getDetailedReview())
                .improvementPlan(feedback.getImprovementPlan())
                .recommendationLevel(feedback.getRecommendationLevel())
                .build();
    }
}

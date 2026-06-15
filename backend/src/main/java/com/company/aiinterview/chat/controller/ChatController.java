package com.company.aiinterview.chat.controller;

import com.company.aiinterview.ai.service.AiService;
import com.company.aiinterview.chat.dto.IncomingMessage;
import com.company.aiinterview.chat.dto.OutgoingMessage;
import com.company.aiinterview.chat.entity.ChatMessage;
import com.company.aiinterview.chat.entity.Sender;
import com.company.aiinterview.chat.repository.ChatMessageRepository;
import com.company.aiinterview.interview.entity.InterviewSession;
import com.company.aiinterview.interview.entity.InterviewStatus;
import com.company.aiinterview.interview.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final InterviewSessionRepository sessionRepository;
    private final AiService aiService;


    @MessageMapping("/chat.sendMessage")
    @Transactional
    public void sendMessage(@Payload IncomingMessage incomingMessage, SimpMessageHeaderAccessor headerAccessor) {
        Long sessionId = incomingMessage.getSessionId();
        log.info("Received message for session {}: {}", sessionId, incomingMessage.getContent());

        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (session.getStatus() == InterviewStatus.COMPLETED || session.getStatus() == InterviewStatus.CANCELLED) {
            log.warn("Attempted to send message to a completed or cancelled session: {}", sessionId);
            return;
        }

        int currentTurn = session.getCurrentTurn() == null ? 0 : session.getCurrentTurn();

        // Save User Message
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .sender(Sender.USER)
                .messageContent(incomingMessage.getContent())
                .messageType("TEXT")
                .turnNo(currentTurn + 1)
                .build();
        userMessage = chatMessageRepository.save(userMessage);

        // Fetch History
        List<ChatMessage> chatHistory = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        // Send THINKING indicator to Topic (handled by frontend now, but keeping for compatibility)
        // We will send REQUIRE_PUTER_AI to tell frontend to call puter
        String prompt = aiService.buildPrompt(session, chatHistory, incomingMessage.getContent());

        Map<String, Object> requirePuterCommand = new HashMap<>();
        requirePuterCommand.put("type", "REQUIRE_PUTER_AI");
        requirePuterCommand.put("prompt", prompt);
        messagingTemplate.convertAndSend("/topic/interview/" + sessionId, requirePuterCommand);
    }

    @MessageMapping("/chat.saveAiResponse")
    @Transactional
    public void saveAiResponse(@Payload com.company.aiinterview.chat.dto.SaveAiResponsePayload payload, SimpMessageHeaderAccessor headerAccessor) {
        Long sessionId = payload.getSessionId();
        String jsonResponse = payload.getJsonResponse();
        log.info("Received AI response from Puter frontend for session {}", sessionId);

        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (session.getStatus() == InterviewStatus.COMPLETED || session.getStatus() == InterviewStatus.CANCELLED) {
            log.warn("Attempted to save AI response for a completed or cancelled session: {}", sessionId);
            return;
        }

        int currentTurn = session.getCurrentTurn() == null ? 0 : session.getCurrentTurn();

        // Get the latest user message to update with scores
        List<ChatMessage> userMessages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .filter(m -> m.getSender() == Sender.USER)
                .toList();
                
        ChatMessage lastUserMessage = null;
        if (!userMessages.isEmpty()) {
            lastUserMessage = userMessages.get(userMessages.size() - 1);
        }

        OutgoingMessage aiResponse = aiService.parseAiResponse(jsonResponse);

        if (lastUserMessage != null) {
            // Update user message with evaluation
            lastUserMessage.setScoreClarity(aiResponse.getClarity());
            lastUserMessage.setScoreTechnical(aiResponse.getTechnicalDepth());
            lastUserMessage.setScoreConfidence(aiResponse.getConfidence());
            lastUserMessage.setSuggestedAnswer(aiResponse.getSuggestedAnswer());
            lastUserMessage.setCategoryTopic(aiResponse.getCategoryTopic());
            chatMessageRepository.save(lastUserMessage);
        }

        // Save AI Message
        ChatMessage aiDbMessage = ChatMessage.builder()
                .session(session)
                .sender(Sender.AI)
                .messageContent(aiResponse.getContent())
                .messageType("TEXT")
                .turnNo(currentTurn)
                .modelName("puter-ai")
                .build();
        chatMessageRepository.save(aiDbMessage);

        // Update Session Turn
        session.setCurrentTurn(currentTurn);
        sessionRepository.save(session);

        // Add type to the response so frontend can differentiate
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("type", "AI_RESPONSE");
        responseMap.put("sender", aiResponse.getSender());
        responseMap.put("content", aiResponse.getContent());
        responseMap.put("clarity", aiResponse.getClarity());
        responseMap.put("technicalDepth", aiResponse.getTechnicalDepth());
        responseMap.put("confidence", aiResponse.getConfidence());
        responseMap.put("suggestedAnswer", aiResponse.getSuggestedAnswer());
        responseMap.put("categoryTopic", aiResponse.getCategoryTopic());

        // Send back to Topic
        messagingTemplate.convertAndSend("/topic/interview/" + sessionId, responseMap);
    }
}

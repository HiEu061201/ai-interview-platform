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
import com.example.gemini.service.GeminiService;
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
    private final GeminiService geminiService;

    @org.springframework.beans.factory.annotation.Value("${app.deepseek.model:deepseek-chat}")
    private String deepseekModel;

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

        // Send THINKING indicator to Topic
        Map<String, Object> thinkingCommand = new HashMap<>();
        thinkingCommand.put("type", "THINKING");
        messagingTemplate.convertAndSend("/topic/interview/" + sessionId, thinkingCommand);

        // Process AI Response - Build prompt for backend execution
        String prompt = aiService.buildPrompt(session, chatHistory, incomingMessage.getContent());
        String jsonResponse = geminiService.generateText(prompt);

        log.info("Received AI response for session {}: {}", sessionId, jsonResponse);
        OutgoingMessage aiResponse = aiService.parseAiResponse(jsonResponse);

        // Update user message with evaluation
        userMessage.setScoreClarity(aiResponse.getClarity());
        userMessage.setScoreTechnical(aiResponse.getTechnicalDepth());
        userMessage.setScoreConfidence(aiResponse.getConfidence());
        userMessage.setSuggestedAnswer(aiResponse.getSuggestedAnswer());
        userMessage.setCategoryTopic(aiResponse.getCategoryTopic());
        chatMessageRepository.save(userMessage);

        // Save AI Message
        ChatMessage aiDbMessage = ChatMessage.builder()
                .session(session)
                .sender(Sender.AI)
                .messageContent(aiResponse.getContent())
                .messageType("TEXT")
                .turnNo(currentTurn + 1)
                .modelName(deepseekModel)
                .build();
        chatMessageRepository.save(aiDbMessage);

        // Update Session Turn
        session.setCurrentTurn(currentTurn + 1);
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

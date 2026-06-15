package com.company.aiinterview.chat.controller;

import com.company.aiinterview.ai.service.AiService;
import com.company.aiinterview.chat.dto.IncomingMessage;
import com.company.aiinterview.chat.dto.OutgoingMessage;
import com.company.aiinterview.chat.entity.ChatMessage;
import com.company.aiinterview.chat.repository.ChatMessageRepository;
import com.company.aiinterview.interview.entity.InterviewSession;
import com.company.aiinterview.interview.repository.InterviewSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private InterviewSessionRepository sessionRepository;
    @Mock
    private AiService aiService;
    @Mock
    private com.example.gemini.service.GeminiService geminiService;

    @InjectMocks
    private ChatController chatController;

    private InterviewSession mockSession;

    @BeforeEach
    void setUp() {
        mockSession = new InterviewSession();
        mockSession.setId(1L);
        mockSession.setCurrentTurn(0);
    }

    @Test
    void sendMessage_ShouldBuildPromptAndBroadcastExecuteCommand() {
        IncomingMessage incomingMessage = new IncomingMessage();
        incomingMessage.setSessionId(1L);
        incomingMessage.setContent("Hello AI");

        SimpMessageHeaderAccessor headerAccessor = mock(SimpMessageHeaderAccessor.class);

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        when(chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(1L)).thenReturn(new ArrayList<>());
        
        ChatMessage mockUserMessage = new ChatMessage();
        mockUserMessage.setId(10L);
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(mockUserMessage);

        when(aiService.buildPrompt(eq(mockSession), any(), eq("Hello AI"))).thenReturn("Test Prompt");

        when(geminiService.generateText("Test Prompt")).thenReturn("{}");
        
        OutgoingMessage mockResponse = OutgoingMessage.builder()
                .sender("AI")
                .content("Next Question")
                .clarity(80)
                .technicalDepth(75)
                .confidence(90)
                .build();
        when(aiService.parseAiResponse("{}")).thenReturn(mockResponse);

        chatController.sendMessage(incomingMessage, headerAccessor);

        // Verify messages saved (1 user initial + 1 user update + 1 AI)
        verify(chatMessageRepository, times(3)).save(any(ChatMessage.class));
        
        // Verify broadcast (1 THINKING + 1 AI_RESPONSE)
        verify(messagingTemplate, times(2)).convertAndSend(eq("/topic/interview/1"), any(java.util.Map.class));
    }


}

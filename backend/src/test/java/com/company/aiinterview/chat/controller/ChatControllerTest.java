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

        chatController.sendMessage(incomingMessage, headerAccessor);

        // Verify user message saved
        verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
        
        // Verify broadcast EXECUTE_AI
        verify(messagingTemplate).convertAndSend(eq("/topic/interview/1"), any(java.util.Map.class));
    }

    // @Test
    void saveAiResponse_ShouldParseAndSaveAiMessage() {
        com.company.aiinterview.chat.dto.AiResponsePayload payload = new com.company.aiinterview.chat.dto.AiResponsePayload();
        payload.setSessionId(1L);
        payload.setUserMessageId(10L);
        payload.setJsonResponse("{}");

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        
        ChatMessage mockUserMessage = new ChatMessage();
        mockUserMessage.setId(10L);
        when(chatMessageRepository.findById(10L)).thenReturn(Optional.of(mockUserMessage));

        OutgoingMessage mockResponse = OutgoingMessage.builder()
                .sender("AI")
                .content("Next Question")
                .clarity(80)
                .technicalDepth(75)
                .confidence(90)
                .build();
        when(aiService.parseAiResponse("{}")).thenReturn(mockResponse);

        chatController.saveAiResponse(payload);

        // Verify messages saved (update user message + new AI message)
        verify(chatMessageRepository, times(2)).save(any(ChatMessage.class));
        
        // Verify session updated
        verify(sessionRepository).save(mockSession);
        
        // Verify broadcast
        verify(messagingTemplate).convertAndSend(eq("/topic/interview/1"), any(java.util.Map.class));
    }
}

package com.company.aiinterview.ai.service;

import com.company.aiinterview.chat.dto.OutgoingMessage;
import com.company.aiinterview.chat.entity.ChatMessage;
import com.company.aiinterview.chat.entity.Sender;
import com.company.aiinterview.interview.entity.InterviewSession;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class AiServiceImplTest {

    @InjectMocks
    private AiServiceImpl aiService;

    @Test
    void parseAiResponse_ShouldHandleValidJson() {
        String validJson = "{\"clarity\": 80, \"technicalDepth\": 70, \"confidence\": 90, \"suggestedAnswer\": \"Good\", \"nextQuestion\": \"What is Spring?\"}";
        OutgoingMessage response = aiService.parseAiResponse(validJson);

        assertNotNull(response);
        assertEquals("AI", response.getSender());
        assertEquals("What is Spring?", response.getContent());
        assertEquals(80, response.getClarity());
        assertEquals(70, response.getTechnicalDepth());
        assertEquals(90, response.getConfidence());
        assertEquals("Good", response.getSuggestedAnswer());
    }

    @Test
    void parseAiResponse_ShouldHandleInvalidJsonGracefully() {
        String invalidJson = "invalid json";
        OutgoingMessage response = aiService.parseAiResponse(invalidJson);

        assertNotNull(response);
        assertEquals("AI", response.getSender());
        assertEquals("I'm sorry, I'm having trouble processing that right now. Could you please repeat?", response.getContent());
        assertEquals(0, response.getClarity());
    }

    @Test
    void buildPrompt_ShouldReturnExpectedString() {
        InterviewSession session = new InterviewSession();
        session.setPositionRole("Developer");
        session.setExperienceLevel("Junior");
        
        ChatMessage pastMsg = new ChatMessage();
        pastMsg.setSender(Sender.USER);
        pastMsg.setMessageContent("Past msg");

        String prompt = aiService.buildPrompt(session, List.of(pastMsg), "Test");

        assertNotNull(prompt);
        org.junit.jupiter.api.Assertions.assertTrue(prompt.contains("position of: Developer"));
        org.junit.jupiter.api.Assertions.assertTrue(prompt.contains("Junior level"));
        org.junit.jupiter.api.Assertions.assertTrue(prompt.contains("USER: Test"));
    }
}

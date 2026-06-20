package com.company.aiinterview.ai.service;

import com.company.aiinterview.chat.dto.OutgoingMessage;
import com.company.aiinterview.chat.entity.ChatMessage;
import com.company.aiinterview.interview.entity.InterviewSession;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String buildPrompt(InterviewSession session, List<ChatMessage> chatHistory, String latestUserMessage) {
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder
                .append("You are an expert AI interviewer. The candidate is interviewing for the position of: ")
                .append(session.getPositionRole())
                .append(" at a ").append(session.getExperienceLevel()).append(" level.\n");
        
        String cvContext = "";
        if (session.getResumeText() != null && !session.getResumeText().trim().isEmpty()) {
            cvContext = String.format("""
                    CANDIDATE CV / RESUME:
                    ```
                    %s
                    ```
                    """, session.getResumeText());
        }
        contextBuilder.append(cvContext);

        if (session.getTechStack() != null && !session.getTechStack().isBlank()) {
            contextBuilder.append("The candidate's tech stack / key skills: ").append(session.getTechStack()).append(".\n");
        }
        if (session.getJobDescription() != null && !session.getJobDescription().isBlank()) {
            contextBuilder.append("The job description is: ").append(session.getJobDescription()).append("\n");
        }
        contextBuilder.append("\n");

        if (Boolean.TRUE.equals(session.getIsHardcore())) {
            contextBuilder.append("HARDCORE MODE ACTIVE: You must be extremely strict, aggressive, and ask highly difficult, deeply technical or stressful questions. Do not praise the candidate easily. Point out flaws aggressively.\n\n");
        }

        contextBuilder.append("Here is the conversation history so far:\n");
        for (ChatMessage msg : chatHistory) {
            contextBuilder.append(msg.getSender().name()).append(": ").append(msg.getMessageContent()).append("\n");
        }
        contextBuilder.append("USER: ").append(latestUserMessage).append("\n\n");

        contextBuilder.append("Evaluate the USER's latest answer and provide the next interview question. ")
                .append("IMPORTANT: You MUST communicate and ask your next question in Vietnamese. ")
                .append("CRITICAL RULE: You must ask EXACTLY ONE single, focused question at a time. Do NOT ask multiple questions, sub-questions, or multi-part questions in a single response.\n")
                .append("You MUST return your response as a pure JSON object without markdown formatting, with the following keys:\n")
                .append("- 'clarity': integer 0-100\n")
                .append("- 'technicalDepth': integer 0-100\n")
                .append("- 'confidence': integer 0-100\n")
                .append("- 'suggestedAnswer': string, a better way the user could have answered the previous question (leave empty if their answer was good enough or if they just greeted)\n")
                .append("- 'categoryTopic': string, classify the core topic of the PREVIOUS question/answer (e.g., 'Java', 'System Design', 'Database', 'Behavioral', 'Networking', 'React'). Keep it to 1-2 words. Leave empty if N/A.\n")
                .append("- 'nextQuestion': string, the text of your next question.\n");

        return contextBuilder.toString();
    }

    @Override
    public OutgoingMessage parseAiResponse(String jsonResponse) {
        try {
            // Clean up Markdown JSON block if AI adds it
            if (jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7);
            }
            if (jsonResponse.endsWith("```")) {
                jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 3);
            }

            JsonNode resultNode = objectMapper.readTree(jsonResponse.trim());

            return OutgoingMessage.builder()
                    .sender("AI")
                    .content(resultNode.path("nextQuestion").asText())
                    .clarity(resultNode.path("clarity").asInt(0))
                    .technicalDepth(resultNode.path("technicalDepth").asInt(0))
                    .confidence(resultNode.path("confidence").asInt(0))
                    .suggestedAnswer(resultNode.path("suggestedAnswer").asText(""))
                    .categoryTopic(resultNode.path("categoryTopic").asText("Khác"))
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse AI response JSON", e);
            return OutgoingMessage.builder()
                    .sender("AI")
                    .content("I'm sorry, I'm having trouble processing that right now. Could you please repeat?")
                    .clarity(0).technicalDepth(0).confidence(0)
                    .build();
        }
    }

    @Override
    public String buildFeedbackPrompt(InterviewSession session, List<ChatMessage> chatHistory) {
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("You are an expert AI interviewer. The interview for the position of ")
                .append(session.getPositionRole())
                .append(" at a ").append(session.getExperienceLevel()).append(" level has concluded.\n");

        if (session.getTechStack() != null && !session.getTechStack().isBlank()) {
            contextBuilder.append("The candidate's tech stack / key skills: ").append(session.getTechStack()).append(".\n");
        }
        if (session.getJobDescription() != null && !session.getJobDescription().isBlank()) {
            contextBuilder.append("The job description was: ").append(session.getJobDescription()).append("\n");
        }
        contextBuilder.append("\n");

        contextBuilder.append("Here is the entire conversation history:\n");
        for (ChatMessage msg : chatHistory) {
            contextBuilder.append(msg.getSender().name()).append(": ").append(msg.getMessageContent()).append("\n");
        }
        contextBuilder.append("\n");

        contextBuilder.append("Please evaluate the overall performance of the USER. ")
                .append("IMPORTANT: You MUST write your detailed review, strengths, weaknesses, and improvement plan entirely in Vietnamese.\n")
                .append("You MUST return your response as a pure JSON object without markdown formatting, with the following keys:\n")
                .append("- 'overallScore': integer 0-100\n")
                .append("- 'technicalScore': integer 0-100\n")
                .append("- 'communicationScore': integer 0-100\n")
                .append("- 'clarityScore': integer 0-100\n")
                .append("- 'confidenceScore': integer 0-100\n")
                .append("- 'strengths': string (bullet points separated by \\n)\n")
                .append("- 'weaknesses': string (bullet points separated by \\n)\n")
                .append("- 'detailedReview': string (overall summary)\n")
                .append("- 'improvementPlan': string (bullet points separated by \\n)\n")
                .append("- 'recommendationLevel': string (e.g., 'Strong Hire', 'Hire', 'Leaning Hire', 'No Hire')\n");

        return contextBuilder.toString();
    }
}

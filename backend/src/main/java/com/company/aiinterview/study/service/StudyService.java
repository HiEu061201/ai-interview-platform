package com.company.aiinterview.study.service;

import com.company.aiinterview.exception.AppException;
import com.company.aiinterview.exception.ErrorCode;
import com.company.aiinterview.study.dto.InterviewNoteResponse;
import com.company.aiinterview.study.dto.StudyCategoryResponse;
import com.company.aiinterview.study.dto.StudyMaterialDetailResponse;
import com.company.aiinterview.study.dto.StudyMaterialSummaryResponse;
import com.company.aiinterview.study.entity.StudyCategory;
import com.company.aiinterview.study.entity.StudyMaterial;
import com.company.aiinterview.study.repository.StudyCategoryRepository;
import com.company.aiinterview.study.repository.StudyMaterialRepository;
import com.company.aiinterview.chat.repository.ChatMessageRepository;
import com.company.aiinterview.chat.entity.ChatMessage;
import com.company.aiinterview.common.security.SecurityUtils;
import com.company.aiinterview.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final StudyCategoryRepository categoryRepository;
    private final StudyMaterialRepository materialRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<StudyCategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(cat -> StudyCategoryResponse.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .slug(cat.getSlug())
                        .description(cat.getDescription())
                        .displayOrder(cat.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudyMaterialSummaryResponse> getMaterialsByCategorySlug(String categorySlug) {
        StudyCategory category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR)); // Using existing error code or creating new

        return materialRepository.findByCategoryIdOrderByDisplayOrderAsc(category.getId()).stream()
                .map(mat -> StudyMaterialSummaryResponse.builder()
                        .id(mat.getId())
                        .title(mat.getTitle())
                        .slug(mat.getSlug())
                        .displayOrder(mat.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyMaterialDetailResponse getMaterialDetail(String materialSlug) {
        StudyMaterial material = materialRepository.findBySlug(materialSlug)
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR)); // Generic error for now

        return StudyMaterialDetailResponse.builder()
                .id(material.getId())
                .title(material.getTitle())
                .slug(material.getSlug())
                .content(material.getContent())
                .categoryId(material.getCategory().getId())
                .categoryName(material.getCategory().getName())
                .displayOrder(material.getDisplayOrder())
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, List<InterviewNoteResponse>> getMyNotes() {
        User user = securityUtils.getCurrentUser();
        List<ChatMessage> mistakes = chatMessageRepository.findUserMistakes(user.getId());
        
        List<InterviewNoteResponse> allNotes = mistakes.stream().map(msg -> {
            String question = "What was the question?";
            
            // Try to find the preceding AI question
            List<ChatMessage> sessionHistory = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(msg.getSession().getId());
            for (int i = 0; i < sessionHistory.size(); i++) {
                if (sessionHistory.get(i).getId().equals(msg.getId()) && i > 0) {
                    question = sessionHistory.get(i - 1).getMessageContent();
                    break;
                }
            }

            return InterviewNoteResponse.builder()
                    .id(msg.getId())
                    .questionContent(question)
                    .userContent(msg.getMessageContent())
                    .suggestedAnswer(msg.getSuggestedAnswer())
                    .scoreClarity(msg.getScoreClarity())
                    .scoreTechnical(msg.getScoreTechnical())
                    .scoreConfidence(msg.getScoreConfidence())
                    .categoryTopic(msg.getCategoryTopic() != null ? msg.getCategoryTopic() : "Chung")
                    .createdAt(msg.getCreatedAt().toString())
                    .build();
        }).collect(Collectors.toList());

        // Group by categoryTopic
        return allNotes.stream().collect(Collectors.groupingBy(InterviewNoteResponse::getCategoryTopic));
    }
}

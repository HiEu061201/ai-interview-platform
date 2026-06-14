package com.company.aiinterview.interview.service.impl;

import com.company.aiinterview.common.security.SecurityUtils;
import com.company.aiinterview.exception.AppException;
import com.company.aiinterview.exception.ErrorCode;
import com.company.aiinterview.interview.dto.request.CreateInterviewRequest;
import com.company.aiinterview.interview.dto.response.InterviewSessionResponse;
import com.company.aiinterview.interview.entity.InterviewSession;
import com.company.aiinterview.interview.entity.InterviewStatus;
import com.company.aiinterview.interview.repository.InterviewSessionRepository;
import com.company.aiinterview.interview.service.InterviewService;
import com.company.aiinterview.gamification.service.QuestService;
import com.company.aiinterview.user.entity.User;
import com.company.aiinterview.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewServiceImpl implements InterviewService {

    private final InterviewSessionRepository interviewSessionRepository;
    private final SecurityUtils securityUtils;
    private final UserRepository userRepository;
    private final QuestService questService;

    @Override
    @Transactional
    public InterviewSessionResponse createSession(CreateInterviewRequest request) {
        User user = securityUtils.getCurrentUser();

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .positionRole(request.getPositionRole())
                .experienceLevel(request.getExperienceLevel())
                .interviewType(request.getInterviewType())
                .language(request.getLanguage())
                .status(InterviewStatus.IN_PROGRESS)
                .currentTurn(0)
                .targetTurns(request.getTargetTurns() != null ? request.getTargetTurns() : 5)
                .techStack(request.getTechStack() != null ? String.join(", ", request.getTechStack()) : null)
                .jobDescription(request.getJobDescription())
                .resumeText(request.getResumeText())
                .isHardcore(request.getIsHardcore() != null ? request.getIsHardcore() : false)
                .startedAt(LocalDateTime.now())
                .build();

        InterviewSession saved = interviewSessionRepository.save(session);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewSessionResponse getSession(Long sessionId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied to this session");
        }

        return mapToResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InterviewSessionResponse> getMySessions(Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        Page<InterviewSession> sessions = interviewSessionRepository
                .findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable);

        return sessions.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void cancelSession(Long sessionId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied to this session");
        }

        if (session.getStatus() == InterviewStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a finished session");
        }

        session.setStatus(InterviewStatus.CANCELLED);
        session.setEndedAt(LocalDateTime.now());
        interviewSessionRepository.save(session);
    }

    @Override
    @Transactional
    public void finishSession(Long sessionId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied to this session");
        }

        session.setStatus(InterviewStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        
        if (session.getStartedAt() != null) {
            long durationSeconds = ChronoUnit.SECONDS.between(session.getStartedAt(), session.getEndedAt());
            session.setDurationSeconds((int) durationSeconds);
        }

        // Add Gamification EXP
        User user = session.getUser();
        int currentExp = user.getExp() != null ? user.getExp() : 0;
        int currentLevel = user.getLevel() != null ? user.getLevel() : 1;
        
        currentExp += 50;
        int requiredExp = currentLevel * 100;
        if (currentExp >= requiredExp) {
            currentLevel++;
            currentExp -= requiredExp;
        }
        
        user.setExp(currentExp);
        user.setLevel(currentLevel);
        userRepository.save(user);

        interviewSessionRepository.save(session);
        
        // Process Quests
        questService.processInterviewCompletion(session);
    }

    @Override
    public java.util.Map<String, String> extractCv(MultipartFile file) {
        try (InputStream is = file.getInputStream();
             PDDocument document = org.apache.pdfbox.Loader.loadPDF(is.readAllBytes())) {
             
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(document);
            
            return java.util.Map.of("text", extractedText);
            
        } catch (Exception e) {
            log.error("Failed to parse PDF file", e);
            throw new RuntimeException("Failed to extract text from PDF: " + e.getMessage());
        }
    }

    private InterviewSessionResponse mapToResponse(InterviewSession session) {
        return InterviewSessionResponse.builder()
                .id(session.getId())
                .positionRole(session.getPositionRole())
                .experienceLevel(session.getExperienceLevel())
                .interviewType(session.getInterviewType())
                .language(session.getLanguage())
                .status(session.getStatus() != null ? session.getStatus().name() : null)
                .currentTurn(session.getCurrentTurn())
                .targetTurns(session.getTargetTurns())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .durationSeconds(session.getDurationSeconds())
                .overallAiSummary(session.getOverallAiSummary())
                .overallScore(session.getOverallScore())
                .createdAt(session.getCreatedAt())
                .build();
    }
}

package com.company.aiinterview.user.service.impl;

import com.company.aiinterview.common.security.SecurityUtils;
import com.company.aiinterview.user.dto.UserProfileDto;
import com.company.aiinterview.user.dto.UserAnalyticsDto;
import com.company.aiinterview.feedback.repository.InterviewFeedbackRepository;
import com.company.aiinterview.feedback.entity.InterviewFeedback;
import com.company.aiinterview.user.entity.User;
import com.company.aiinterview.user.repository.UserRepository;
import com.company.aiinterview.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final SecurityUtils securityUtils;

    @Override
    public UserProfileDto getProfile() {
        User user = securityUtils.getCurrentUser();
        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    public List<UserAnalyticsDto> getAnalytics() {
        User user = securityUtils.getCurrentUser();
        List<InterviewFeedback> feedbacks = feedbackRepository.findBySessionUserIdOrderBySessionCreatedAtAsc(user.getId());
        
        return feedbacks.stream().map(f -> UserAnalyticsDto.builder()
                .sessionId(f.getSession().getId())
                .date(f.getSession().getCreatedAt())
                .positionRole(f.getSession().getPositionRole())
                .overallScore(f.getOverallScore())
                .technicalScore(f.getTechnicalScore())
                .clarityScore(f.getClarityScore())
                .confidenceScore(f.getConfidenceScore())
                .build()
        ).collect(Collectors.toList());
    }
}

package com.company.aiinterview.interview.service;

import com.company.aiinterview.interview.dto.request.CreateInterviewRequest;
import com.company.aiinterview.interview.dto.response.InterviewSessionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InterviewService {
    InterviewSessionResponse createSession(CreateInterviewRequest request);
    InterviewSessionResponse getSession(Long sessionId);
    Page<InterviewSessionResponse> getMySessions(Pageable pageable);
    void cancelSession(Long sessionId);
    void finishSession(Long sessionId);
    java.util.Map<String, String> extractCv(org.springframework.web.multipart.MultipartFile file);
}

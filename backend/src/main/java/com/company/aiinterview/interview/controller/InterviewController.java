package com.company.aiinterview.interview.controller;

import com.company.aiinterview.interview.dto.request.CreateInterviewRequest;
import com.company.aiinterview.interview.dto.response.InterviewSessionResponse;
import com.company.aiinterview.interview.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<InterviewSessionResponse> createSession(@Valid @RequestBody CreateInterviewRequest request) {
        return ResponseEntity.ok(interviewService.createSession(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewSessionResponse> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getSession(id));
    }

    @GetMapping
    public ResponseEntity<Page<InterviewSessionResponse>> getMySessions(Pageable pageable) {
        return ResponseEntity.ok(interviewService.getMySessions(pageable));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelSession(@PathVariable Long id) {
        interviewService.cancelSession(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/finish")
    public ResponseEntity<Void> finishSession(@PathVariable Long id) {
        interviewService.finishSession(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/extract-cv")
    public ResponseEntity<java.util.Map<String, String>> extractCv(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty() || !file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(interviewService.extractCv(file));
    }
}

package com.company.aiinterview.study.controller;

import com.company.aiinterview.study.dto.StudyCategoryResponse;
import com.company.aiinterview.study.dto.InterviewNoteResponse;
import com.company.aiinterview.study.dto.StudyMaterialDetailResponse;
import com.company.aiinterview.study.dto.StudyMaterialSummaryResponse;
import com.company.aiinterview.study.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudyController {

    private final StudyService studyService;

    @GetMapping("/categories")
    public ResponseEntity<List<StudyCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(studyService.getAllCategories());
    }

    @GetMapping("/categories/{categorySlug}/materials")
    public ResponseEntity<List<StudyMaterialSummaryResponse>> getMaterialsByCategory(@PathVariable String categorySlug) {
        return ResponseEntity.ok(studyService.getMaterialsByCategorySlug(categorySlug));
    }

    @GetMapping("/materials/{materialSlug}")
    public ResponseEntity<StudyMaterialDetailResponse> getMaterialDetail(@PathVariable String materialSlug) {
        return ResponseEntity.ok(studyService.getMaterialDetail(materialSlug));
    }

    @GetMapping("/my-notes")
    public ResponseEntity<Map<String, List<InterviewNoteResponse>>> getMyNotes() {
        return ResponseEntity.ok(studyService.getMyNotes());
    }
}

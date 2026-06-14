package com.example.gemini.controller;

import com.example.gemini.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/gemini")
@CrossOrigin(origins = "*")
public class GeminiChatController {

    private final GeminiService geminiService;

    public GeminiChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tham số 'prompt' không được để trống."));
        }

        String aiResponse = geminiService.generateText(prompt);
        
        return ResponseEntity.ok(Map.of(
                "prompt", prompt,
                "response", aiResponse
        ));
    }
}

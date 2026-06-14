package com.example.gemini.service.impl;

import com.example.gemini.dto.GeminiRequest;
import com.example.gemini.dto.GeminiResponse;
import com.example.gemini.service.GeminiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class GeminiServiceImpl implements GeminiService {

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;

    public GeminiServiceImpl(
            RestTemplate restTemplate,
            @Value("${gemini.api.url}") String apiUrl,
            @Value("${gemini.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    @Override
    public String generateText(String prompt) {
        try {
            GeminiRequest requestBody = GeminiRequest.fromPrompt(prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

            log.info("Đang gửi yêu cầu tới Gemini API với prompt: {}", prompt);
            GeminiResponse response = restTemplate.postForObject(apiUrl, entity, GeminiResponse.class);

            if (response != null) {
                return response.getFirstTextResponse();
            }
        } catch (Exception e) {
            log.error("Lỗi xảy ra khi gọi kết nối tới Gemini API: ", e);
            return "Đã xảy ra lỗi hệ thống: " + e.getMessage();
        }
        return "Kết quả trả về trống.";
    }
}

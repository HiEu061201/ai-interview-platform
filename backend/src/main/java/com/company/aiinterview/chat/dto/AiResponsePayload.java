package com.company.aiinterview.chat.dto;

import lombok.Data;

@Data
public class AiResponsePayload {
    private Long sessionId;
    private Long userMessageId;
    private String jsonResponse;
}

package com.company.aiinterview.chat.dto;

import lombok.Data;

@Data
public class IncomingMessage {
    private Long sessionId;
    private String content;
}

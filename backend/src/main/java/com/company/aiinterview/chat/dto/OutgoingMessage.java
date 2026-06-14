package com.company.aiinterview.chat.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OutgoingMessage {
    private String sender; // AI or USER
    private String content;
    private Integer clarity;
    private Integer technicalDepth;
    private Integer confidence;
    private String suggestedAnswer;
    private String categoryTopic;
}

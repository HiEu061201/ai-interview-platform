package com.company.aiinterview.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAiResponsePayload {
    private Long sessionId;
    private String jsonResponse;
}

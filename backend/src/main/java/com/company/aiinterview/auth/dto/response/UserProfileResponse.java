package com.company.aiinterview.auth.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String status;
    private Integer level;
    private Integer exp;
}

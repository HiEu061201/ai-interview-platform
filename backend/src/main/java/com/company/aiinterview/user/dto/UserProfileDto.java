package com.company.aiinterview.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
}

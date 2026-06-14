package com.company.aiinterview.user.controller;

import com.company.aiinterview.user.dto.UserProfileDto;
import com.company.aiinterview.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @GetMapping("/analytics")
    public ResponseEntity<java.util.List<com.company.aiinterview.user.dto.UserAnalyticsDto>> getAnalytics() {
        return ResponseEntity.ok(userService.getAnalytics());
    }
}

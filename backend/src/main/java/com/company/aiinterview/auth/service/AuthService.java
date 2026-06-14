package com.company.aiinterview.auth.service;

import com.company.aiinterview.auth.dto.request.GoogleLoginRequest;
import com.company.aiinterview.auth.dto.request.LoginRequest;
import com.company.aiinterview.auth.dto.request.RegisterRequest;
import com.company.aiinterview.auth.dto.response.AuthResponse;

import com.company.aiinterview.auth.dto.request.RefreshTokenRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse loginWithGoogle(GoogleLoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
}

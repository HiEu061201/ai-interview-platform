package com.company.aiinterview.auth.service.impl;

import com.company.aiinterview.auth.dto.request.RegisterRequest;
import com.company.aiinterview.auth.dto.request.RefreshTokenRequest;
import com.company.aiinterview.auth.dto.response.AuthResponse;
import com.company.aiinterview.auth.dto.response.UserProfileResponse;
import com.company.aiinterview.exception.AppException;
import com.company.aiinterview.exception.ErrorCode;
import com.company.aiinterview.auth.service.AuthService;
import com.company.aiinterview.security.jwt.JwtProvider;
import com.company.aiinterview.user.entity.Role;
import com.company.aiinterview.user.entity.User;
import com.company.aiinterview.user.entity.UserStatus;
import com.company.aiinterview.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.company.aiinterview.auth.dto.request.LoginRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import com.company.aiinterview.auth.dto.request.GoogleLoginRequest;
import com.company.aiinterview.user.entity.AuthProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    
    @Value("${app.google.client-id}")
    private String googleClientId;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.USER) // Default role
                .status(UserStatus.ACTIVE) // Default status
                .authProvider(AuthProvider.LOCAL)
                .build();

        return getAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        user.setLastLoginAt(LocalDateTime.now());
        return getAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String subject = payload.getSubject(); // Google User ID

            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;

            if (userOptional.isPresent()) {
                user = userOptional.get();
                // Link account if it was LOCAL, or just update providerId
                if (user.getAuthProvider() == AuthProvider.LOCAL) {
                    user.setAuthProvider(AuthProvider.GOOGLE);
                    user.setProviderId(subject);
                }
            } else {
                // Register new Google user
                String generatedUsername = "google_" + UUID.randomUUID().toString().substring(0, 8);
                user = User.builder()
                        .email(email)
                        .username(generatedUsername)
                        .fullName(name)
                        .role(Role.USER)
                        .status(UserStatus.ACTIVE)
                        .authProvider(AuthProvider.GOOGLE)
                        .providerId(subject)
                        // passwordHash remains null
                        .build();
            }

            user.setLastLoginAt(LocalDateTime.now());
            return getAuthResponse(user);

        } catch (Exception e) {
            log.error("Google login failed", e);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!jwtProvider.validateToken(request.getRefreshToken())) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }
        String username = jwtProvider.extractUsername(request.getRefreshToken());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        return getAuthResponse(user);
    }

    private AuthResponse getAuthResponse(User user) {
        user = userRepository.save(user);

        String token = jwtProvider.generateToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);

        UserProfileResponse userProfile = UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .level(user.getLevel() != null ? user.getLevel() : 1)
                .exp(user.getExp() != null ? user.getExp() : 0)
                .build();

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .user(userProfile)
                .build();
    }
}

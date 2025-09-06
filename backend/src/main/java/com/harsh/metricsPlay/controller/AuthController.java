package com.harsh.metricsPlay.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.harsh.metricsPlay.model.dto.AuthRequest;
import com.harsh.metricsPlay.model.dto.AuthResponse;
import com.harsh.metricsPlay.service.AuthService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody AuthRequest request) {
        log.info("[AUTH] Signup request for username: {}", request.getUsername());
        String token = authService.signup(request);
        log.info("[AUTH] Signup successful for username: {}", request.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        log.info("[AUTH] Login request for username: {}", request.getUsername());
        String token = authService.login(request);
        log.info("[AUTH] Login successful for username: {}", request.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}

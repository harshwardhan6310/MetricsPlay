package com.harsh.metricsPlay.service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.harsh.metricsPlay.exception.InvalidCredentialsException;
import com.harsh.metricsPlay.exception.UserNotFoundException;
import com.harsh.metricsPlay.model.dto.AuthRequest;
import com.harsh.metricsPlay.model.entity.User;
import com.harsh.metricsPlay.repository.UserRepository;
import com.harsh.metricsPlay.utils.JwtUtil;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {

    private UserRepository userRepository;
    private JwtUtil jwtUtil;
    private PasswordEncoder passwordEncoder;

    AuthService(JwtUtil jwtUtil, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        log.info("AuthService initialized with JwtUtil and UserRepository\nJwtUtil: {}", jwtUtil);
    }

    public String signup(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Username already exists: {}", request.getUsername());
            throw new InvalidCredentialsException("Username already exists");
        }
        try {
            log.info("Creating new user: {}", request.getUsername());
            User newUser = User.builder()
                    .username(request.getUsername())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .build();
            userRepository.save(newUser);

            return jwtUtil.generateToken(newUser.getUsername());
        } catch (Exception e) {
            throw new RuntimeException("Error during signup: " + e.getMessage(), e);
        }
    }

    public String login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found: " + request.getUsername()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Incorrect password");
        }
        return jwtUtil.generateToken(user.getUsername());
    }
}

package com.example.booking.service;

import com.example.booking.Repository.UserRepository;
import com.example.booking.dto.AuthRequest;
import com.example.booking.dto.AuthResponse;
import com.example.booking.dto.RegisterRequest;
import com.example.booking.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setGender(req.getGender());
        user.setRole("CUSTOMER");
        User saved = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(saved.getEmail()),
                saved.getEmail(), saved.getName(), saved.getId(), saved.getRole());
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email does not exist"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Wrong password");
        }
        return new AuthResponse(jwtService.generateToken(user.getEmail()),
                user.getEmail(), user.getName(), user.getId(), user.getRole());
    }
}
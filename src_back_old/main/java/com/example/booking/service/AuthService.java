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

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());
        user.setRole("USER");

        User saved = userRepository.save(user);
        return buildResponse(saved);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new IllegalArgumentException("Email hoặc mật khẩu không đúng");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Email hoặc mật khẩu không đúng");
        }
        return buildResponse(user);
    }

    private AuthResponse buildResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(
                token,
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getId());
    }
}

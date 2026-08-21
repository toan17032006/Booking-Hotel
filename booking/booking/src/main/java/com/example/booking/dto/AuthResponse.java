package com.example.booking.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String name;
    private Long userId;
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(String token, String email, String name, Long userId, String role) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.userId = userId;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
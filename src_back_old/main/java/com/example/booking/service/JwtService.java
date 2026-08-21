package com.example.booking.service;

import com.example.booking.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET =
            "booking-secret-key-must-be-at-least-256-bits-long-12345";

    private static final long EXPIRATION_MS = 24L * 60 * 60 * 1000;

    private final SecretKey signingKey = Keys.hmacShaKeyFor(
            SECRET.getBytes(StandardCharsets.UTF_8));

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole() == null ? "USER" : user.getRole());
        claims.put("userId", user.getId());
        claims.put("name", user.getName());

        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = parseClaims(token);
        return resolver.apply(claims);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String email = extractEmail(token);
            return email != null
                    && email.equals(userDetails.getUsername())
                    && !isExpired(token);
        } catch (Exception ex) {
            return false;
        }
    }

    private boolean isExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

package com.example.booking.config;

import com.example.booking.Repository.UserRepository;
import com.example.booking.entity.User;
import com.example.booking.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader(HEADER);
        if (header == null || !header.startsWith(PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(PREFIX.length()).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractEmail(token);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = userRepository.findByEmail(email);
                if (user != null) {
                    UserDetails userDetails = org.springframework.security.core.userdetails.User
                            .withUsername(user.getEmail())
                            .password(user.getPassword() == null ? "" : user.getPassword())
                            .authorities(buildAuthorities(user.getRole()))
                            .build();

                    if (jwtService.validateToken(token, userDetails)) {
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }
        } catch (Exception ignored) {
        }

        filterChain.doFilter(request, response);
    }

    private List<SimpleGrantedAuthority> buildAuthorities(String role) {
        String r = (role == null || role.isBlank()) ? "USER" : role;
        return List.of(new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()));
    }
}

package com.example.booking.controller;

import com.example.booking.Repository.BookingRepository;
import com.example.booking.Repository.UserRepository;
import com.example.booking.dto.CreateBookingRequest;
import com.example.booking.entity.Booking;
import com.example.booking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService,
                             BookingRepository bookingRepository,
                             UserRepository userRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    // Customer xem phiếu đặt của chính mình
    @GetMapping("/my")
    public ResponseEntity<?> myBookings(@AuthenticationPrincipal String email) {
        if (email == null) return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(bookingRepository.findByUserId(user.getId())))
                .orElse(ResponseEntity.status(401).build());
    }

    // Tạo phiếu đặt mới (chỉ CUSTOMER — SecurityConfig đã chặn ADMIN)
    @PostMapping
    public Booking createBooking(@RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(
                request.getUserId(),
                request.getRoomId(),
                request.getStartDate(),
                request.getEndDate()
        );
    }
}


package com.example.booking.controller;

import com.example.booking.dto.CreateBookingRequest;
import com.example.booking.entity.Booking;
import com.example.booking.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Lấy tất cả phiếu đặt
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // Tạo phiếu đặt mới
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

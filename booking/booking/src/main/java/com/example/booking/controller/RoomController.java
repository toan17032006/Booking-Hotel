package com.example.booking.controller;

import com.example.booking.entity.Room;
import com.example.booking.Repository.RoomRepository;
import com.example.booking.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;
    private final BookingService bookingService;

    public RoomController(RoomRepository roomRepository, BookingService bookingService) {
        this.roomRepository = roomRepository;
        this.bookingService = bookingService;
    }

    // Lấy tất cả phòng
    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // Tìm phòng trống trong khoảng ngày
    @GetMapping("/available")
    public List<Room> availableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return bookingService.findAvailableRooms(startDate, endDate);
    }
}

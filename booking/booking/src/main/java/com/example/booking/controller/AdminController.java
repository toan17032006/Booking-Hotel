package com.example.booking.controller;

import com.example.booking.entity.Booking;
import com.example.booking.entity.Room;
import com.example.booking.Repository.BookingRepository;
import com.example.booking.Repository.RoomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public AdminController(RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    // ---------- ROOMS ----------

    @PostMapping("/rooms")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        room.setId_room(null);
        return ResponseEntity.ok(roomRepository.save(room));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Room req) {
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Room room = roomRepository.findById(id).get();
        room.setSogiuong(req.getSogiuong());
        room.setPricePerNight(req.getPricePerNight());
        room.setTrangthai(req.getTrangthai());
        return ResponseEntity.ok(roomRepository.save(room));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            roomRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Room has bookings, cannot delete");
        }
    }

    // ---------- BOOKINGS ----------

    @GetMapping("/bookings")
    public List<Booking> allBookings() {
        return bookingRepository.findAll();
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        Booking booking = bookingRepository.findById(id).get();
        booking.setTrangthai(body.get("trangthai"));
        return ResponseEntity.ok(bookingRepository.save(booking));
    }
}

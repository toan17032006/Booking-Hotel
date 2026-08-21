package com.example.booking.service;

import com.example.booking.entity.Booking;
import com.example.booking.entity.Room;
import com.example.booking.entity.User;
import com.example.booking.Repository.BookingRepository;
import com.example.booking.Repository.RoomRepository;
import com.example.booking.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          RoomRepository roomRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    // 1. Tìm phòng trống trong khoảng ngày
    public List<Room> findAvailableRooms(LocalDate startDate, LocalDate endDate) {
        return roomRepository.findByTrangthai("AVAILABLE").stream()
                .filter(room -> bookingRepository
                        .findOverlapping(room.getId_room(), startDate, endDate)
                        .isEmpty())
                .toList();
    }

    // 2. Tạo phiếu đặt phòng
    public Booking createBooking(Long userId, Long roomId,
                                 LocalDate startDate, LocalDate endDate) {

        if (!endDate.isAfter(startDate)) {
            throw new IllegalArgumentException("Ngày trả phải sau ngày nhận");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại"));

        if (!bookingRepository.findOverlapping(roomId, startDate, endDate).isEmpty()) {
            throw new IllegalArgumentException("Phòng đã được đặt trong khoảng thời gian này");
        }

        long nights = ChronoUnit.DAYS.between(startDate, endDate);
        BigDecimal total = room.getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotal(total);
        booking.setTrangthai("PENDING");

        return bookingRepository.save(booking);
    }

    // 3. Lấy tất cả phiếu đặt
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}

package com.example.booking.Repository;

import com.example.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Tìm các phiếu đặt còn hiệu lực bị trùng khoảng thời gian của 1 phòng
    @Query("SELECT b FROM Booking b " +
           "WHERE b.room.id_room = :roomId " +
           "AND b.trangthai <> 'CANCELLED' " +
           "AND b.startDate < :endDate " +
           "AND b.endDate > :startDate")
    List<Booking> findOverlapping(@Param("roomId") Long roomId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);
}

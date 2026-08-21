package com.example.booking.Repository;

import com.example.booking.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByTrangthai(String trangthai);
}
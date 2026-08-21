package com.example.booking.entity;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
@Table(name ="bookings")

public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id",nullable = false)
    private User user;
    @OneToOne
    @JoinColumn(name = "room_id",nullable = false)
    private Room room;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal total;
    private String trangthai;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public Room getRoom() {
        return room;
    }
    public void setRoom(Room room) {
        this.room = room;
    }
    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    public LocalDate getEndDate() {
        return endDate;
    }
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    public BigDecimal getTotal() {
        return total;
    }
    public void setTotal(BigDecimal total) {
        this.total = total;
    }
    public String getTrangthai() {
        return trangthai;
    }
    public void setTrangthai(String trangthai) {
        this.trangthai = trangthai;
    }
    
    
}

package com.example.booking.entity;


import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity
@Table(name ="rooms")

public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_room;
    @Column(nullable = false)
    private int sogiuong;
    private BigDecimal pricePerNight;
    @Column(nullable = false)
    private String trangthai;
    public Long getId_room() {
        return id_room;
    }
    public void setId_room(Long id_room) {
        this.id_room = id_room;
    }
    public int getSogiuong() {
        return sogiuong;
    }
    public void setSogiuong(int sogiuong) {
        this.sogiuong = sogiuong;
    }
    public String getTrangthai() {
        return trangthai;
    }
    public void setTrangthai(String trangthai) {
        this.trangthai = trangthai;
    }
    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }
}

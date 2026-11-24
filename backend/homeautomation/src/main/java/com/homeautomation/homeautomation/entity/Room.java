
package com.homeautomation.homeautomation.entity;

import java.time.Instant;

import jakarta.persistence.*;

@Entity
@Table(
    name = "rooms",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_rooms_home_name",
            columnNames = {"home_id", "name"}
        )
    }
)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 40)
    private String roomType;

    @Column(length = 500)
    private String description;

    // Multiple rooms belong to one home
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_id", nullable = false)
    private Home home;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Room() {
        // Required by JPA
    }

    public Room(
            String name,
            String roomType,
            String description,
            Home home) {

        this.name = name;
        this.roomType = roomType;
        this.description = description;
        this.home = home;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Home getHome() {
        return home;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

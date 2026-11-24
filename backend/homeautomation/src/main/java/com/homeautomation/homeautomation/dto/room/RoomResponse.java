
package com.homeautomation.homeautomation.dto.room;

import java.time.Instant;

import com.homeautomation.homeautomation.entity.Room;

public class RoomResponse {

    private Long id;
    private String name;
    private String roomType;
    private String description;
    private Long homeId;
    private Instant createdAt;

    public RoomResponse(
            Long id,
            String name,
            String roomType,
            String description,
            Long homeId,
            Instant createdAt) {

        this.id = id;
        this.name = name;
        this.roomType = roomType;
        this.description = description;
        this.homeId = homeId;
        this.createdAt = createdAt;
    }

    public static RoomResponse from(Room room) {

        return new RoomResponse(
                room.getId(),
                room.getName(),
                room.getRoomType(),
                room.getDescription(),
                room.getHome().getId(),
                room.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getRoomType() {
        return roomType;
    }

    public String getDescription() {
        return description;
    }

    public Long getHomeId() {
        return homeId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

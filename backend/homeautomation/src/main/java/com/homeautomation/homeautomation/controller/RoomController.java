
package com.homeautomation.homeautomation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.homeautomation.homeautomation.dto.room.CreateRoomRequest;
import com.homeautomation.homeautomation.dto.room.UpdateRoomRequest;
import com.homeautomation.homeautomation.dto.room.RoomResponse;

import com.homeautomation.homeautomation.service.RoomService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/homes/{homeId}/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // 1. Create Room
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @PathVariable Long homeId,
            @Valid @RequestBody CreateRoomRequest request,
            Authentication authentication) {

        RoomResponse response = roomService.createRoom(
                homeId,
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 2. Get all rooms
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(
            @PathVariable Long homeId,
            Authentication authentication) {

        return ResponseEntity.ok(
                roomService.getRooms(
                        homeId,
                        authentication.getName()
                )
        );
    }

    // 3. Get room by ID
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            Authentication authentication) {

        return ResponseEntity.ok(
                roomService.getRoomById(
                        homeId,
                        roomId,
                        authentication.getName()
                )
        );
    }

    // 4. Update Room
    @PutMapping("/{roomId}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateRoomRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                roomService.updateRoom(
                        homeId,
                        roomId,
                        request,
                        authentication.getName()
                )
        );
    }

    // 5. Delete Room
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            Authentication authentication) {

        roomService.deleteRoom(
                homeId,
                roomId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}


package com.homeautomation.homeautomation.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.homeautomation.homeautomation.dto.room.CreateRoomRequest;
import com.homeautomation.homeautomation.dto.room.UpdateRoomRequest;
import com.homeautomation.homeautomation.dto.room.RoomResponse;

import com.homeautomation.homeautomation.entity.Home;
import com.homeautomation.homeautomation.entity.Room;

import com.homeautomation.homeautomation.repository.HomeRepository;
import com.homeautomation.homeautomation.repository.RoomRepository;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final HomeRepository homeRepository;

    public RoomService(
            RoomRepository roomRepository,
            HomeRepository homeRepository) {

        this.roomRepository = roomRepository;
        this.homeRepository = homeRepository;
    }

    // 1. Create Room
    @Transactional
    public RoomResponse createRoom(
            Long homeId,
            CreateRoomRequest request,
            String email) {

        Home home = findUserHome(homeId, email);

        String roomName = request.getName().trim();

        // Check duplicate room name
        if (roomRepository.existsByHome_IdAndNameIgnoreCase(
                homeId, roomName)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A room with this name already exists in this home"
            );
        }

        Room room = new Room(
                roomName,
                request.getRoomType(),
                request.getDescription(),
                home
        );

        Room savedRoom = roomRepository.save(room);

        return RoomResponse.from(savedRoom);
    }

    // 2. Get all rooms of a home
    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms(
            Long homeId,
            String email) {

        findUserHome(homeId, email);

        return roomRepository
                .findAllByHome_IdAndHome_User_EmailOrderByCreatedAtDesc(
                        homeId, email)
                .stream()
                .map(RoomResponse::from)
                .toList();
    }

    // 3. Get a particular room
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(
            Long homeId,
            Long roomId,
            String email) {

        Room room = findUserRoom(homeId, roomId, email);

        return RoomResponse.from(room);
    }

    // 4. Update Room
    @Transactional
    public RoomResponse updateRoom(
            Long homeId,
            Long roomId,
            UpdateRoomRequest request,
            String email) {

        Room room = findUserRoom(homeId, roomId, email);

        String roomName = request.getName().trim();

        if (!room.getName().equalsIgnoreCase(roomName)
                && roomRepository.existsByHome_IdAndNameIgnoreCaseAndIdNot(
                        homeId, roomName, roomId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A room with this name already exists in this home"
            );
        }

        room.setName(roomName);
        room.setRoomType(request.getRoomType());
        room.setDescription(request.getDescription());

        Room updatedRoom = roomRepository.save(room);

        return RoomResponse.from(updatedRoom);
    }

    // 5. Delete Room
    @Transactional
    public void deleteRoom(
            Long homeId,
            Long roomId,
            String email) {

        Room room = findUserRoom(homeId, roomId, email);

        roomRepository.delete(room);
    }

    // Verify home ownership
    private Home findUserHome(Long homeId, String email) {

        return homeRepository
                .findByIdAndUser_Email(homeId, email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Home not found"
                        )
                );
    }

    // Verify room ownership
    private Room findUserRoom(
            Long homeId,
            Long roomId,
            String email) {

        return roomRepository
                .findByIdAndHome_IdAndHome_User_Email(
                        roomId, homeId, email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Room not found"
                        )
                );
    }
}

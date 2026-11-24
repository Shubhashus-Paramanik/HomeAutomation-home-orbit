
package com.homeautomation.homeautomation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.homeautomation.homeautomation.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {

    // Get all rooms of a particular home
    // Only if that home belongs to the logged-in user
    List<Room> findAllByHome_IdAndHome_User_EmailOrderByCreatedAtDesc(
            Long homeId,
            String email
    );

    // Find one room with home ownership verification
    Optional<Room> findByIdAndHome_IdAndHome_User_Email(
            Long roomId,
            Long homeId,
            String email
    );

    // Check duplicate room names inside a home
    boolean existsByHome_IdAndNameIgnoreCase(
            Long homeId,
            String name
    );

    // Check duplicate names while excluding the room being updated
    boolean existsByHome_IdAndNameIgnoreCaseAndIdNot(
            Long homeId,
            String name,
            Long roomId
    );

    // Check whether a home contains rooms
    boolean existsByHome_Id(Long homeId);
}

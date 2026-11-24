
package com.homeautomation.homeautomation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.homeautomation.homeautomation.entity.Device;

public interface DeviceRepository
        extends JpaRepository<Device, Long> {

    // Get all devices belonging to a room
    // after verifying the home owner
    List<Device>
    findAllByRoom_IdAndRoom_Home_IdAndRoom_Home_User_EmailOrderByCreatedAtDesc(
            Long roomId,
            Long homeId,
            String email
    );

    // Find one device with ownership verification
    Optional<Device>
    findByIdAndRoom_IdAndRoom_Home_IdAndRoom_Home_User_Email(
            Long deviceId,
            Long roomId,
            Long homeId,
            String email
    );

    // Prevent duplicate device names inside a room
    boolean existsByRoom_IdAndNameIgnoreCase(
            Long roomId,
            String name
    );

    // Prevent duplicate names during updates
    boolean existsByRoom_IdAndNameIgnoreCaseAndIdNot(
            Long roomId,
            String name,
            Long deviceId
    );

    boolean existsByController_IdAndPortNumber(
        Long controllerId,
        Integer portNumber
);

boolean existsByController_IdAndPortNumberAndIdNot(
        Long controllerId,
        Integer portNumber,
        Long deviceId
);

List<Device> findAllByController_IdOrderByPortNumberAsc(
        Long controllerId
);

long countByController_Id(Long controllerId);

}


package com.homeautomation.homeautomation.repository;

import com.homeautomation.homeautomation.entity.HardwareController;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HardwareControllerRepository
        extends JpaRepository<HardwareController, Long> {

    List<HardwareController>
    findAllByRoom_IdAndRoom_Home_IdAndRoom_Home_User_EmailOrderByCreatedAtDesc(
            Long roomId,
            Long homeId,
            String email
    );

    Optional<HardwareController>
    findByIdAndRoom_IdAndRoom_Home_IdAndRoom_Home_User_Email(
            Long controllerId,
            Long roomId,
            Long homeId,
            String email
    );

    boolean existsByControllerCode(String controllerCode);

    boolean existsByRoom_IdAndNameIgnoreCase(
            Long roomId,
            String name
    );

    boolean existsByRoom_IdAndNameIgnoreCaseAndIdNot(
        Long roomId,
        String name,
        Long controllerId
);
}

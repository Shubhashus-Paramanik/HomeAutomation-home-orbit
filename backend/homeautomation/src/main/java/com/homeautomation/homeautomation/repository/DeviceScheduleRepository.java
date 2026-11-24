
package com.homeautomation.homeautomation.repository;

import com.homeautomation.homeautomation.entity.DeviceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeviceScheduleRepository
        extends JpaRepository<DeviceSchedule, Long> {

    List<DeviceSchedule>
    findAllByDevice_IdAndDevice_Room_IdAndDevice_Room_Home_IdAndDevice_Room_Home_User_EmailOrderByExecutionTimeAsc(
            Long deviceId,
            Long roomId,
            Long homeId,
            String email
    );

    List<DeviceSchedule>
    findAllByDevice_Room_Home_User_EmailOrderByExecutionTimeAsc(
            String email
    );

    List<DeviceSchedule> findAllByEnabledTrue();

    boolean existsByIdAndDevice_Room_Home_User_Email(
            Long scheduleId,
            String email
    );
}

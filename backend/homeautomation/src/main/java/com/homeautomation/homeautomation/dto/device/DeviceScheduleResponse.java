
package com.homeautomation.homeautomation.dto.device;

import com.homeautomation.homeautomation.Enums.ScheduleAction;
import com.homeautomation.homeautomation.entity.DeviceSchedule;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.util.Set;

public record DeviceScheduleResponse(

        Long id,
        String name,
        Long deviceId,
        String deviceName,
        ScheduleAction action,
        LocalTime executionTime,
        Set<DayOfWeek> days,
        boolean enabled,
        Instant lastExecutedAt,
        Instant createdAt

) {

    public static DeviceScheduleResponse from(DeviceSchedule schedule) {

        return new DeviceScheduleResponse(
                schedule.getId(),
                schedule.getName(),
                schedule.getDevice().getId(),
                schedule.getDevice().getName(),
                schedule.getAction(),
                schedule.getExecutionTime(),
                Set.copyOf(schedule.getDays()),
                schedule.isEnabled(),
                schedule.getLastExecutedAt(),
                schedule.getCreatedAt()
        );
    }
}

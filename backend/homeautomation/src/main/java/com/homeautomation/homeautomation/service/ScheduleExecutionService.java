
package com.homeautomation.homeautomation.service;

import com.homeautomation.homeautomation.Enums.ScheduleAction;
import com.homeautomation.homeautomation.Enums.DevicePowerState;
import com.homeautomation.homeautomation.entity.DeviceSchedule;
import com.homeautomation.homeautomation.repository.DeviceScheduleRepository;
import com.homeautomation.homeautomation.repository.DeviceRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class ScheduleExecutionService {

    private static final ZoneId ZONE =
            ZoneId.of("Asia/Kolkata");

    private final DeviceScheduleRepository scheduleRepository;
    private final DeviceRepository deviceRepository;

    public ScheduleExecutionService(
            DeviceScheduleRepository scheduleRepository,
            DeviceRepository deviceRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.deviceRepository = deviceRepository;
    }

    @Transactional
    public void executeDueSchedules() {

        LocalDateTime now = LocalDateTime.now(ZONE);

        LocalDate today = now.toLocalDate();
        DayOfWeek currentDay = now.getDayOfWeek();

        List<DeviceSchedule> schedules =
                scheduleRepository.findAllByEnabledTrue();

        for (DeviceSchedule schedule : schedules) {

            // Check whether today is selected
            if (!schedule.getDays().contains(currentDay)) {
                continue;
            }

            // Check whether the schedule time matches
            if (!schedule.getExecutionTime()
                    .equals(now.toLocalTime()
                            .withSecond(0)
                            .withNano(0))) {
                continue;
            }

            // Prevent duplicate execution on the same day
            if (schedule.getLastExecutedAt() != null) {

                LocalDate lastExecutionDate =
                        schedule.getLastExecutedAt()
                                .atZone(ZONE)
                                .toLocalDate();

                if (today.equals(lastExecutionDate)) {
                    continue;
                }
            }

            // Execute the requested device action
            switch (schedule.getAction()) {

                case TURN_ON ->
                        schedule.getDevice()
                                .setPowerState(DevicePowerState.ON);

                case TURN_OFF ->
                        schedule.getDevice()
                                .setPowerState(DevicePowerState.OFF);
            }

            deviceRepository.save(schedule.getDevice());

            // Record execution time
            schedule.setLastExecutedAt(Instant.now());

            scheduleRepository.save(schedule);

            System.out.println(
                    "Schedule executed: "
                    + schedule.getName()
                    + " | Device: "
                    + schedule.getDevice().getName()
                    + " | Action: "
                    + schedule.getAction()
            );
        }
    }
}


package com.homeautomation.homeautomation.scheduler;

import com.homeautomation.homeautomation.service.ScheduleExecutionService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DeviceScheduleRunner {

    private final ScheduleExecutionService executionService;

    public DeviceScheduleRunner(
            ScheduleExecutionService executionService
    ) {
        this.executionService = executionService;
    }

    // Check schedules every 30 seconds
    @Scheduled(fixedDelay = 30000)
    public void runSchedules() {

        executionService.executeDueSchedules();
    }
}

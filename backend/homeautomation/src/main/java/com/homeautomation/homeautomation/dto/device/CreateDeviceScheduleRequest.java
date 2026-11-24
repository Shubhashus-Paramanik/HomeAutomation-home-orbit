
package com.homeautomation.homeautomation.dto.device;

import com.homeautomation.homeautomation.Enums.ScheduleAction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

public record CreateDeviceScheduleRequest(

        @NotBlank(message = "Schedule name is required")
        @Size(max = 100, message = "Schedule name cannot exceed 100 characters")
        String name,

        @NotNull(message = "Schedule action is required")
        ScheduleAction action,

        @NotNull(message = "Execution time is required")
        LocalTime executionTime,

        @NotEmpty(message = "Select at least one day")
        Set<DayOfWeek> days

) {
}

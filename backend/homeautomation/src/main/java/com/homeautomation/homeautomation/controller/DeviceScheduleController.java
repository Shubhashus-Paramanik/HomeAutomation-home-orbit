
package com.homeautomation.homeautomation.controller;

import com.homeautomation.homeautomation.dto.device.CreateDeviceScheduleRequest;
import com.homeautomation.homeautomation.dto.device.DeviceScheduleResponse;
import com.homeautomation.homeautomation.service.DeviceScheduleService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class DeviceScheduleController {

    private final DeviceScheduleService scheduleService;

    public DeviceScheduleController(
            DeviceScheduleService scheduleService
    ) {
        this.scheduleService = scheduleService;
    }

    // Create schedule for a device
    @PostMapping(
        "/homes/{homeId}/rooms/{roomId}/devices/{deviceId}/schedules"
    )
    public ResponseEntity<DeviceScheduleResponse> createSchedule(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @PathVariable Long deviceId,
            @Valid @RequestBody CreateDeviceScheduleRequest request,
            Principal principal
    ) {

        DeviceScheduleResponse response =
                scheduleService.createSchedule(
                        homeId,
                        roomId,
                        deviceId,
                        request,
                        principal.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get schedules for one device
    @GetMapping(
        "/homes/{homeId}/rooms/{roomId}/devices/{deviceId}/schedules"
    )
    public List<DeviceScheduleResponse> getDeviceSchedules(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @PathVariable Long deviceId,
            Principal principal
    ) {

        return scheduleService.getDeviceSchedules(
                homeId,
                roomId,
                deviceId,
                principal.getName()
        );
    }

    // Get all schedules for the current user
    @GetMapping("/schedules")
    public List<DeviceScheduleResponse> getMySchedules(
            Principal principal
    ) {

        return scheduleService.getMySchedules(
                principal.getName()
        );
    }

    // Enable or disable a schedule
    @PatchMapping("/schedules/{scheduleId}/enabled")
    public DeviceScheduleResponse setScheduleEnabled(
            @PathVariable Long scheduleId,
            @RequestParam boolean enabled,
            Principal principal
    ) {

        return scheduleService.setScheduleEnabled(
                scheduleId,
                enabled,
                principal.getName()
        );
    }

    // Delete schedule
    @DeleteMapping("/schedules/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long scheduleId,
            Principal principal
    ) {

        scheduleService.deleteSchedule(
                scheduleId,
                principal.getName()
        );

        return ResponseEntity.noContent().build();
    }
}

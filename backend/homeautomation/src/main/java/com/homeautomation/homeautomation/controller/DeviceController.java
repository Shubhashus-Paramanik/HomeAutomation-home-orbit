
package com.homeautomation.homeautomation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.homeautomation.homeautomation.dto.device.CreateDeviceRequest;
import com.homeautomation.homeautomation.dto.device.UpdateDeviceRequest;
import com.homeautomation.homeautomation.dto.device.DeviceResponse;

import com.homeautomation.homeautomation.service.DeviceService;
import com.homeautomation.homeautomation.dto.device.AssignDevicePortRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping(
    "/api/homes/{homeId}/rooms/{roomId}/devices"
)
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    // 1. Register Device
    @PostMapping
    public ResponseEntity<DeviceResponse> createDevice(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @Valid @RequestBody CreateDeviceRequest request,
            Authentication authentication) {

        DeviceResponse response = deviceService.createDevice(
                homeId,
                roomId,
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 2. Get all devices
    @GetMapping
    public ResponseEntity<List<DeviceResponse>> getDevices(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            Authentication authentication) {

        return ResponseEntity.ok(
                deviceService.getDevices(
                        homeId,
                        roomId,
                        authentication.getName()
                )
        );
    }

    // 3. Get device by ID
    @GetMapping("/{deviceId}")
    public ResponseEntity<DeviceResponse> getDeviceById(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @PathVariable Long deviceId,
            Authentication authentication) {

        return ResponseEntity.ok(
                deviceService.getDeviceById(
                        homeId,
                        roomId,
                        deviceId,
                        authentication.getName()
                )
        );
    }

    // 4. Update Device
    @PutMapping("/{deviceId}")
    public ResponseEntity<DeviceResponse> updateDevice(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @PathVariable Long deviceId,
            @Valid @RequestBody UpdateDeviceRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                deviceService.updateDevice(
                        homeId,
                        roomId,
                        deviceId,
                        request,
                        authentication.getName()
                )
        );
    }

    // 5. Delete Device
    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Void> deleteDevice(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @PathVariable Long deviceId,
            Authentication authentication) {

        deviceService.deleteDevice(
                homeId,
                roomId,
                deviceId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }


@PutMapping("/{deviceId}/assign-port")
public ResponseEntity<DeviceResponse> assignDevicePort(
        @PathVariable Long homeId,
        @PathVariable Long roomId,
        @PathVariable Long deviceId,
        @Valid @RequestBody AssignDevicePortRequest request,
        Authentication authentication) {

    DeviceResponse response = deviceService.assignDevicePort(
            homeId,
            roomId,
            deviceId,
            request,
            authentication.getName()
    );

    return ResponseEntity.ok(response);
}


@PostMapping("/{deviceId}/turn-on")
public ResponseEntity<DeviceResponse> turnOnDevice(
        @PathVariable Long homeId,
        @PathVariable Long roomId,
        @PathVariable Long deviceId,
        Authentication authentication) {

    DeviceResponse response = deviceService.turnOnDevice(
            homeId,
            roomId,
            deviceId,
            authentication.getName()
    );

    return ResponseEntity.ok(response);
}

@PostMapping("/{deviceId}/turn-off")
public ResponseEntity<DeviceResponse> turnOffDevice(
        @PathVariable Long homeId,
        @PathVariable Long roomId,
        @PathVariable Long deviceId,
        Authentication authentication) {

    DeviceResponse response = deviceService.turnOffDevice(
            homeId,
            roomId,
            deviceId,
            authentication.getName()
    );

    return ResponseEntity.ok(response);
}


}

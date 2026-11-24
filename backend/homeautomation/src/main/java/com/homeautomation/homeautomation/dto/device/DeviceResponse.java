
package com.homeautomation.homeautomation.dto.device;

import java.time.Instant;

import com.homeautomation.homeautomation.Enums.DeviceType;
import com.homeautomation.homeautomation.Enums.DeviceConnectionStatus;
import com.homeautomation.homeautomation.entity.Device;
import com.homeautomation.homeautomation.entity.HardwareController;
import com.homeautomation.homeautomation.Enums.DevicePowerState;

public class DeviceResponse {

    private Long id;
    private String name;
    private String deviceCode;
    private DeviceType deviceType;
    private DeviceConnectionStatus connectionStatus;
    private String description;
    private boolean simulated;

    private Long roomId;

    // New controller assignment fields
    private Long controllerId;
    private String controllerName;
    private Integer portNumber;

    private Instant createdAt;

    private DevicePowerState powerState;

    public DeviceResponse(
            Long id,
            String name,
            String deviceCode,
            DeviceType deviceType,
            DeviceConnectionStatus connectionStatus,
            String description,
            boolean simulated,
            Long roomId,
            Long controllerId,
            String controllerName,
            Integer portNumber,
            Instant createdAt,
            DevicePowerState powerState
        ) {

        this.id = id;
        this.name = name;
        this.deviceCode = deviceCode;
        this.deviceType = deviceType;
        this.connectionStatus = connectionStatus;
        this.description = description;
        this.simulated = simulated;
        this.roomId = roomId;
        this.controllerId = controllerId;
        this.controllerName = controllerName;
        this.portNumber = portNumber;
        this.createdAt = createdAt;
        this.powerState = powerState;
    }

    // Convert Device entity into DeviceResponse
    public static DeviceResponse from(Device device) {

        HardwareController controller = device.getController();

        return new DeviceResponse(
                device.getId(),
                device.getName(),
                device.getDeviceCode(),
                device.getDeviceType(),
                device.getConnectionStatus(),
                device.getDescription(),
                device.isSimulated(),
                device.getRoom().getId(),

                controller != null ? controller.getId() : null,
                controller != null ? controller.getName() : null,

                device.getPortNumber(),
                device.getCreatedAt(),
                device.getPowerState()
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDeviceCode() {
        return deviceCode;
    }

    public DeviceType getDeviceType() {
        return deviceType;
    }

    public DeviceConnectionStatus getConnectionStatus() {
        return connectionStatus;
    }

    public String getDescription() {
        return description;
    }

    public boolean isSimulated() {
        return simulated;
    }

    public Long getRoomId() {
        return roomId;
    }

    public Long getControllerId() {
        return controllerId;
    }

    public String getControllerName() {
        return controllerName;
    }

    public Integer getPortNumber() {
        return portNumber;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public DevicePowerState getPowerState() {
    return powerState;
}
}


package com.homeautomation.homeautomation.dto.device;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.homeautomation.homeautomation.Enums.DeviceType;

public class CreateDeviceRequest {

    @NotBlank(message = "Device name is required")
    @Size(max = 100, message = "Device name cannot exceed 100 characters")
    private String name;

    @NotNull(message = "Device type is required")
    private DeviceType deviceType;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

     @NotNull(message = "Controller ID is required")
    private Long controllerId;

    @NotNull(message = "Port number is required")
    @Min(value = 1, message = "Port number must be at least 1")
    private Integer portNumber;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DeviceType getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(DeviceType deviceType) {
        this.deviceType = deviceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
     public Long getControllerId() {
        return controllerId;
    }

    public void setControllerId(Long controllerId) {
        this.controllerId = controllerId;
    }

    public Integer getPortNumber() {
        return portNumber;
    }

    public void setPortNumber(Integer portNumber) {
        this.portNumber = portNumber;
    }
}


package com.homeautomation.homeautomation.dto.device;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.homeautomation.homeautomation.Enums.DeviceType;

public class UpdateDeviceRequest {

    @NotBlank(message = "Device name is required")
    @Size(max = 100)
    private String name;

    @NotNull(message = "Device type is required")
    private DeviceType deviceType;

    @Size(max = 500)
    private String description;

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
}

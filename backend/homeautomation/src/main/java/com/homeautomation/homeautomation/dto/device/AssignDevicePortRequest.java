package com.homeautomation.homeautomation.dto.device;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AssignDevicePortRequest {

    @NotNull(message = "Controller ID is required")
    private Long controllerId;

    @NotNull(message = "Port number is required")
    @Min(value = 1, message = "Port number must be at least 1")
    private Integer portNumber;

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

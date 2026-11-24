
package com.homeautomation.homeautomation.dto.controller;

import com.homeautomation.homeautomation.Enums.DeviceType;

public record ControllerPortResponse(

        Integer portNumber,
        boolean available,
        Long deviceId,
        String deviceName,
        DeviceType deviceType

) {
}

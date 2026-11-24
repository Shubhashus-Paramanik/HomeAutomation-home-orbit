
package com.homeautomation.homeautomation.dto.controller;

import com.homeautomation.homeautomation.Enums.ControllerModel;
import com.homeautomation.homeautomation.Enums.ControllerStatus;

import java.time.Instant;

public record ControllerResponse(

        Long id,
        String name,
        String controllerCode,
        ControllerModel model,
        ControllerStatus status,
        boolean simulated,
        int totalPorts,
        Long roomId,
        String roomName,
        Instant createdAt

) {
}

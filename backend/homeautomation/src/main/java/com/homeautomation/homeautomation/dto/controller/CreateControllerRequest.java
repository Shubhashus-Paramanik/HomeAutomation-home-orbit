
package com.homeautomation.homeautomation.dto.controller;

import com.homeautomation.homeautomation.Enums.ControllerModel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateControllerRequest(

        @NotBlank(message = "Controller name is required")
        @Size(max = 100)
        String name,

        @NotNull(message = "Controller model is required")
        ControllerModel model

) {
}


package com.homeautomation.homeautomation.dto.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateControllerRequest(

        @NotBlank(message = "Controller name is required")
        @Size(max = 100)
        String name

) {
}

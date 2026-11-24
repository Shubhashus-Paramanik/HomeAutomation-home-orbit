
package com.homeautomation.homeautomation.controller;

import com.homeautomation.homeautomation.dto.controller.CreateControllerRequest;
import com.homeautomation.homeautomation.dto.controller.UpdateControllerRequest;
import com.homeautomation.homeautomation.dto.controller.ControllerResponse;
import com.homeautomation.homeautomation.service.ControllerService;
import com.homeautomation.homeautomation.dto.controller.ControllerPortResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/homes/{homeId}/rooms/{roomId}/controllers")
public class ControllerController {

    private final ControllerService controllerService;

    public ControllerController(ControllerService controllerService) {
        this.controllerService = controllerService;
    }

    // Register controller
    @PostMapping
    public ResponseEntity<ControllerResponse> createController(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @Valid @RequestBody CreateControllerRequest request,
            Authentication authentication
    ) {

        ControllerResponse response =
                controllerService.createController(
                        homeId,
                        roomId,
                        request,
                        authentication.getName()
                );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all controllers
    @GetMapping
    public ResponseEntity<List<ControllerResponse>> getControllers(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                controllerService.getControllers(
                        homeId,
                        roomId,
                        authentication.getName()
                )
        );
    }

    // Get one controller
    @GetMapping("/{controllerId}")
    public ResponseEntity<ControllerResponse> getController(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @PathVariable Long controllerId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                controllerService.getController(
                        homeId,
                        roomId,
                        controllerId,
                        authentication.getName()
                )
        );
    }

    // Update controller
    @PutMapping("/{controllerId}")
    public ResponseEntity<ControllerResponse> updateController(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @PathVariable Long controllerId,
            @Valid @RequestBody UpdateControllerRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                controllerService.updateController(
                        homeId,
                        roomId,
                        controllerId,
                        request,
                        authentication.getName()
                )
        );
    }

    // Delete controller
    @DeleteMapping("/{controllerId}")
    public ResponseEntity<Void> deleteController(
            @PathVariable Long homeId,
            @PathVariable Long roomId,
            @PathVariable Long controllerId,
            Authentication authentication
    ) {

        controllerService.deleteController(
                homeId,
                roomId,
                controllerId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }


@GetMapping("/{controllerId}/ports")
public ResponseEntity<List<ControllerPortResponse>> getControllerPorts(
        @PathVariable Long homeId,
        @PathVariable Long roomId,
        @PathVariable Long controllerId,
        Authentication authentication) {

    return ResponseEntity.ok(
            controllerService.getControllerPorts(
                    homeId,
                    roomId,
                    controllerId,
                    authentication.getName()
            )
    );
}

}

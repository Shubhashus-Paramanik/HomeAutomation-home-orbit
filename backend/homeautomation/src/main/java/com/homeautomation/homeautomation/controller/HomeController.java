
package com.homeautomation.homeautomation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.homeautomation.homeautomation.dto.home.CreateHomeRequest;
import com.homeautomation.homeautomation.dto.home.HomeResponse;
import com.homeautomation.homeautomation.dto.home.UpdateHomeRequest;
import com.homeautomation.homeautomation.service.HomeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/homes")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    // Create Home
    @PostMapping
    public ResponseEntity<HomeResponse> createHome(
            @Valid @RequestBody CreateHomeRequest request,
            Authentication authentication) {

        HomeResponse response = homeService.createHome(
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get all my homes
    @GetMapping
    public ResponseEntity<List<HomeResponse>> getMyHomes(
            Authentication authentication) {

        return ResponseEntity.ok(
                homeService.getMyHomes(authentication.getName())
        );
    }

    // Get home by ID
    @GetMapping("/{id}")
    public ResponseEntity<HomeResponse> getHomeById(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                homeService.getHomeById(
                        id,
                        authentication.getName()
                )
        );
    }

    // Update Home
    @PutMapping("/{id}")
    public ResponseEntity<HomeResponse> updateHome(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHomeRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                homeService.updateHome(
                        id,
                        request,
                        authentication.getName()
                )
                
        );
    }

    // Delete Home
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHome(
            @PathVariable Long id,
            Authentication authentication) {

        homeService.deleteHome(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}

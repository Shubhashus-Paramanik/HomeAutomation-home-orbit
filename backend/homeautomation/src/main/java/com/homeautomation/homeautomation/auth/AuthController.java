
package com.homeautomation.homeautomation.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.homeautomation.homeautomation.auth.dto.AuthResponse;
import com.homeautomation.homeautomation.dto.LoginRequest;
import com.homeautomation.homeautomation.dto.RegisterRequest;
import com.homeautomation.homeautomation.dto.ProfileResponse;
import com.homeautomation.homeautomation.dto.UpdateProfileRequest;
import com.homeautomation.homeautomation.entity.User;
import com.homeautomation.homeautomation.dto.ChangePasswordRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        Map<String, Object> response = Map.of(
            "message", "Registration successful",
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole().name()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    // Get logged-in user's profile
    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getProfile(
            Authentication authentication) {

        ProfileResponse profile =
            authService.getProfile(authentication.getName());

        return ResponseEntity.ok(profile);
    }

    // Update logged-in user's profile
    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        ProfileResponse profile = authService.updateProfile(
            authentication.getName(),
            request
        );

        return ResponseEntity.ok(profile);
    }


@PutMapping("/change-password")
public ResponseEntity<?> changePassword(
        Authentication authentication,
        @Valid @RequestBody ChangePasswordRequest request) {

    authService.changePassword(
        authentication.getName(),
        request
    );

    return ResponseEntity.ok(
        Map.of("message", "Password changed successfully")
    );
}

}

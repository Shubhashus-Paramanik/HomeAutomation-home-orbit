package com.homeautomation.homeautomation.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.homeautomation.homeautomation.auth.dto.AuthResponse;
import com.homeautomation.homeautomation.dto.LoginRequest;
import com.homeautomation.homeautomation.dto.RegisterRequest;
import com.homeautomation.homeautomation.entity.User;
import com.homeautomation.homeautomation.repository.UserRepository;
import com.homeautomation.homeautomation.security.JwtService;

import java.util.Locale;

import com.homeautomation.homeautomation.dto.ProfileResponse;
import com.homeautomation.homeautomation.dto.UpdateProfileRequest;
import com.homeautomation.homeautomation.dto.ChangePasswordRequest;

@Service 
public class AuthService {

    @Autowired 
    private UserRepository userRepository;

    @Autowired 
    private PasswordEncoder passwordEncoder;
    // from this it is implemented after the new edition of issue the token
    @Autowired 
    private JwtService jwtService;
    


    @Transactional
    public User register(RegisterRequest request){
        String email = request.email()
        .trim()
        .toLowerCase(java.util.Locale.ROOT);

        if(userRepository.existsByEmail(email)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already exist");
        }

        String encodedPassword=passwordEncoder.encode(request.password());

        User user=new User(request.name().trim(), email, encodedPassword);
        user.setPassword(encodedPassword);
        User savedUser = userRepository.save(user);

        return savedUser;
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email()
                .trim()
                .toLowerCase(java.util.Locale.ROOT);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> 
                new BadCredentialsException("Invalid email or password"));

        boolean passwordMatches = 
            passwordEncoder.matches(request.password(), user.getPassword());

        if (!passwordMatches) {
            throw new BadCredentialsException("Invalid email or password");
        }
// this is add for issue the token
        String token = jwtService.generateToken(user.getEmail()); 
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                "Login successful",
                token,
                "Bearer"
            );
    }

    @Transactional(readOnly = true)
public ProfileResponse getProfile(String email) {

    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"
        ));

    return mapToProfileResponse(user);
}


@Transactional
public ProfileResponse updateProfile(
        String currentEmail,
        UpdateProfileRequest request) {

    User user = userRepository.findByEmail(currentEmail)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"
        ));

    String newName = request.name().trim();

    String newEmail = request.email()
        .trim()
        .toLowerCase(Locale.ROOT);

    // Check whether another account already uses this email
    if (userRepository.existsByEmailAndIdNot(newEmail, user.getId())) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Email is already registered"
        );
    }

    user.setName(newName);
    user.setEmail(newEmail);

    User updatedUser = userRepository.save(user);

    return mapToProfileResponse(updatedUser);
}


private ProfileResponse mapToProfileResponse(User user) {

    return new ProfileResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole().name(),
        user.getCreatedAt()
    );
}


@Transactional
public void changePassword(
        String email,
        ChangePasswordRequest request) {

    // 1. Find the currently authenticated user
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"
        ));

    // 2. Verify the current password
    boolean passwordMatches = passwordEncoder.matches(
        request.currentPassword(),
        user.getPassword()
    );

    if (!passwordMatches) {
        throw new BadCredentialsException(
            "Current password is incorrect"
        );
    }

    // 3. Prevent setting the same password again
    if (passwordEncoder.matches(
            request.newPassword(),
            user.getPassword())) {

        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "New password must be different from current password"
        );
    }

    // 4. Hash the new password using BCrypt
    String encodedPassword =
        passwordEncoder.encode(request.newPassword());

    // 5. Update the database
    user.setPassword(encodedPassword);

    userRepository.save(user);
}

    
}

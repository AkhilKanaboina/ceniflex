package com.cenifex.controller;

import com.cenifex.dto.LoginRequest;
import com.cenifex.dto.SignupRequest;
import com.cenifex.entity.User;
import com.cenifex.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        // Validation happens automatically due to @Valid
        // The service throws a RuntimeException if email exists, 
        // which is caught by GlobalExceptionHandler.
        User user = userService.registerUser(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", user.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.loginUser(request.getEmail(), request.getPassword());
        if (user != null) {
            return ResponseEntity.ok(Map.of("message", "Login successful", "username", user.getUsername()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }
}

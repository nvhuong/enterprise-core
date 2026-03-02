package com.enterprise.controller;

import com.enterprise.dto.UserProfileDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile() {
        // Mock profile
        UserProfileDto profile = new UserProfileDto(
                "123",
                "John Doe",
                "john.doe@example.com",
                "Admin",
                "https://ui-avatars.com/api/?name=John+Doe"
        );
        return ResponseEntity.ok(profile);
    }
}

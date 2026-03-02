package com.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDto {
    private String id;
    private String fullName;
    private String email;
    private String role;
    private String avatarUrl;
}

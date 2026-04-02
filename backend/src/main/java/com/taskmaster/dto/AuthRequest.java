package com.taskmaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank
    private String username;

    private String email;

    @NotBlank
    private String password;
}

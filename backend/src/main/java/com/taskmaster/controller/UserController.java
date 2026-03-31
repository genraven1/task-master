package com.taskmaster.controller;

import com.taskmaster.dto.UserDTO;
import com.taskmaster.model.User;
import com.taskmaster.repository.UserRepository;
import com.taskmaster.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(userService.toDTO(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDTO dto) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(userService.updateUser(user.getId(), dto));
    }
}

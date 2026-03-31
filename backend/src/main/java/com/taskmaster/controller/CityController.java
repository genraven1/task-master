package com.taskmaster.controller;

import com.taskmaster.dto.CityDTO;
import com.taskmaster.exception.ResourceNotFoundException;
import com.taskmaster.repository.UserRepository;
import com.taskmaster.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
    }

    /** Get the city the authenticated user belongs to. */
    @GetMapping("/me")
    public ResponseEntity<CityDTO> getMyCity(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cityService.getCityForUser(getUserId(userDetails)));
    }

    /** Get a city by its id. */
    @GetMapping("/{id}")
    public ResponseEntity<CityDTO> getCity(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getCity(id));
    }

    /** Create a new city. Body: { "name": "..." } */
    @PostMapping
    public ResponseEntity<CityDTO> createCity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cityService.createCity(getUserId(userDetails), name.trim()));
    }

    /** Join a city via invite code. Body: { "inviteCode": "..." } */
    @PostMapping("/join")
    public ResponseEntity<CityDTO> joinCity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String inviteCode = body.get("inviteCode");
        if (inviteCode == null || inviteCode.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cityService.joinCity(getUserId(userDetails), inviteCode.trim().toUpperCase()));
    }

    /** Leave a city (founders cannot leave). */
    @DeleteMapping("/me")
    public ResponseEntity<Void> leaveCity(@AuthenticationPrincipal UserDetails userDetails) {
        cityService.leaveCity(getUserId(userDetails));
        return ResponseEntity.noContent().build();
    }
}

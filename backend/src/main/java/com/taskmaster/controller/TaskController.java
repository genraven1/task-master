package com.taskmaster.controller;

import com.taskmaster.dto.TaskDTO;
import com.taskmaster.model.User;
import com.taskmaster.repository.UserRepository;
import com.taskmaster.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getTasks(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.getTasksForUser(getUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.createTask(getUserId(userDetails), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.updateTask(id, getUserId(userDetails), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        taskService.deleteTask(id, getUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<TaskDTO> completeTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(taskService.completeTask(id, getUserId(userDetails)));
    }

    @PostMapping("/{id}/undo")
    public ResponseEntity<TaskDTO> undoTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(taskService.undoTask(id, getUserId(userDetails)));
    }
}

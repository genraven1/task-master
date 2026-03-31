package com.taskmaster.service;

import com.taskmaster.dto.TaskDTO;
import com.taskmaster.exception.ResourceNotFoundException;
import com.taskmaster.exception.TaskStateException;
import com.taskmaster.model.Task;
import com.taskmaster.model.TaskCompletion;
import com.taskmaster.model.User;
import com.taskmaster.repository.TaskCompletionRepository;
import com.taskmaster.repository.TaskRepository;
import com.taskmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskCompletionRepository taskCompletionRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;

    public List<TaskDTO> getTasksForUser(Long userId) {
        return taskRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO createTask(Long userId, TaskDTO dto) {
        Task.Difficulty difficulty = dto.getDifficulty() != null ? dto.getDifficulty() : Task.Difficulty.EASY;
        Task task = Task.builder()
                .userId(userId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .difficulty(difficulty)
                .xpReward(gamificationService.getXpReward(difficulty))
                .goldReward(gamificationService.getGoldReward(difficulty))
                .dueDate(dto.getDueDate())
                .tags(dto.getTags())
                .build();
        return toDTO(taskRepository.save(task));
    }

    @Transactional
    public TaskDTO updateTask(Long taskId, Long userId, TaskDTO dto) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getType() != null) task.setType(dto.getType());
        if (dto.getDifficulty() != null) {
            task.setDifficulty(dto.getDifficulty());
            task.setXpReward(gamificationService.getXpReward(dto.getDifficulty()));
            task.setGoldReward(gamificationService.getGoldReward(dto.getDifficulty()));
        }
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getTags() != null) task.setTags(dto.getTags());
        return toDTO(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        taskCompletionRepository.deleteByTaskId(taskId);
        taskRepository.delete(task);
    }

    @Transactional
    public TaskDTO completeTask(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (task.getType() == Task.TaskType.TODO && task.isCompleted()) {
            throw new TaskStateException("Task already completed");
        }

        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());
        task.setStreak(task.getStreak() + 1);
        taskRepository.save(task);

        TaskCompletion completion = TaskCompletion.builder()
                .taskId(taskId)
                .userId(userId)
                .completedAt(LocalDateTime.now())
                .build();
        taskCompletionRepository.save(completion);

        gamificationService.awardXpAndGold(user, task.getXpReward(), task.getGoldReward());

        return toDTO(task);
    }

    @Transactional
    public TaskDTO undoTask(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!task.isCompleted()) {
            throw new TaskStateException("Task is not completed");
        }

        task.setCompleted(false);
        task.setCompletedAt(null);
        task.setStreak(Math.max(0, task.getStreak() - 1));
        taskRepository.save(task);

        gamificationService.deductXpAndGold(user, task.getXpReward(), task.getGoldReward());

        return toDTO(task);
    }

    public TaskDTO toDTO(Task task) {
        return TaskDTO.builder()
                .id(task.getId())
                .userId(task.getUserId())
                .title(task.getTitle())
                .description(task.getDescription())
                .type(task.getType())
                .difficulty(task.getDifficulty())
                .xpReward(task.getXpReward())
                .goldReward(task.getGoldReward())
                .completed(task.isCompleted())
                .completedAt(task.getCompletedAt())
                .streak(task.getStreak())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .tags(task.getTags())
                .build();
    }
}

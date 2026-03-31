package com.taskmaster.service;

import com.taskmaster.dto.CompleteTaskResponseDTO;
import com.taskmaster.dto.TaskDTO;
import com.taskmaster.exception.ResourceNotFoundException;
import com.taskmaster.exception.TaskStateException;
import com.taskmaster.model.ResourceType;
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
    private final CityService cityService;
    private final UserService userService;

    public List<TaskDTO> getTasksForUser(Long userId) {
        return taskRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO createTask(Long userId, TaskDTO dto) {
        Task.Difficulty difficulty = dto.getDifficulty() != null ? dto.getDifficulty() : Task.Difficulty.EASY;
        ResourceType resourceType = dto.getResourceType() != null ? dto.getResourceType() : ResourceType.GOLD;
        Task task = Task.builder()
                .userId(userId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .difficulty(difficulty)
                .xpReward(gamificationService.getXpReward(difficulty))
                .goldReward(gamificationService.getGoldReward(difficulty))
                .resourceType(resourceType)
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
        if (dto.getResourceType() != null) {
            task.setResourceType(dto.getResourceType());
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
    public CompleteTaskResponseDTO completeTask(Long taskId, Long userId) {
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

        int levelBefore = user.getLevel();
        User updatedUser = gamificationService.awardXpAndGold(user, task.getXpReward(), task.getGoldReward());
        boolean leveledUp = updatedUser.getLevel() > levelBefore;

        // Contribute resource to city (no-op if user is not in a city)
        ResourceType resourceType = task.getResourceType() != null ? task.getResourceType() : ResourceType.GOLD;
        int resourceGained = task.getGoldReward();
        int cityContributed = cityService.contributeResource(userId, resourceType, resourceGained);
        Long cityId = cityContributed > 0 ? cityService.getCityIdForUser(userId) : null;

        return CompleteTaskResponseDTO.builder()
                .task(toDTO(task))
                .user(userService.toDTO(updatedUser))
                .xpGained(task.getXpReward())
                .goldGained(task.getGoldReward())
                .leveledUp(leveledUp)
                .resourceType(resourceType)
                .resourceGained(resourceGained)
                .cityId(cityId)
                .cityResourceContributed(cityContributed)
                .build();
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
                .resourceType(task.getResourceType())
                .completed(task.isCompleted())
                .completedAt(task.getCompletedAt())
                .streak(task.getStreak())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .tags(task.getTags())
                .build();
    }
}

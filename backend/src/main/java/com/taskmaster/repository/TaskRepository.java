package com.taskmaster.repository;

import com.taskmaster.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    Optional<Task> findByIdAndUserId(Long id, Long userId);
    List<Task> findByUserIdAndType(Long userId, Task.TaskType type);
    List<Task> findByUserIdAndCompleted(Long userId, boolean completed);
}

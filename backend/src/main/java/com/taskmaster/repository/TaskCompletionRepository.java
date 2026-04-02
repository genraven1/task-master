package com.taskmaster.repository;

import com.taskmaster.model.TaskCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskCompletionRepository extends JpaRepository<TaskCompletion, Long> {
    List<TaskCompletion> findByTaskIdAndCompletedAtAfter(Long taskId, LocalDateTime after);
    List<TaskCompletion> findByUserId(Long userId);
    void deleteByTaskId(Long taskId);
}

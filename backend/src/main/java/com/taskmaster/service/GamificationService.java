package com.taskmaster.service;

import com.taskmaster.model.Task;
import com.taskmaster.model.User;
import com.taskmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository userRepository;

    public int getXpReward(Task.Difficulty difficulty) {
        return switch (difficulty) {
            case EASY -> 10;
            case MEDIUM -> 25;
            case HARD -> 50;
            case EPIC -> 100;
        };
    }

    public int getGoldReward(Task.Difficulty difficulty) {
        return switch (difficulty) {
            case EASY -> 5;
            case MEDIUM -> 10;
            case HARD -> 20;
            case EPIC -> 40;
        };
    }

    @Transactional
    public User awardXpAndGold(User user, int xp, int gold) {
        user.setXp(user.getXp() + xp);
        user.setGold(user.getGold() + gold);
        checkLevelUp(user);
        return userRepository.save(user);
    }

    @Transactional
    public User deductXpAndGold(User user, int xp, int gold) {
        user.setXp(Math.max(0, user.getXp() - xp));
        user.setGold(Math.max(0, user.getGold() - gold));
        return userRepository.save(user);
    }

    private void checkLevelUp(User user) {
        while (user.getXp() >= 100 * user.getLevel()) {
            user.setXp(user.getXp() - 100 * user.getLevel());
            user.setLevel(user.getLevel() + 1);
            double newMaxHp = 50 + 10.0 * user.getLevel();
            user.setMaxHp(newMaxHp);
            user.setHp(newMaxHp);
        }
    }

    @Transactional
    public User applyHpDamage(User user, double damage) {
        user.setHp(Math.max(0, user.getHp() - damage));
        return userRepository.save(user);
    }
}

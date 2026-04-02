package com.taskmaster.repository;

import com.taskmaster.model.Expedition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpeditionRepository extends JpaRepository<Expedition, Long> {

    List<Expedition> findByCityIdOrderByLaunchedAtDesc(Long cityId);

    Optional<Expedition> findByIdAndCityId(Long id, Long cityId);

    boolean existsByCityIdAndLaunchedByUserIdAndStatus(
            Long cityId, Long launchedByUserId, Expedition.Status status);
}

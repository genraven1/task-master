package com.taskmaster.repository;

import com.taskmaster.model.CityMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CityMembershipRepository extends JpaRepository<CityMembership, Long> {
    Optional<CityMembership> findByCityIdAndUserId(Long cityId, Long userId);
    Optional<CityMembership> findByUserId(Long userId);
    List<CityMembership> findByCityId(Long cityId);
    boolean existsByUserId(Long userId);
}

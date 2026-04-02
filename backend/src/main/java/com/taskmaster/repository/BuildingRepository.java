package com.taskmaster.repository;

import com.taskmaster.model.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BuildingRepository extends JpaRepository<Building, Long> {
    List<Building> findByCityId(Long cityId);
    Optional<Building> findByCityIdAndBuildingType(Long cityId, Building.BuildingType buildingType);
}

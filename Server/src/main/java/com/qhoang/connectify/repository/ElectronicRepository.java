package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Electronic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElectronicRepository extends JpaRepository<Electronic, String> {

    List<Electronic> findByNameContainingIgnoreCaseOrCpuContainingIgnoreCaseOrRamContainingIgnoreCaseOrGpuContainingIgnoreCaseOrMaterialContainingIgnoreCaseOrPowerRatingContainingIgnoreCaseOrOperatingSystemContainingIgnoreCaseOrStorageCapacityContainingIgnoreCaseOrBatteryLifeContainingIgnoreCaseOrManufactureYearContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name,
            String cpu,
            String ram,
            String gpu,
            String material,
            String powerRating,
            String operatingSystem,
            String storageCapacity,
            String batteryLife,
            String manufactureYear,
            String description
    );
}

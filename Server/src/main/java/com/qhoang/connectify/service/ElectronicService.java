package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.repository.ElectronicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ElectronicService {

    @Autowired
    private ElectronicRepository electronicRepository;

    public List<Electronic> getAllElectronics() {
        return electronicRepository.findAll();
    }

    public void insertElectronic(Electronic electronic) {
        electronicRepository.save(electronic);
    }

    public void updateElectronic(Electronic electronic) {
        electronicRepository.save(electronic);
    }

    public void deleteElectronic(String id) {
        electronicRepository.deleteById(id);
    }

    public Electronic getElectronicById(String id) {
        return electronicRepository.findById(id).orElse(null);
    }

    public List<Electronic> searchElectronics(String keyword) {
        return electronicRepository.
                findByNameContainingIgnoreCaseOrCpuContainingIgnoreCaseOrRamContainingIgnoreCaseOrGpuContainingIgnoreCaseOrMaterialContainingIgnoreCaseOrPowerRatingContainingIgnoreCaseOrOperatingSystemContainingIgnoreCaseOrStorageCapacityContainingIgnoreCaseOrBatteryLifeContainingIgnoreCaseOrManufactureYearContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        keyword, keyword, keyword, keyword, keyword, keyword,
                        keyword, keyword, keyword, keyword, keyword
                );
    }
}

package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.repository.ElectronicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

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

//    // ✅ Hàm xử lý trừ số lượng khi hóa đơn được duyệt
//    public boolean deductQuantityFromPurchasedItems(String purchasedItems) {
//        String[] items = purchasedItems.split(",");
//        Map<Electronic, Integer> deductions = new HashMap<>();
//
//        for (String item : items) {
//            item = item.trim();
//            if (!item.contains("SL")) continue;
//
//            String[] parts = item.split("SL");
//            if (parts.length != 2) return false;
//
//            String itemName = parts[0].trim();
//            int quantity;
//
//            try {
//                quantity = Integer.parseInt(parts[1].trim());
//            } catch (NumberFormatException e) {
//                return false;
//            }
//
//            Electronic electronic = electronicRepository.findByName(itemName);
//            if (electronic == null || electronic.getQuantity() < quantity) {
//                return false;
//            }
//            deductions.put(electronic, quantity);
//        }
//
//        // Nếu đủ số lượng => trừ thật
//        for (Map.Entry<Electronic, Integer> entry : deductions.entrySet()) {
//            Electronic e = entry.getKey();
//            e.setQuantity(e.getQuantity() - entry.getValue());
//            electronicRepository.save(e);
//        }
//
//        return true;
//    }
}

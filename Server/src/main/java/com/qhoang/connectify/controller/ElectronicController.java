package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Brand;
import com.qhoang.connectify.entities.Category;
import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.repository.ElectronicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.GsonBuilderUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/electronics")
public class ElectronicController {

    @Autowired
    private ElectronicRepository electronicRepository;

    private final String UPLOAD_DIR = "D:/Project/ConnectifyShop/src/main/webapp/resources/uploads/";

    @GetMapping
    public ResponseEntity<List<Electronic>> getAll() {
        return ResponseEntity.ok(electronicRepository.getAllElectronics());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addElectronic(
            @RequestParam("cat_id") int catId,
            @RequestParam("brand_id") String brandId,
            @RequestParam("name") String name,
            @RequestParam("material") String material,
            @RequestParam("power_rating") String powerRating,
            @RequestParam("operating_system") String operatingSystem,
            @RequestParam("storage_capacity") String storageCapacity,
            @RequestParam("battery_life") String batteryLife,
            @RequestParam("manufacture_year") String manufactureYear,
            @RequestParam("description") String description,
            @RequestParam("quantity") String quantity,
            @RequestPart("imageFile") MultipartFile imageFile) {

        System.out.println(imageFile);
        System.out.println(UPLOAD_DIR);


        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String imagePath = null;
        if (!imageFile.isEmpty()) {
            try {
                String cleanedName = name.replaceAll("\\s+", "_"); // thay bằng dấu _
                String fileName = catId + cleanedName + "_" + (int)(Math.random() * 1000000) + ".jpg";
                File saveFile = new File(UPLOAD_DIR + fileName);
                imageFile.transferTo(saveFile);
                imagePath = "/resources/uploads/" + fileName;
            } catch (IOException e) {
                return ResponseEntity.badRequest().body("Upload ảnh thất bại!");
            }
        }

        // Gán category và brand bằng id
        Category category = new Category();
        category.setCat_id(catId);

        Brand brand = new Brand();
        brand.setBrand_id(brandId);

        String electronic_id = catId + "_" + brandId + "_" + UUID.randomUUID();

        Electronic electronic = new Electronic();
        electronic.setId(electronic_id);
        electronic.setCategory(category);
        electronic.setBrand(brand);
        electronic.setName(name);
        electronic.setMaterial(material);
        electronic.setPowerRating(powerRating);
        electronic.setOperatingSystem(operatingSystem);
        electronic.setStorageCapacity(storageCapacity);
        electronic.setBatteryLife(batteryLife);
        electronic.setManufactureYear(manufactureYear);
        electronic.setDescription(description);
        electronic.setQuantity(Integer.valueOf(quantity));
        electronic.setImage(imagePath);

        electronicRepository.insertElectronic(electronic);
        return ResponseEntity.ok(electronic);
    }


}

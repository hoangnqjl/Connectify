package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Brand;
import com.qhoang.connectify.entities.Category;
import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.service.ElectronicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/electronics") // đường dẫn đầu
public class ElectronicController {

    @Autowired
    private ElectronicService electronicService;

    private final String UPLOAD_DIR = "D:/Project/ConnectifyShop/Data/";

    @GetMapping
    public ResponseEntity<List<Electronic>> getAll() {
        return ResponseEntity.ok(electronicService.getAllElectronics());
    }

    // them san pham
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addElectronic(
            @RequestParam("cat_id") int catId,
            @RequestParam("brand_id") String brandId,
            @RequestParam("name") String name,
            @RequestParam("cpu") String cpu,
            @RequestParam("ram") String ram,
            @RequestParam("gpu") String gpu,
            @RequestParam("material") String material,
            @RequestParam("power_rating") String powerRating,
            @RequestParam("operating_system") String operatingSystem,
            @RequestParam("storage_capacity") String storageCapacity,
            @RequestParam("battery_life") String batteryLife,
            @RequestParam("price") String price,
            @RequestParam("manufacture_year") String manufactureYear,
            @RequestParam("description") String description,
            @RequestParam("quantity") String quantity,
            @RequestParam("status") String status,
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
                imagePath = "/uploads/" + fileName;
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
        electronic.setPrice(price);
        electronic.setCpu(cpu);
        electronic.setRam(ram);
        electronic.setGpu(gpu);
        electronic.setPowerRating(powerRating);
        electronic.setOperatingSystem(operatingSystem);
        electronic.setStorageCapacity(storageCapacity);
        electronic.setBatteryLife(batteryLife);
        electronic.setManufactureYear(manufactureYear);
        electronic.setDescription(description);
        electronic.setQuantity(Integer.valueOf(quantity));
        electronic.setStatus(status);
        electronic.setImage(imagePath);

        electronicService.insertElectronic(electronic);
        return ResponseEntity.ok(electronic);
    }


    @PostMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateElectronic(
            @RequestParam("id") String id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "material", required = false) String material,
            @RequestParam(value = "power_rating", required = false) String powerRating,
            @RequestParam(value = "operating_system", required = false) String operatingSystem,
            @RequestParam(value = "storage_capacity", required = false) String storageCapacity,
            @RequestParam(value = "battery_life", required = false) String batteryLife,
            @RequestParam(value = "manufacture_year", required = false) String manufactureYear,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "quantity", required = false) String quantity,
            @RequestParam(value = "status", required = false) String status,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        Map<String, Object> response = new HashMap<>();

        // Tìm sản phẩm theo ID
        Electronic existing = electronicService.getElectronicById(id);
        if (existing == null) {
            response.put("error", "Not Found");
            response.put("message", "Không tìm thấy sản phẩm với ID: " + id);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Cập nhật các thuộc tính nếu được cung cấp
        if (name != null) existing.setName(name);
        if (material != null) existing.setMaterial(material);
        if (powerRating != null) existing.setPowerRating(powerRating);
        if (operatingSystem != null) existing.setOperatingSystem(operatingSystem);
        if (storageCapacity != null) existing.setStorageCapacity(storageCapacity);
        if (batteryLife != null) existing.setBatteryLife(batteryLife);
        if (manufactureYear != null) existing.setManufactureYear(manufactureYear);
        if (description != null) existing.setDescription(description);

        if (quantity != null) {
            try {
                existing.setQuantity(Integer.parseInt(quantity));
            } catch (NumberFormatException e) {
                response.put("error", "Bad Request");
                response.put("message", "Số lượng không hợp lệ.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        }

        // Kiểm tra status hợp lệ
        if (status != null) {
            if (status.equalsIgnoreCase("instock") || status.equalsIgnoreCase("outofstock")) {
                existing.setStatus(status.toLowerCase());
            } else {
                response.put("error", "Invalid Status");
                response.put("message", "Giá trị trạng thái không hợp lệ: chỉ chấp nhận 'instock' hoặc 'outofstock'.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        }

        // Xử lý ảnh nếu có
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String cleanedName = (name != null ? name : existing.getName()).replaceAll("\\s+", "_");
                int catId = existing.getCategory().getCat_id();
                String fileName = catId + cleanedName + "_" + (int)(Math.random() * 1000000) + ".jpg";
                File saveFile = new File(UPLOAD_DIR + fileName);
                imageFile.transferTo(saveFile);
                existing.setImage("/uploads/" + fileName);
            } catch (IOException e) {
                response.put("error", "Image Upload Failed");
                response.put("message", "Lỗi khi cập nhật ảnh.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        }

        electronicService.updateElectronic(existing);

        response.put("message", "Cập nhật dữ liệu thành công");
        response.put("data", existing);
        return ResponseEntity.ok(response);
    }


    // tìm kiếm
    @GetMapping("/search")
    public ResponseEntity<List<Electronic>> searchElectronics(@RequestParam("keyword") String keyword) {
        List<Electronic> results = electronicService.searchElectronics(keyword);
        if (results.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(results);
    }

    // xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteElectronic(@PathVariable("id") String id) {
        Map<String, Object> response = new HashMap<>();
        Electronic existing = electronicService.getElectronicById(id);
        if (existing == null) {
            response.put("msg", "Không tìm thấy sản phẩm");
            response.put("id", id);
        }

        // Xóa ảnh nếu có
        if (existing.getImage() != null) {
            String imagePath = existing.getImage().replace("/uploads/", "");
            File imageFile = new File(UPLOAD_DIR + imagePath);
            if (imageFile.exists()) {
                imageFile.delete();
            }
        }


        response.put("msg", "Đã xóa sản phẩm thành công");
        response.put("id", id);

        electronicService.deleteElectronic(id);
        return ResponseEntity.ok(response);
    }



}

package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Brand;
import com.qhoang.connectify.repository.BrandRepository;
import com.qhoang.connectify.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/brands")
@CrossOrigin(origins = {"http://localhost:8000", "http://localhost:3000"})
public class BrandController {

    private final BrandRepository brandRepository;
    private final AuthorizationService authorizationService;

    @Autowired
    public BrandController(BrandRepository brandRepository, AuthorizationService authorizationService) {
        this.brandRepository = brandRepository;
        this.authorizationService = authorizationService;
    }

    // GET all brands
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandRepository.findAll();  // Sử dụng findAll() từ JpaRepository
        return ResponseEntity.ok(brands);
    }

    // POST new brand
    @PostMapping
    public ResponseEntity<?> addBrand(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Brand brand) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền thêm thương hiệu"));
        }

        Map<String, Object> response = new HashMap<>();

        // Validation brand_name
        if (brand.getBrand_name() == null || brand.getBrand_name().trim().isEmpty()) {
            response.put("error", "Invalid Data");
            response.put("message", "Tên thương hiệu không được để trống");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Tạo brand_id nếu chưa có
        if (brand.getBrand_id() == null || brand.getBrand_id().trim().isEmpty()) {
            String brandId = brand.getBrand_name().toLowerCase()
                    .replaceAll("\\s+", "_")
                    .replaceAll("[^a-z0-9_]", "")
                    + "_brand_" + System.currentTimeMillis();
            brand.setBrand_id(brandId);
        }

        // Kiểm tra brand_id đã tồn tại chưa
        if (brandRepository.existsById(brand.getBrand_id())) {
            response.put("error", "Duplicate ID");
            response.put("message", "Thương hiệu với ID này đã tồn tại: " + brand.getBrand_id());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        try {
            brand.setBrand_name(brand.getBrand_name().trim());
            Brand savedBrand = brandRepository.save(brand);
            response.put("success", true);
            response.put("data", savedBrand);
            response.put("message", "Thêm thương hiệu thành công");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("error", "Create Failed");
            response.put("message", "Lỗi khi thêm thương hiệu: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // GET brand by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBrandById(@PathVariable String id) {
        Optional<Brand> brandOptional = brandRepository.findById(id);
        if (brandOptional.isPresent()) {
            return ResponseEntity.ok(brandOptional.get());
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Not Found");
            response.put("message", "Không tìm thấy thương hiệu với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // PUT update brand
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id,
            @RequestBody Brand brand) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật thương hiệu"));
        }

        Map<String, Object> response = new HashMap<>();

        // Kiểm tra brand có tồn tại không
        Optional<Brand> existingBrandOptional = brandRepository.findById(id);
        if (!existingBrandOptional.isPresent()) {
            response.put("error", "Not Found");
            response.put("message", "Không tìm thấy thương hiệu với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Validation brand_name
        if (brand.getBrand_name() == null || brand.getBrand_name().trim().isEmpty()) {
            response.put("error", "Invalid Data");
            response.put("message", "Tên thương hiệu không được để trống");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Cập nhật brand
        Brand existingBrand = existingBrandOptional.get();
        existingBrand.setBrand_name(brand.getBrand_name().trim());

        try {
            Brand updatedBrand = brandRepository.save(existingBrand);
            response.put("success", true);
            response.put("data", updatedBrand);
            response.put("message", "Cập nhật thương hiệu thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Update Failed");
            response.put("message", "Lỗi khi cập nhật thương hiệu: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // DELETE brand
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xóa thương hiệu"));
        }

        Map<String, Object> response = new HashMap<>();

        // Kiểm tra brand có tồn tại không
        Optional<Brand> existingBrandOptional = brandRepository.findById(id);
        if (!existingBrandOptional.isPresent()) {
            response.put("error", "Not Found");
            response.put("message", "Không tìm thấy thương hiệu với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        try {
            brandRepository.deleteById(id);
            response.put("success", true);
            response.put("message", "Xóa thương hiệu thành công");
            response.put("deletedId", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Có thể là lỗi ràng buộc khóa ngoại (brand đang được sử dụng bởi products)
            response.put("error", "Delete Failed");
            response.put("message", "Không thể xóa thương hiệu này vì đang được sử dụng bởi các sản phẩm");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }
}

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
                    .body("Bạn không có quyền thêm thương hiệu");
        }
        brandRepository.save(brand);  // Sử dụng save() từ JpaRepository
        return ResponseEntity.status(HttpStatus.CREATED).body("Brand added successfully");
    }
}

package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Brand;
import com.qhoang.connectify.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
@CrossOrigin(origins = "*")
public class BrandController {

    private final BrandRepository brandRepository;

    @Autowired
    public BrandController(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    // GET all brands
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandRepository.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    // POST new brand
    @PostMapping
    public ResponseEntity<?> addBrand(@RequestBody Brand brand) {
        brandRepository.addBrand(brand);
        return ResponseEntity.status(HttpStatus.CREATED).body("Brand added successfully");
    }
}

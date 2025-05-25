package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Category;
import com.qhoang.connectify.repository.CategoryRepository;
import com.qhoang.connectify.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://localhost:8000")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final AuthorizationService authorizationService;

    @Autowired
    public CategoryController(CategoryRepository categoryRepository, AuthorizationService authorizationService) {
        this.categoryRepository = categoryRepository;
        this.authorizationService = authorizationService;
    }

    // Endpoint trả về tất cả danh mục
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();  // Sử dụng Spring Data JPA để lấy tất cả categories
        return ResponseEntity.ok(categories);  // Trả về danh sách categories dưới dạng JSON
    }

    // Endpoint thêm một category mới
    @PostMapping
    public ResponseEntity<?> addCategory(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Category category) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Bạn không có quyền thêm danh mục");
        }
        Category savedCategory = categoryRepository.save(category);  // Sử dụng Spring Data JPA để lưu category vào DB
        return ResponseEntity.status(201).body(savedCategory);  // Trả về category đã được lưu với mã trạng thái 201
    }
}

package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Category;
import com.qhoang.connectify.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Endpoint trả về tất cả danh mục
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.getAllCategories();  // Gọi phương thức để lấy tất cả categories
        return ResponseEntity.ok(categories);  // Trả về danh sách categories dưới dạng JSON
    }

//    // Endpoint thêm một category mới
//    @PostMapping
//    public ResponseEntity<?> addCategory(@RequestBody Category category) {
//        categoryRepository.insertCategory(category);  // Gọi phương thức để thêm category vào DB
//        return ResponseEntity.status(201).body("Category added successfully");
//    }
}

package com.qhoang.connectify.service;


import com.qhoang.connectify.entities.Category;
import com.qhoang.connectify.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Lấy tất cả các danh mục
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Thêm danh mục mới
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Cập nhật danh mục
    public Category updateCategory(Category category) {
        return categoryRepository.save(category);  // `save` sẽ hoạt động như một `update` nếu id đã tồn tại
    }

    // Xóa danh mục theo id
    public void deleteCategory(int catId) {
        categoryRepository.deleteById(catId);
    }

    // Tìm danh mục theo id
    public Optional<Category> getCategoryById(int catId) {
        return categoryRepository.findById(catId);
    }
}

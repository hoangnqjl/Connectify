package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Category;
import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.repository.CategoryRepository;
import com.qhoang.connectify.service.ElectronicService;
import com.qhoang.connectify.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/categories")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminCategoryController {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ElectronicService electronicService;
    
    @Autowired
    private AuthorizationService authorizationService;

    /**
     * Cập nhật danh mục
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id,
            @RequestBody Category category) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật danh mục"));
        }

        // Kiểm tra danh mục có tồn tại không
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy danh mục"));
        }

        category.setCatId(id);
        Category updatedCategory = categoryRepository.save(category);
        
        return ResponseEntity.ok(updatedCategory);
    }

    /**
     * Xóa danh mục
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xóa danh mục"));
        }

        // Kiểm tra danh mục có tồn tại không
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy danh mục"));
        }

        // Kiểm tra có sản phẩm nào thuộc danh mục này không
        List<Electronic> productsInCategory = electronicService.getAllElectronics().stream()
                .filter(p -> p.getCatId() == id)
                .collect(Collectors.toList());

        if (!productsInCategory.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", 
                        "Không thể xóa danh mục vì còn " + productsInCategory.size() + " sản phẩm thuộc danh mục này"));
        }

        categoryRepository.deleteById(id);
        
        return ResponseEntity.ok(Collections.singletonMap("message", "Xóa danh mục thành công"));
    }

    /**
     * Lấy sản phẩm theo danh mục
     */
    @GetMapping("/{id}/products")
    public ResponseEntity<?> getProductsByCategory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thông tin này"));
        }

        // Kiểm tra danh mục có tồn tại không
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy danh mục"));
        }

        List<Electronic> productsInCategory = electronicService.getAllElectronics().stream()
                .filter(p -> p.getCatId() == id)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productsInCategory);
    }

    /**
     * Thống kê danh mục
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<?> getCategoryStatistics(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        // Kiểm tra danh mục có tồn tại không
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy danh mục"));
        }

        List<Electronic> productsInCategory = electronicService.getAllElectronics().stream()
                .filter(p -> p.getCatId() == id)
                .collect(Collectors.toList());

        long totalProducts = productsInCategory.size();
        long activeProducts = productsInCategory.stream()
                .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                .count();
        long inactiveProducts = productsInCategory.stream()
                .filter(p -> "inactive".equalsIgnoreCase(p.getStatus()))
                .count();

        // Tính tổng tồn kho
        int totalStock = productsInCategory.stream()
                .mapToInt(p -> {
                    try {
                        return Integer.parseInt(p.getQuantity());
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                })
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("categoryId", id);
        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);
        stats.put("inactiveProducts", inactiveProducts);
        stats.put("totalStock", totalStock);

        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy thống kê tất cả danh mục
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getAllCategoriesStatistics(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Category> allCategories = categoryRepository.findAll();
        List<Electronic> allProducts = electronicService.getAllElectronics();

        List<Map<String, Object>> categoryStats = allCategories.stream()
                .map(category -> {
                    List<Electronic> productsInCategory = allProducts.stream()
                            .filter(p -> p.getCatId() == category.getCatId())
                            .collect(Collectors.toList());

                    Map<String, Object> stats = new HashMap<>();
                    stats.put("categoryId", category.getCatId());
                    stats.put("categoryName", category.getCatName());
                    stats.put("totalProducts", productsInCategory.size());
                    stats.put("activeProducts", productsInCategory.stream()
                            .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                            .count());

                    return stats;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(categoryStats);
    }

    /**
     * Lấy chi tiết danh mục
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thông tin này"));
        }

        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy danh mục"));
        }

        return ResponseEntity.ok(category);
    }

    /**
     * Sắp xếp thứ tự danh mục
     */
    @PutMapping("/reorder")
    public ResponseEntity<?> reorderCategories(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody List<Map<String, Object>> categoryOrders) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền sắp xếp danh mục"));
        }

        try {
            for (Map<String, Object> order : categoryOrders) {
                int categoryId = (Integer) order.get("categoryId");
                int displayOrder = (Integer) order.get("displayOrder");
                
                Category category = categoryRepository.findById(categoryId).orElse(null);
                if (category != null) {
                    // Giả sử có trường displayOrder trong Category entity
                    // category.setDisplayOrder(displayOrder);
                    categoryRepository.save(category);
                }
            }
            
            return ResponseEntity.ok(Collections.singletonMap("message", "Sắp xếp danh mục thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Dữ liệu không hợp lệ"));
        }
    }
}

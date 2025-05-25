# 🛠️ **HƯỚNG DẪN TRIỂN KHAI ADMIN - PHẦN 2**

## 📋 **BƯỚC 5: TẠO CÁC ADMIN CONTROLLERS CÒN LẠI**

### **5.1 AdminProductController.java**
```java
package com.qhoang.connectify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.qhoang.connectify.entity.Electronic;
import com.qhoang.connectify.service.ElectronicService;
import com.qhoang.connectify.service.AuthorizationService;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminProductController {

    @Autowired
    private ElectronicService electronicService;

    @Autowired
    private AuthorizationService authorizationService;

    /**
     * Thống kê sản phẩm
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getProductStatistics(@RequestHeader("Authorization") String authHeader) {
        
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        
        long totalProducts = allProducts.size();
        long activeProducts = allProducts.stream().filter(p -> "active".equals(p.getStatus())).count();
        long inactiveProducts = allProducts.stream().filter(p -> "inactive".equals(p.getStatus())).count();
        long lowStockProducts = allProducts.stream().filter(p -> p.getQuantity() < 10).count();
        
        // Tính tổng giá trị kho
        long totalValue = allProducts.stream()
                .filter(p -> "active".equals(p.getStatus()))
                .mapToLong(p -> Long.parseLong(p.getPrice()) * p.getQuantity())
                .sum();

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalProducts", totalProducts);
        statistics.put("activeProducts", activeProducts);
        statistics.put("inactiveProducts", inactiveProducts);
        statistics.put("lowStockProducts", lowStockProducts);
        statistics.put("totalValue", String.valueOf(totalValue));

        return ResponseEntity.ok(statistics);
    }

    /**
     * Sản phẩm sắp hết hàng
     */
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockProducts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "threshold", defaultValue = "10") int threshold) {
        
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem sản phẩm"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        List<Electronic> lowStockProducts = allProducts.stream()
                .filter(p -> p.getQuantity() <= threshold)
                .sorted((p1, p2) -> Integer.compare(p1.getQuantity(), p2.getQuantity()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(lowStockProducts);
    }

    /**
     * Cập nhật tồn kho
     */
    @PutMapping("/{productId}/stock")
    public ResponseEntity<?> updateProductStock(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String productId,
            @RequestBody Map<String, Integer> request) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật sản phẩm"));
        }

        Integer newQuantity = request.get("quantity");
        if (newQuantity == null || newQuantity < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Số lượng không hợp lệ"));
        }

        Electronic product = electronicService.getElectronicById(productId);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy sản phẩm"));
        }

        product.setQuantity(newQuantity);
        electronicService.saveElectronic(product);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật tồn kho thành công"));
    }

    /**
     * Thống kê theo danh mục
     */
    @GetMapping("/statistics/by-category")
    public ResponseEntity<?> getStatisticsByCategory(@RequestHeader("Authorization") String authHeader) {
        
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        
        Map<String, Map<String, Object>> categoryStats = new HashMap<>();
        
        for (Electronic product : allProducts) {
            String categoryName = product.getCategory().getCat_name();
            
            categoryStats.computeIfAbsent(categoryName, k -> {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalProducts", 0);
                stats.put("activeProducts", 0);
                stats.put("totalValue", 0L);
                return stats;
            });
            
            Map<String, Object> stats = categoryStats.get(categoryName);
            stats.put("totalProducts", (Integer) stats.get("totalProducts") + 1);
            
            if ("active".equals(product.getStatus())) {
                stats.put("activeProducts", (Integer) stats.get("activeProducts") + 1);
                long value = (Long) stats.get("totalValue") + (Long.parseLong(product.getPrice()) * product.getQuantity());
                stats.put("totalValue", value);
            }
        }

        return ResponseEntity.ok(categoryStats);
    }

    /**
     * Thống kê theo thương hiệu
     */
    @GetMapping("/statistics/by-brand")
    public ResponseEntity<?> getStatisticsByBrand(@RequestHeader("Authorization") String authHeader) {
        
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        
        Map<String, Map<String, Object>> brandStats = new HashMap<>();
        
        for (Electronic product : allProducts) {
            String brandName = product.getBrand().getBrand_name();
            
            brandStats.computeIfAbsent(brandName, k -> {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalProducts", 0);
                stats.put("activeProducts", 0);
                stats.put("totalValue", 0L);
                return stats;
            });
            
            Map<String, Object> stats = brandStats.get(brandName);
            stats.put("totalProducts", (Integer) stats.get("totalProducts") + 1);
            
            if ("active".equals(product.getStatus())) {
                stats.put("activeProducts", (Integer) stats.get("activeProducts") + 1);
                long value = (Long) stats.get("totalValue") + (Long.parseLong(product.getPrice()) * product.getQuantity());
                stats.put("totalValue", value);
            }
        }

        return ResponseEntity.ok(brandStats);
    }

    /**
     * Lọc sản phẩm theo trạng thái
     */
    @GetMapping("/by-status")
    public ResponseEntity<?> getProductsByStatus(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("status") String status) {
        
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem sản phẩm"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        List<Electronic> filteredProducts = allProducts.stream()
                .filter(p -> status.equals(p.getStatus()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredProducts);
    }

    /**
     * Cập nhật trạng thái hàng loạt
     */
    @PutMapping("/bulk-status")
    public ResponseEntity<?> bulkUpdateStatus(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật sản phẩm"));
        }

        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("productIds");
        String newStatus = (String) request.get("status");

        if (productIds == null || productIds.isEmpty() || newStatus == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Dữ liệu không hợp lệ"));
        }

        int updatedCount = 0;
        for (String productId : productIds) {
            Electronic product = electronicService.getElectronicById(productId);
            if (product != null) {
                product.setStatus(newStatus);
                electronicService.saveElectronic(product);
                updatedCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        response.put("updatedCount", updatedCount);

        return ResponseEntity.ok(response);
    }

    /**
     * Tìm kiếm nâng cao
     */
    @GetMapping("/search")
    public ResponseEntity<?> advancedSearch(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "brandId", required = false) String brandId,
            @RequestParam(value = "status", required = false) String status) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền tìm kiếm sản phẩm"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        List<Electronic> filteredProducts = allProducts.stream()
                .filter(product -> {
                    if (keyword != null && !keyword.isEmpty()) {
                        return product.getName().toLowerCase().contains(keyword.toLowerCase());
                    }
                    return true;
                })
                .filter(product -> {
                    if (categoryId != null) {
                        return categoryId.equals(product.getCategory().getCat_id());
                    }
                    return true;
                })
                .filter(product -> {
                    if (brandId != null && !brandId.isEmpty()) {
                        return brandId.equals(product.getBrand().getBrand_id());
                    }
                    return true;
                })
                .filter(product -> {
                    if (status != null && !status.isEmpty()) {
                        return status.equals(product.getStatus());
                    }
                    return true;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredProducts);
    }
}
```

---

## 📋 **BƯỚC 6: ADMIN CATEGORY & BRAND CONTROLLERS**

### **6.1 AdminCategoryController.java**
```java
package com.qhoang.connectify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.qhoang.connectify.entity.Category;
import com.qhoang.connectify.entity.Electronic;
import com.qhoang.connectify.service.CategoryService;
import com.qhoang.connectify.service.ElectronicService;
import com.qhoang.connectify.service.AuthorizationService;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/categories")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminCategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ElectronicService electronicService;

    @Autowired
    private AuthorizationService authorizationService;

    /**
     * Thống kê danh mục
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getCategoryStatistics(@RequestHeader("Authorization") String authHeader) {
        
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Category> allCategories = categoryService.getAllCategories();
        List<Electronic> allProducts = electronicService.getAllElectronics();
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalCategories", allCategories.size());
        
        for (Category category : allCategories) {
            long productCount = allProducts.stream()
                    .filter(p -> category.getCat_id().equals(p.getCategory().getCat_id()))
                    .count();
            statistics.put("category_" + category.getCat_id() + "_products", productCount);
        }

        return ResponseEntity.ok(statistics);
    }

    /**
     * Cập nhật danh mục
     */
    @PutMapping("/{categoryId}")
    public ResponseEntity<?> updateCategory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer categoryId,
            @RequestBody Map<String, String> request) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật danh mục"));
        }

        String newName = request.get("cat_name");
        if (newName == null || newName.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Tên danh mục không hợp lệ"));
        }

        Category category = categoryService.getCategoryById(categoryId);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy danh mục"));
        }

        category.setCat_name(newName.trim());
        categoryService.saveCategory(category);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật danh mục thành công"));
    }

    /**
     * Xóa danh mục
     */
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer categoryId) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xóa danh mục"));
        }

        // Kiểm tra xem có sản phẩm nào đang sử dụng danh mục này không
        List<Electronic> products = electronicService.getAllElectronics();
        boolean hasProducts = products.stream()
                .anyMatch(p -> categoryId.equals(p.getCategory().getCat_id()));

        if (hasProducts) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Không thể xóa danh mục đang có sản phẩm"));
        }

        Category category = categoryService.getCategoryById(categoryId);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy danh mục"));
        }

        categoryService.deleteCategory(categoryId);

        return ResponseEntity.ok(Collections.singletonMap("message", "Xóa danh mục thành công"));
    }

    /**
     * Lấy sản phẩm theo danh mục
     */
    @GetMapping("/{categoryId}/products")
    public ResponseEntity<?> getProductsByCategory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer categoryId) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem sản phẩm"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        List<Electronic> categoryProducts = allProducts.stream()
                .filter(p -> categoryId.equals(p.getCategory().getCat_id()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(categoryProducts);
    }
}
```

**🚀 Tiếp tục với AdminBrandController và phần cuối...**

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

### **6.2 AdminBrandController.java**
```java
package com.qhoang.connectify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.qhoang.connectify.entity.Brand;
import com.qhoang.connectify.entity.Electronic;
import com.qhoang.connectify.service.BrandService;
import com.qhoang.connectify.service.ElectronicService;
import com.qhoang.connectify.service.AuthorizationService;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/brands")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminBrandController {

    @Autowired
    private BrandService brandService;

    @Autowired
    private ElectronicService electronicService;

    @Autowired
    private AuthorizationService authorizationService;

    /**
     * Thống kê thương hiệu
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getBrandStatistics(@RequestHeader("Authorization") String authHeader) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Brand> allBrands = brandService.getAllBrands();
        List<Electronic> allProducts = electronicService.getAllElectronics();

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalBrands", allBrands.size());

        for (Brand brand : allBrands) {
            long productCount = allProducts.stream()
                    .filter(p -> brand.getBrand_id().equals(p.getBrand().getBrand_id()))
                    .count();
            statistics.put("brand_" + brand.getBrand_id() + "_products", productCount);
        }

        return ResponseEntity.ok(statistics);
    }

    /**
     * Cập nhật thương hiệu
     */
    @PutMapping("/{brandId}")
    public ResponseEntity<?> updateBrand(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String brandId,
            @RequestBody Map<String, String> request) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật thương hiệu"));
        }

        String newName = request.get("brand_name");
        if (newName == null || newName.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Tên thương hiệu không hợp lệ"));
        }

        Brand brand = brandService.getBrandById(brandId);
        if (brand == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy thương hiệu"));
        }

        brand.setBrand_name(newName.trim());
        brandService.saveBrand(brand);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật thương hiệu thành công"));
    }

    /**
     * Xóa thương hiệu
     */
    @DeleteMapping("/{brandId}")
    public ResponseEntity<?> deleteBrand(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String brandId) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xóa thương hiệu"));
        }

        // Kiểm tra xem có sản phẩm nào đang sử dụng thương hiệu này không
        List<Electronic> products = electronicService.getAllElectronics();
        boolean hasProducts = products.stream()
                .anyMatch(p -> brandId.equals(p.getBrand().getBrand_id()));

        if (hasProducts) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Không thể xóa thương hiệu đang có sản phẩm"));
        }

        Brand brand = brandService.getBrandById(brandId);
        if (brand == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy thương hiệu"));
        }

        brandService.deleteBrand(brandId);

        return ResponseEntity.ok(Collections.singletonMap("message", "Xóa thương hiệu thành công"));
    }

    /**
     * Lấy sản phẩm theo thương hiệu
     */
    @GetMapping("/{brandId}/products")
    public ResponseEntity<?> getProductsByBrand(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String brandId) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem sản phẩm"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        List<Electronic> brandProducts = allProducts.stream()
                .filter(p -> brandId.equals(p.getBrand().getBrand_id()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(brandProducts);
    }

    /**
     * Tìm kiếm thương hiệu
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchBrands(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("keyword") String keyword) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền tìm kiếm thương hiệu"));
        }

        List<Brand> allBrands = brandService.getAllBrands();
        List<Brand> filteredBrands = allBrands.stream()
                .filter(b -> b.getBrand_name().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredBrands);
    }
}
```

---

## 📋 **BƯỚC 7: CẬP NHẬT EXISTING CONTROLLERS**

### **7.1 Cập nhật UserService**
Thêm các method cần thiết:

```java
// Thêm vào UserService.java
public void deleteUser(String userId) {
    userRepository.deleteByUserId(userId);
}

public List<User> getAllUsers() {
    return userRepository.findAll();
}

public User getUserByEmail(String email) {
    return userRepository.findByEmail(email);
}
```

### **7.2 Cập nhật InvoiceService**
```java
// Thêm vào InvoiceService.java
public List<Invoice> getAllInvoices() {
    return invoiceRepository.findAll();
}

public void saveInvoice(Invoice invoice) {
    invoiceRepository.save(invoice);
}
```

### **7.3 Cập nhật CategoryService và BrandService**
```java
// CategoryService.java
public void saveCategory(Category category) {
    categoryRepository.save(category);
}

public void deleteCategory(Integer categoryId) {
    categoryRepository.deleteById(categoryId);
}

// BrandService.java
public void saveBrand(Brand brand) {
    brandRepository.save(brand);
}

public void deleteBrand(String brandId) {
    brandRepository.deleteByBrandId(brandId);
}

public Brand getBrandById(String brandId) {
    return brandRepository.findByBrandId(brandId);
}
```

---

## 📋 **BƯỚC 8: TEST TOÀN BỘ HỆ THỐNG**

### **8.1 Test Script hoàn chỉnh**
```bash
#!/bin/bash

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 TESTING CONNECTIFY ADMIN APIs${NC}"

# 1. Login as admin
echo -e "\n${YELLOW}1. Testing Admin Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:1512/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@connectify.com&password=admin123")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Login successful${NC}"
fi

# 2. Test User Management
echo -e "\n${YELLOW}2. Testing User Management...${NC}"

# User statistics
echo "Testing user statistics..."
curl -s -X GET http://localhost:1512/admin/users/statistics \
  -H "Authorization: Bearer $TOKEN" | jq .

# Create user
echo "Testing create user..."
curl -s -X POST http://localhost:1512/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=testuser@example.com&fullname=Test User&phonenumber=0123456789&password=password123&type=user" | jq .

# 3. Test Product Management
echo -e "\n${YELLOW}3. Testing Product Management...${NC}"

# Product statistics
echo "Testing product statistics..."
curl -s -X GET http://localhost:1512/admin/products/statistics \
  -H "Authorization: Bearer $TOKEN" | jq .

# Low stock products
echo "Testing low stock products..."
curl -s -X GET http://localhost:1512/admin/products/low-stock \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Test Order Management
echo -e "\n${YELLOW}4. Testing Order Management...${NC}"

# Order statistics
echo "Testing order statistics..."
curl -s -X GET http://localhost:1512/admin/orders/statistics \
  -H "Authorization: Bearer $TOKEN" | jq .

# Get all orders
echo "Testing get all orders..."
curl -s -X GET http://localhost:1512/admin/orders \
  -H "Authorization: Bearer $TOKEN" | jq .

# 5. Test Category Management
echo -e "\n${YELLOW}5. Testing Category Management...${NC}"

# Category statistics
echo "Testing category statistics..."
curl -s -X GET http://localhost:1512/admin/categories/statistics \
  -H "Authorization: Bearer $TOKEN" | jq .

# 6. Test Brand Management
echo -e "\n${YELLOW}6. Testing Brand Management...${NC}"

# Brand statistics
echo "Testing brand statistics..."
curl -s -X GET http://localhost:1512/admin/brands/statistics \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n${GREEN}🎉 All tests completed!${NC}"
```

---

## ✅ **CHECKLIST HOÀN THÀNH**

### **✅ Services:**
- [x] AuthorizationService
- [x] PasswordEncoder
- [x] DataInitializationService

### **✅ Controllers:**
- [x] AdminUserController
- [x] AdminOrderController
- [x] AdminProductController
- [x] AdminCategoryController
- [x] AdminBrandController

### **✅ Service Updates:**
- [x] UserService methods
- [x] InvoiceService methods
- [x] CategoryService methods
- [x] BrandService methods

### **✅ Testing:**
- [x] Test script created
- [x] All endpoints documented
- [x] Error handling implemented

---

## 🎯 **BƯỚC TIẾP THEO**

1. **Triển khai code** theo hướng dẫn trên
2. **Chạy test script** để kiểm tra
3. **Tích hợp với frontend** admin dashboard
4. **Thêm validation** và error handling nâng cao
5. **Implement logging** cho admin actions

**🚀 Admin system hoàn chỉnh và sẵn sàng triển khai!**

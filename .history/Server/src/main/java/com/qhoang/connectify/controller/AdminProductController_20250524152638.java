package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Electronic;
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
@RequestMapping("/admin/products")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminProductController {

    @Autowired
    private ElectronicService electronicService;

    @Autowired
    private AuthorizationService authorizationService;

    /**
     * Thống kê sản phẩm tổng quan
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getProductStatistics(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();

        long totalProducts = allProducts.size();
        long activeProducts = allProducts.stream()
                .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                .count();
        long inactiveProducts = allProducts.stream()
                .filter(p -> "inactive".equalsIgnoreCase(p.getStatus()))
                .count();

        // Tính tổng số lượng tồn kho
        int totalStock = allProducts.stream()
                .mapToInt(p -> {
                    try {
                        return p.getQuantity() != null ? p.getQuantity() : 0;
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);
        stats.put("inactiveProducts", inactiveProducts);
        stats.put("totalStock", totalStock);

        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy danh sách sản phẩm sắp hết hàng
     */
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockProducts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "threshold", defaultValue = "10") int threshold) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thông tin này"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        List<Electronic> lowStockProducts = allProducts.stream()
                .filter(p -> {
                    try {
                        Integer quantity = p.getQuantity();
                        return quantity != null && quantity <= threshold && quantity > 0;
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(lowStockProducts);
    }

    /**
     * Cập nhật số lượng tồn kho
     */
    @PutMapping("/{productId}/stock")
    public ResponseEntity<?> updateStock(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String productId,
            @RequestParam("quantity") int quantity) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật tồn kho"));
        }

        Electronic product = electronicService.getElectronicById(productId);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy sản phẩm"));
        }

        if (quantity < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Số lượng không thể âm"));
        }

        product.setQuantity(quantity);
        electronicService.updateElectronic(product);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật tồn kho thành công"));
    }

    /**
     * Thống kê theo danh mục
     */
    @GetMapping("/statistics/by-category")
    public ResponseEntity<?> getStatisticsByCategory(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();

        Map<Integer, Long> categoryStats = allProducts.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getCategory() != null ? p.getCategory().getCat_id() : -1,
                    Collectors.counting()
                ));

        return ResponseEntity.ok(categoryStats);
    }

    /**
     * Thống kê theo thương hiệu
     */
    @GetMapping("/statistics/by-brand")
    public ResponseEntity<?> getStatisticsByBrand(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();

        Map<String, Long> brandStats = allProducts.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getBrand() != null ? p.getBrand().getBrand_id() : "unknown",
                    Collectors.counting()
                ));

        return ResponseEntity.ok(brandStats);
    }

    /**
     * Lấy sản phẩm theo trạng thái
     */
    @GetMapping("/by-status")
    public ResponseEntity<?> getProductsByStatus(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("status") String status) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thông tin này"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        List<Electronic> filteredProducts = allProducts.stream()
                .filter(p -> status.equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredProducts);
    }

    /**
     * Cập nhật trạng thái sản phẩm hàng loạt
     */
    @PutMapping("/bulk-status")
    public ResponseEntity<?> bulkUpdateStatus(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("productIds") List<String> productIds,
            @RequestParam("status") String status) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật trạng thái"));
        }

        if (!status.equals("active") && !status.equals("inactive")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Trạng thái không hợp lệ"));
        }

        int updatedCount = 0;
        for (String productId : productIds) {
            Electronic product = electronicService.getElectronicById(productId);
            if (product != null) {
                product.setStatus(status);
                electronicService.updateElectronic(product);
                updatedCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        response.put("updatedCount", updatedCount);
        response.put("totalRequested", productIds.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Tìm kiếm sản phẩm nâng cao cho admin
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "brandId", required = false) String brandId,
            @RequestParam(value = "status", required = false) String status) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền tìm kiếm"));
        }

        List<Electronic> allProducts = electronicService.getAllElectronics();
        List<Electronic> filteredProducts = allProducts.stream()
                .filter(p -> {
                    boolean matches = true;

                    if (keyword != null && !keyword.trim().isEmpty()) {
                        matches = matches && (
                            p.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                            p.getDescription().toLowerCase().contains(keyword.toLowerCase())
                        );
                    }

                    if (categoryId != null) {
                        matches = matches && p.getCatId() == categoryId;
                    }

                    if (brandId != null && !brandId.trim().isEmpty()) {
                        matches = matches && brandId.equals(p.getBrandId());
                    }

                    if (status != null && !status.trim().isEmpty()) {
                        matches = matches && status.equalsIgnoreCase(p.getStatus());
                    }

                    return matches;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredProducts);
    }
}

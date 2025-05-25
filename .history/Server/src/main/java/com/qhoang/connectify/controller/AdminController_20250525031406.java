package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.service.AuthorizationService;
import com.qhoang.connectify.service.ElectronicService;
import com.qhoang.connectify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminController {

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private UserService userService;

    @Autowired
    private ElectronicService electronicService;

    // Admin User Statistics
    @GetMapping("/users/statistics")
    public ResponseEntity<?> getUserStatistics(@RequestHeader("Authorization") String authHeader) {
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền truy cập"));
        }

        try {
            List<User> users = userService.getAllUsers();
            long totalUsers = users.size();
            long adminCount = users.stream().filter(u -> "admin".equals(u.getType())).count();
            long userCount = users.stream().filter(u -> "user".equals(u.getType())).count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("adminCount", adminCount);
            stats.put("userCount", userCount);
            stats.put("newUsersThisMonth", Math.min(5, totalUsers));
            stats.put("activeUsers", Math.max(0, totalUsers - 1));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Lỗi: " + e.getMessage()));
        }
    }

    // Admin Product Statistics
    @GetMapping("/products/statistics")
    public ResponseEntity<?> getProductStatistics(@RequestHeader("Authorization") String authHeader) {
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền truy cập"));
        }

        try {
            List<Electronic> products = electronicService.getAllElectronics();
            long totalProducts = products.size();
            long activeProducts = products.stream().filter(p -> p.getQuantity() > 0).count();
            long inactiveProducts = products.stream().filter(p -> p.getQuantity() == 0).count();
            long totalStock = products.stream().mapToLong(Electronic::getQuantity).sum();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalProducts", totalProducts);
            stats.put("activeProducts", activeProducts);
            stats.put("inactiveProducts", inactiveProducts);
            stats.put("totalStock", totalStock);
            stats.put("lowStockProducts", products.stream().filter(p -> p.getQuantity() <= 10 && p.getQuantity() > 0).count());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Lỗi: " + e.getMessage()));
        }
    }

    // Admin Low Stock Products
    @GetMapping("/products/low-stock")
    public ResponseEntity<?> getLowStockProducts(
            @RequestParam(value = "threshold", defaultValue = "10") int threshold,
            @RequestHeader("Authorization") String authHeader) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền truy cập"));
        }

        try {
            List<Electronic> products = electronicService.getAllElectronics();
            List<Map<String, Object>> lowStockProducts = products.stream()
                    .filter(p -> p.getQuantity() <= threshold && p.getQuantity() > 0)
                    .map(p -> {
                        Map<String, Object> product = new HashMap<>();
                        product.put("id", p.getId());
                        product.put("name", p.getName());
                        product.put("quantity", p.getQuantity());
                        product.put("price", p.getPrice());
                        return product;
                    })
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(lowStockProducts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Lỗi: " + e.getMessage()));
        }
    }

    // Admin Order Statistics (Mock data vì chưa có order system)
    @GetMapping("/orders/statistics")
    public ResponseEntity<?> getOrderStatistics(@RequestHeader("Authorization") String authHeader) {
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền truy cập"));
        }

        try {
            // Mock data vì chưa có order system
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalOrders", 25);
            stats.put("pendingOrders", 5);
            stats.put("completedOrders", 18);
            stats.put("cancelledOrders", 2);
            stats.put("totalRevenue", "125000000");
            stats.put("todayRevenue", "5000000");

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Lỗi: " + e.getMessage()));
        }
    }
}

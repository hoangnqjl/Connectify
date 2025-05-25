# 🛠️ **HƯỚNG DẪN TRIỂN KHAI ADMIN - CONNECTIFY**

## 📋 **BƯỚC 1: TẠO CÁC SERVICE CẦN THIẾT**

### **1.1 AuthorizationService.java**
```java
package com.qhoang.connectify.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.qhoang.connectify.entity.User;
import com.qhoang.connectify.util.JwtUtil;

@Service
public class AuthorizationService {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    public boolean hasAdminAccess(String authHeader) {
        User user = getUserFromToken(authHeader);
        return user != null && "admin".equals(user.getType());
    }

    public User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.validateToken(token)) {
            return null;
        }

        String userId = jwtUtil.extractUsername(token);
        return userService.getUserByUserId(userId);
    }
}
```

### **1.2 PasswordEncoder.java**
```java
package com.qhoang.connectify.service;

import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class PasswordEncoder {

    public String encode(String password) {
        try {
            // Tạo salt ngẫu nhiên
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[16];
            random.nextBytes(salt);

            // Hash password với salt
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] hashedPassword = md.digest(password.getBytes("UTF-8"));

            // Kết hợp salt và hash
            byte[] combined = new byte[salt.length + hashedPassword.length];
            System.arraycopy(salt, 0, combined, 0, salt.length);
            System.arraycopy(hashedPassword, 0, combined, salt.length, hashedPassword.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Error encoding password", e);
        }
    }

    public boolean matches(String password, String encodedPassword) {
        try {
            byte[] combined = Base64.getDecoder().decode(encodedPassword);

            // Tách salt và hash
            byte[] salt = new byte[16];
            byte[] hash = new byte[combined.length - 16];
            System.arraycopy(combined, 0, salt, 0, 16);
            System.arraycopy(combined, 16, hash, 0, hash.length);

            // Hash password input với salt
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] hashedInput = md.digest(password.getBytes("UTF-8"));

            // So sánh
            return MessageDigest.isEqual(hash, hashedInput);
        } catch (Exception e) {
            return false;
        }
    }
}
```

### **1.3 DataInitializationService.java**
```java
package com.qhoang.connectify.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.qhoang.connectify.entity.User;
import javax.annotation.PostConstruct;
import java.util.Date;

@Component
public class DataInitializationService {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initializeAdminUser() {
        // Kiểm tra xem admin đã tồn tại chưa
        User existingAdmin = userService.getUserByEmail("admin@connectify.com");
        if (existingAdmin == null) {
            // Tạo admin user mặc định
            User admin = new User();
            admin.setUserId("admin_" + System.currentTimeMillis());
            admin.setUsername("admin");
            admin.setEmail("admin@connectify.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullname("Administrator");
            admin.setPhonenumber("0905785819");
            admin.setType("admin");
            admin.setAvatar(null);
            admin.setCreatedAt(new Date());
            admin.setUpdatedAt(new Date());

            userService.saveUser(admin);
            System.out.println("✅ Admin user created: admin@connectify.com / admin123");
        } else {
            System.out.println("✅ Admin user already exists");
        }
    }
}
```

---

## 📋 **BƯỚC 2: TẠO ADMIN CONTROLLERS**

### **2.1 AdminUserController.java**
```java
package com.qhoang.connectify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.qhoang.connectify.entity.User;
import com.qhoang.connectify.service.UserService;
import com.qhoang.connectify.service.AuthorizationService;
import com.qhoang.connectify.service.PasswordEncoder;

import java.util.*;

@RestController
@RequestMapping("/admin/users")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Thống kê users
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getUserStatistics(@RequestHeader("Authorization") String authHeader) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền truy cập"));
        }

        List<User> allUsers = userService.getAllUsers();

        long totalUsers = allUsers.size();
        long adminCount = allUsers.stream().filter(u -> "admin".equals(u.getType())).count();
        long userCount = allUsers.stream().filter(u -> "user".equals(u.getType())).count();

        // Tính users mới trong tháng này
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.DAY_OF_MONTH, 1);
        Date startOfMonth = cal.getTime();

        long newUsersThisMonth = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().after(startOfMonth))
                .count();

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalUsers", totalUsers);
        statistics.put("adminCount", adminCount);
        statistics.put("userCount", userCount);
        statistics.put("newUsersThisMonth", newUsersThisMonth);
        statistics.put("activeUsers", totalUsers); // Giả sử tất cả đều active

        return ResponseEntity.ok(statistics);
    }

    /**
     * Tạo user mới
     */
    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("email") String email,
            @RequestParam("fullname") String fullname,
            @RequestParam("phonenumber") String phonenumber,
            @RequestParam("password") String password,
            @RequestParam(value = "type", defaultValue = "user") String type) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền tạo người dùng"));
        }

        // Kiểm tra email đã tồn tại
        if (userService.getUserByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Email đã tồn tại"));
        }

        // Tạo user mới
        String userId = "user_" + System.currentTimeMillis();
        User user = new User();
        String[] parts = fullname.trim().toLowerCase().split("\\s+");
        String lastName = parts[parts.length - 1];
        char firstInitial = parts[0].charAt(0);
        String username = lastName + firstInitial;

        user.setUserId(userId);
        user.setUsername(username);
        user.setFullname(fullname);
        user.setEmail(email);
        user.setPhonenumber(phonenumber);
        user.setPassword(passwordEncoder.encode(password));
        user.setAvatar(null);
        user.setType(type);
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());

        userService.saveUser(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tạo người dùng thành công");
        response.put("userId", userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Cập nhật user
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId,
            @RequestParam(value = "fullname", required = false) String fullname,
            @RequestParam(value = "phonenumber", required = false) String phonenumber,
            @RequestParam(value = "type", required = false) String type) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật người dùng"));
        }

        User user = userService.getUserByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
        }

        if (fullname != null) user.setFullname(fullname);
        if (phonenumber != null) user.setPhonenumber(phonenumber);
        if (type != null) user.setType(type);
        user.setUpdatedAt(new Date());

        userService.saveUser(user);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật người dùng thành công"));
    }

    /**
     * Xóa user
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xóa người dùng"));
        }

        User user = userService.getUserByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
        }

        userService.deleteUser(userId);

        return ResponseEntity.ok(Collections.singletonMap("message", "Xóa người dùng thành công"));
    }

    /**
     * Lấy tất cả users
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem danh sách người dùng"));
        }

        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Tìm kiếm users
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "type", required = false) String type) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền tìm kiếm người dùng"));
        }

        List<User> allUsers = userService.getAllUsers();
        List<User> filteredUsers = new ArrayList<>();

        for (User user : allUsers) {
            boolean matches = true;

            if (keyword != null && !keyword.isEmpty()) {
                String lowerKeyword = keyword.toLowerCase();
                boolean keywordMatch = user.getFullname().toLowerCase().contains(lowerKeyword) ||
                                     user.getEmail().toLowerCase().contains(lowerKeyword) ||
                                     (user.getPhonenumber() != null && user.getPhonenumber().contains(keyword));
                if (!keywordMatch) matches = false;
            }

            if (type != null && !type.isEmpty()) {
                if (!type.equals(user.getType())) matches = false;
            }

            if (matches) {
                filteredUsers.add(user);
            }
        }

        return ResponseEntity.ok(filteredUsers);
    }
}
```

### **2.2 AdminOrderController.java**
```java
package com.qhoang.connectify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.qhoang.connectify.entity.Invoice;
import com.qhoang.connectify.service.InvoiceService;
import com.qhoang.connectify.service.AuthorizationService;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/orders")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminOrderController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private AuthorizationService authorizationService;

    /**
     * Thống kê đơn hàng
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getOrderStatistics(@RequestHeader("Authorization") String authHeader) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Invoice> allInvoices = invoiceService.getAllInvoices();

        long totalOrders = allInvoices.size();
        long pendingOrders = allInvoices.stream().filter(i -> "pending".equalsIgnoreCase(i.getStatus())).count();
        long processingOrders = allInvoices.stream().filter(i -> "processing".equalsIgnoreCase(i.getStatus())).count();
        long completedOrders = allInvoices.stream().filter(i -> "processed".equalsIgnoreCase(i.getStatus())).count();
        long cancelledOrders = allInvoices.stream().filter(i -> "cancelled".equalsIgnoreCase(i.getStatus())).count();

        // Tính tổng doanh thu
        long totalRevenue = allInvoices.stream()
                .filter(i -> !"cancelled".equalsIgnoreCase(i.getStatus()))
                .mapToLong(i -> i.getTotalPrice())
                .sum();

        // Doanh thu tháng này
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.DAY_OF_MONTH, 1);
        Date startOfMonth = cal.getTime();

        long revenueThisMonth = allInvoices.stream()
                .filter(i -> !"cancelled".equalsIgnoreCase(i.getStatus()))
                .filter(i -> i.getCreatedAt() != null && i.getCreatedAt().after(startOfMonth))
                .mapToLong(i -> i.getTotalPrice())
                .sum();

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalOrders", totalOrders);
        statistics.put("pendingOrders", pendingOrders);
        statistics.put("processingOrders", processingOrders);
        statistics.put("completedOrders", completedOrders);
        statistics.put("cancelledOrders", cancelledOrders);
        statistics.put("totalRevenue", totalRevenue);
        statistics.put("revenueThisMonth", revenueThisMonth);

        return ResponseEntity.ok(statistics);
    }

    /**
     * Lấy tất cả đơn hàng với bộ lọc
     */
    @GetMapping
    public ResponseEntity<?> getAllOrders(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "userId", required = false) String userId) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem đơn hàng"));
        }

        List<Invoice> allInvoices = invoiceService.getAllInvoices();
        List<Invoice> filteredInvoices = allInvoices.stream()
                .filter(invoice -> {
                    if (status != null && !status.isEmpty()) {
                        return status.equalsIgnoreCase(invoice.getStatus());
                    }
                    return true;
                })
                .filter(invoice -> {
                    if (userId != null && !userId.isEmpty()) {
                        return userId.equals(invoice.getUser().getUserId());
                    }
                    return true;
                })
                .sorted((i1, i2) -> i2.getCreatedAt().compareTo(i1.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredInvoices);
    }

    /**
     * Lấy chi tiết đơn hàng
     */
    @GetMapping("/{invoiceId}")
    public ResponseEntity<?> getOrderDetails(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String invoiceId) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem chi tiết đơn hàng"));
        }

        Invoice invoice = invoiceService.getInvoiceById(invoiceId);
        if (invoice == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy đơn hàng"));
        }

        return ResponseEntity.ok(invoice);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    @PutMapping("/{invoiceId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String invoiceId,
            @RequestBody Map<String, String> request) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật đơn hàng"));
        }

        String newStatus = request.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Trạng thái không hợp lệ"));
        }

        Invoice invoice = invoiceService.getInvoiceById(invoiceId);
        if (invoice == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy đơn hàng"));
        }

        invoice.setStatus(newStatus);
        invoiceService.saveInvoice(invoice);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật trạng thái thành công"));
    }

    /**
     * Lấy đơn hàng cần xử lý (pending)
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingOrders(@RequestHeader("Authorization") String authHeader) {

        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem đơn hàng"));
        }

        List<Invoice> allInvoices = invoiceService.getAllInvoices();
        List<Invoice> pendingInvoices = allInvoices.stream()
                .filter(i -> "pending".equalsIgnoreCase(i.getStatus()))
                .sorted((i1, i2) -> i2.getCreatedAt().compareTo(i1.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(pendingInvoices);
    }
}
```

---

## 📋 **BƯỚC 3: CẬP NHẬT EXISTING CONTROLLERS**

### **3.1 Thêm admin check vào ElectronicController**
Cập nhật các method POST, PUT, DELETE trong ElectronicController:

```java
@Autowired
private AuthorizationService authorizationService;

// Thêm vào method POST electronics
@PostMapping
public ResponseEntity<?> addElectronic(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Electronic electronic) {

    if (!authorizationService.hasAdminAccess(authHeader)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Collections.singletonMap("error", "Bạn không có quyền thêm sản phẩm"));
    }

    // Existing logic...
}

// Thêm vào method PUT electronics
@PutMapping("/update")
public ResponseEntity<?> updateElectronic(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Electronic electronic) {

    if (!authorizationService.hasAdminAccess(authHeader)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật sản phẩm"));
    }

    // Existing logic...
}

// Thêm vào method DELETE electronics
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteElectronic(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable String id) {

    if (!authorizationService.hasAdminAccess(authHeader)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Collections.singletonMap("error", "Bạn không có quyền xóa sản phẩm"));
    }

    // Existing logic...
}
```

### **3.2 Cập nhật CategoryController và BrandController**
Tương tự thêm admin check cho các method POST, PUT, DELETE.

---

## 📋 **BƯỚC 4: TEST ADMIN APIs**

### **4.1 Test Authentication**
```bash
# Login as admin
curl -X POST http://localhost:1512/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@connectify.com&password=admin123"

# Lưu token để test
export TOKEN="YOUR_TOKEN_HERE"
```

### **4.2 Test User Management**
```bash
# User statistics
curl -X GET http://localhost:1512/admin/users/statistics \
  -H "Authorization: Bearer $TOKEN"

# Create user
curl -X POST http://localhost:1512/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&fullname=Test User&phonenumber=0123456789&password=password123&type=user"
```

### **4.3 Test Order Management**
```bash
# Order statistics
curl -X GET http://localhost:1512/admin/orders/statistics \
  -H "Authorization: Bearer $TOKEN"

# Get all orders
curl -X GET http://localhost:1512/admin/orders \
  -H "Authorization: Bearer $TOKEN"

# Update order status
curl -X PUT http://localhost:1512/admin/orders/{invoiceId}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'
```

---

## ✅ **CHECKLIST TRIỂN KHAI**

### **Đã hoàn thành:**
- [x] AuthorizationService
- [x] PasswordEncoder
- [x] DataInitializationService
- [x] AdminUserController
- [x] AdminOrderController

### **Cần làm tiếp:**
- [ ] AdminProductController
- [ ] AdminCategoryController
- [ ] AdminBrandController
- [ ] Cập nhật existing controllers
- [ ] Test tất cả APIs

**🚀 Phần 1 hoàn thành! Tiếp tục với phần 2 để có đầy đủ admin functionality.**

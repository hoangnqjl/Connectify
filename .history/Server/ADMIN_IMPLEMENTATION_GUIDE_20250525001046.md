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

**🚀 Tiếp tục với các controllers khác trong phần 2...**

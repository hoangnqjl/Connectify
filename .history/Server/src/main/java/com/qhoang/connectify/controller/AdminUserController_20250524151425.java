package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.service.UserService;
import com.qhoang.connectify.service.AuthorizationService;
import com.qhoang.connectify.utils.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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
     * Lấy chi tiết một user theo ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền truy cập"));
        }

        User user = userService.getUserByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
        }

        return ResponseEntity.ok(user);
    }

    /**
     * Tạo user mới (admin tạo)
     */
    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("email") String email,
            @RequestParam("fullname") String fullname,
            @RequestParam("phonenumber") String phonenumber,
            @RequestParam("password") String password,
            @RequestParam(value = "type", defaultValue = "customer") String type) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền tạo người dùng"));
        }

        // Kiểm tra email đã tồn tại
        if (userService.getUserByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("error", "Email đã được sử dụng"));
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

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "Tạo người dùng thành công"));
    }

    /**
     * Cập nhật thông tin user
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId,
            @RequestParam(value = "fullname", required = false) String fullname,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phonenumber", required = false) String phonenumber,
            @RequestParam(value = "type", required = false) String type) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật người dùng"));
        }

        User user = userService.getUserByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
        }

        // Cập nhật thông tin
        if (fullname != null) user.setFullname(fullname);
        if (email != null) {
            // Kiểm tra email mới có bị trùng không
            User existingUser = userService.getUserByEmail(email);
            if (existingUser != null && !existingUser.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("error", "Email đã được sử dụng"));
            }
            user.setEmail(email);
        }
        if (phonenumber != null) user.setPhonenumber(phonenumber);
        if (type != null) user.setType(type);
        user.setUpdatedAt(new Date());

        userService.saveUser(user);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật thành công"));
    }

    /**
     * Xóa user
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xóa người dùng"));
        }

        User user = userService.getUserByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
        }

        // Không cho phép xóa chính mình
        User currentUser = authorizationService.getUserFromToken(authHeader);
        if (currentUser != null && currentUser.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Không thể xóa chính mình"));
        }

        userService.deleteUser(userId);

        return ResponseEntity.ok(Collections.singletonMap("message", "Xóa người dùng thành công"));
    }

    /**
     * Thay đổi quyền user
     */
    @PutMapping("/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId,
            @RequestParam("role") String role) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền thay đổi quyền"));
        }

        User user = userService.getUserByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
        }

        // Kiểm tra role hợp lệ
        if (!role.equals("admin") && !role.equals("manager") && !role.equals("customer")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Quyền không hợp lệ"));
        }

        user.setType(role);
        user.setUpdatedAt(new Date());
        userService.saveUser(user);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật quyền thành công"));
    }

    /**
     * Đặt lại mật khẩu user
     */
    @PutMapping("/{userId}/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId,
            @RequestParam("newPassword") String newPassword) {
        
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền đặt lại mật khẩu"));
        }

        User user = userService.getUserByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(new Date());
        userService.saveUser(user);

        return ResponseEntity.ok(Collections.singletonMap("message", "Đặt lại mật khẩu thành công"));
    }

    /**
     * Thống kê user
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getUserStatistics(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<User> allUsers = userService.getAllUsers();
        long totalUsers = allUsers.size();
        long adminCount = allUsers.stream().filter(u -> "admin".equals(u.getType())).count();
        long customerCount = allUsers.stream().filter(u -> "customer".equals(u.getType())).count();
        long managerCount = allUsers.stream().filter(u -> "manager".equals(u.getType())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("adminCount", adminCount);
        stats.put("customerCount", customerCount);
        stats.put("managerCount", managerCount);

        return ResponseEntity.ok(stats);
    }
}

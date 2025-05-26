package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.service.UserService;
import com.qhoang.connectify.service.AuthorizationService;
import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@CrossOrigin(origins = {"http://localhost:8000", "http://127.0.0.1:8000"},
        allowCredentials = "true",
        allowedHeaders = {"Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthorizationService authorizationService;

    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil,
                          AuthorizationService authorizationService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authorizationService = authorizationService;
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam("email") String email,
                                   @RequestParam("password") String password) {
        // Kiểm tra thông tin người dùng hợp lệ
        User user = userService.getUserByEmail(email);  // Sử dụng UserService để tìm người dùng
        if (user != null && password.equals(user.getPassword())) {
            // Lấy user_id từ đối tượng User
            String userId = user.getUserId();

            // Tạo token dựa trên user_id
            String token = jwtUtil.generateToken(userId);

            // Trả về token
            return ResponseEntity.ok(Collections.singletonMap("token", token));
        } else {
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("error", "Sai thông tin đăng nhập");
            debugInfo.put("storedPassword", (user != null) ? user.getPassword() : "null");
            debugInfo.put("enteredPassword", password);
            debugInfo.put("matchResult", (user != null) && password.equals(user.getPassword()));

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(debugInfo);
        }
    }

    // Đăng ký
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestParam("email") String email,
                                    @RequestParam("fullname") String fullname,
                                    @RequestParam("phonenumber") String phonenumber,
                                    @RequestParam("password") String password) {

        // Kiểm tra email đã tồn tại chưa
        if (userService.getUserByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("error", "Email đã được sử dụng"));
        }

        // Tạo user_id
        String userId = "user_" + System.currentTimeMillis();

        // Tạo username từ fullname
        String[] parts = fullname.trim().toLowerCase().split("\\s+");
        String lastName = parts[parts.length - 1];
        char firstInitial = parts[0].charAt(0);
        String username = lastName + firstInitial;

        // Gán avatar ngẫu nhiên từ avatar1.png đến avatar10.png
        int randomIndex = ThreadLocalRandom.current().nextInt(1, 11); // 1 -> 10
        String randomAvatar = "avatar" + randomIndex + ".png";

        // Khởi tạo user
        User user = new User();
        user.setUserId(userId);
        user.setUsername(username);
        user.setFullname(fullname);
        user.setEmail(email);
        user.setPhonenumber(phonenumber);
        user.setPassword(password); // Nếu cần bảo mật thì nên mã hóa
        user.setAvatar(randomAvatar); // Gán avatar ngẫu nhiên
        user.setType("user");
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());

        // Lưu user
        userService.saveUser(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "Đăng ký thành công"));
    }

    // Lấy thông tin người dùng
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader("Authorization") String authHeader) {
        // Lấy token từ header Authorization
        String token = authHeader.replace("Bearer ", "");

        if (jwtUtil.validateToken(token)) {
            String userId = jwtUtil.extractUsername(token);
            User user = userService.getUserByUserId(userId);  // Sử dụng UserService để tìm người dùng theo userId

            if (user != null) {
                return ResponseEntity.ok(user); // Trả về thông tin user
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Token không hợp lệ"));
        }
    }

    // Lấy tất cả người dùng (chỉ admin mới xem được)
    @GetMapping("/all-users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền truy cập tài nguyên này"));
        }

        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/update-users")
    public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String authHeader,
                                        @RequestParam(value = "user_id", required = false) String requestedUserId,
                                        @RequestParam(value = "fullname", required = false) String fullname,
                                        @RequestParam(value = "phonenumber", required = false) String phonenumber,
                                        @RequestParam(value = "password", required = false) String password,
                                        @RequestParam(value = "username", required = false) String username,
                                        @RequestParam(value = "type", required = false) String type) {

        String token = authHeader.replace("Bearer ", "");

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Token không hợp lệ"));
        }

        String requesterUserId = jwtUtil.extractUsername(token);
        User requester = userService.getUserByUserId(requesterUserId);

        if (requester == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Người yêu cầu không tồn tại"));
        }

        // Nếu là admin và có truyền user_id → cập nhật người khác
        // Nếu không phải admin → chỉ được cập nhật chính mình
        String targetUserId = requester.getType().equalsIgnoreCase("admin") && requestedUserId != null
                ? requestedUserId
                : requesterUserId;

        User user = userService.getUserByUserId(targetUserId);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng cần cập nhật"));
        }

        boolean isUpdated = false;

        if (fullname != null && !fullname.trim().isEmpty() && !fullname.equals(user.getFullname())) {
            user.setFullname(fullname);
            isUpdated = true;
        }

        if (phonenumber != null && !phonenumber.trim().isEmpty() && !phonenumber.equals(user.getPhoneNumber())) {
            user.setPhonenumber(phonenumber);
            isUpdated = true;
        }

        if (password != null && !password.trim().isEmpty()) {
            if (!password.equals(user.getPassword())) {
                user.setPassword(password); // ⚠️ Thực tế nên mã hóa
                isUpdated = true;
            }
        }

        if (username != null && !username.trim().isEmpty()) {
            if (!username.equals(user.getUsername())) {
                user.setUsername(username);
            }
        }

        if (type != null && !type.trim().isEmpty() && !type.equals(user.getType())) {
            // Chỉ admin mới được thay đổi type của user
            if (requester.getType().equalsIgnoreCase("admin")) {
                user.setType(type);
                isUpdated = true;
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("error", "Bạn không có quyền thay đổi vai trò người dùng"));
            }
        }

        if (!isUpdated) {
            return ResponseEntity.ok(Collections.singletonMap("message", "Không có thông tin nào được cập nhật"));
        }

        user.setUpdatedAt(new Date());
        userService.saveUser(user);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật thông tin thành công"));
    }


    @DeleteMapping("/delete-user/{user_id}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String authHeader,
                                        @PathVariable("user_id") String userIdToDelete) {

        // Validate token
        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "error", "Token không hợp lệ",
                            "admin", null,
                            "targetUser", null
                    ));
        }

        // Lấy người gửi yêu cầu
        String requesterUserId = jwtUtil.extractUsername(token);
        User requester = userService.getUserByUserId(requesterUserId);

        if (requester == null || !requester.getType().equalsIgnoreCase("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "success", false,
                            "error", "Bạn không có quyền xóa người dùng",
                            "admin", Map.of("userId", requesterUserId),
                            "targetUser", Map.of("userId", userIdToDelete)
                    ));
        }

        // Kiểm tra người dùng cần xóa có tồn tại không
        User targetUser = userService.getUserByUserId(userIdToDelete);
        if (targetUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "error", "Người dùng không tồn tại",
                            "admin", Map.of("userId", requesterUserId, "fullname", requester.getFullname()),
                            "targetUser", Map.of("userId", userIdToDelete)
                    ));
        }

        // Không cho phép admin tự xóa chính mình
        if (requesterUserId.equals(userIdToDelete)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "success", false,
                            "error", "Bạn không thể tự xóa chính mình",
                            "admin", Map.of("userId", requesterUserId, "fullname", requester.getFullname()),
                            "targetUser", Map.of("userId", userIdToDelete, "fullname", targetUser.getFullname())
                    ));
        }

        // Thực hiện xóa
        userService.deleteUser(userIdToDelete);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Xóa người dùng thành công",
                "admin", Map.of("userId", requesterUserId, "fullname", requester.getFullname()),
                "targetUser", Map.of("userId", targetUser.getUserId(), "fullname", targetUser.getFullname())
        ));
    }






}

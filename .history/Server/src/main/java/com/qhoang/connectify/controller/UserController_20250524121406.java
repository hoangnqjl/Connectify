package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.service.UserService;
import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@CrossOrigin(
        origins = "http://localhost:8000" // frontend của bạn
//        allowedHeaders = "*",
//        exposedHeaders = "Authorization",
//        allowCredentials = "true"
)
@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
        this.jwtUtil = new JwtUtil();
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam("email") String email,
                                   @RequestParam("password") String password) {
        // Kiểm tra thông tin người dùng hợp lệ
        User user = userService.getUserByEmail(email);  // Sử dụng UserService để tìm người dùng
        if (user != null && user.getPassword().equals(password)) {
            // Lấy user_id từ đối tượng User
            String userId = user.getUserId();

            // Tạo token dựa trên user_id
            String token = jwtUtil.generateToken(userId);

            // Trả về token
            return ResponseEntity.ok(Collections.singletonMap("token", token));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Sai thông tin đăng nhập"));
        }
    }

    // Đăng ký
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestParam("email") String email,
                                    @RequestParam("fullname") String fullname,
                                    @RequestParam("phonenumber") String phonenumber,
                                    @RequestParam("password") String password) {

        // Kiểm tra xem email đã tồn tại chưa
        if (userService.getUserByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("error", "Email đã được sử dụng"));
        }

        // Tạo user_id và khởi tạo đối tượng User
        String userId = "user_" + System.currentTimeMillis(); // Hoặc dùng UUID nếu muốn
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
        user.setPassword(password);
        user.setAvatar(null);

        // Lưu người dùng vào cơ sở dữ liệu
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
        String token = authHeader.replace("Bearer ", "");

        // Xác thực token
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Token không hợp lệ"));
        }

        // Trích xuất userId từ token
        String userId = jwtUtil.extractUsername(token);
        User user = userService.getUserByUserId(userId);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy người dùng"));
        }

        // Kiểm tra quyền admin
        if (!"admin".equalsIgnoreCase(user.getType())) {
            System.out.println(user.getType());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền truy cập tài nguyên này"));
        }

        // Trả về toàn bộ danh sách người dùng
        return ResponseEntity.ok(userService.getAllUsers());
    }

}

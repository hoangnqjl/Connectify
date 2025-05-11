package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.repository.UserRepository;
import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.jwtUtil = new JwtUtil();
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam("email") String email,
                                   @RequestParam("password") String password) {
        // Kiểm tra thông tin người dùng hợp lệ
        User user = userRepository.findByEmail(email);  // Sử dụng UserRepository để tìm người dùng
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
        if (userRepository.findByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("error", "Email đã được sử dụng"));
        }

        // Tạo user_id và khởi tạo đối tượng User
        String userId = "user_" + System.currentTimeMillis(); // Hoặc dùng UUID nếu muốn
        User user = new User();
        user.setUserId(userId);
        String[] parts = fullname.trim().toLowerCase().split("\\s+");
        String lastName = parts[parts.length - 1];
        char firstInitial = parts[0].charAt(0);

        String username = lastName + firstInitial;
        user.setUsername(username);
        user.setFullname(fullname);
        user.setEmail(email);
        user.setPhonenumber(phonenumber);
        user.setPassword(password);
        user.setAvatar(null);
//        user.setCreated_at(null);
//        user.setUpdated_at(null);

        // Lưu người dùng vào cơ sở dữ liệu
        userRepository.save(user);

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
            User user = userRepository.findByUserId(userId);  // Sử dụng UserRepository để tìm người dùng theo userId

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
}

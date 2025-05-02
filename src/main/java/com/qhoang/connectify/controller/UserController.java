package com.qhoang.connectify.controller;

import com.qhoang.connectify.dao.UserDao;
import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserDao userDao;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController(UserDao userDao) {
        this.userDao = userDao;
        this.jwtUtil = new JwtUtil();
    }


    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password, Model model, HttpServletResponse response) {
        boolean valid = userDao.retrieveUser(email, password);

        if (valid) {
            String token = jwtUtil.generateToken(email);

            Cookie cookie = new Cookie("jwt", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setMaxAge(3600);
            cookie.setPath("/");
            response.addCookie(cookie);

            return "/";
        } else {
            model.addAttribute("errorMessage", "Sai thông tin đăng nhập");
            return "auth/login";
        }
    }





//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
//        String email = loginData.get("email");
//        String password = loginData.get("password");
//
//        boolean isValidUser = userDao.retrieveUser(email, password);
//        if (isValidUser) {
//            String token = jwtUtil.generateToken(email);
//            return ResponseEntity.ok(Collections.singletonMap("token", token));
//        } else {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                    .body(Collections.singletonMap("error", "Sai thông tin đăng nhập"));
//        }
//    }
}

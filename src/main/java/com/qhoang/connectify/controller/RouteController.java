package com.qhoang.connectify.controller;

import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

@Controller
public class RouteController {

    private final JwtUtil jwtUtil = new JwtUtil();

    @GetMapping("/login")
    public String showLoginForm(HttpServletRequest request) {
        String jwt = getJwtFromCookies(request);
        if (jwt != null && jwtUtil.validateToken(jwt)) {
            return "home";
        }
        return "auth/login";
    }

    @GetMapping("/home")
    public String showHome(HttpServletRequest request) {
        String jwt = getJwtFromCookies(request);

        if (jwt == null || !jwtUtil.validateToken(jwt)) {
            return "auth/login";
        }
        return "redirect:/chat/conversations";
    }

    private String getJwtFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}

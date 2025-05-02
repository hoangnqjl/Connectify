package com.qhoang.connectify.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Controller
public class RouteController {
    @GetMapping("/login")
    public String showLoginForm() {
        return "auth/login";
    }
//
    @GetMapping("/home")
    public String showHome() {
        return "home";
    }

}

package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    /**
     * Lấy user từ token
     */
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

    /**
     * Kiểm tra user có phải admin không
     */
    public boolean isAdmin(User user) {
        return user != null && "admin".equals(user.getType());
    }

    /**
     * Kiểm tra user có phải user thông thường không
     */
    public boolean isUser(User user) {
        return user != null && "user".equals(user.getType());
    }

    /**
     * Kiểm tra user có quyền truy cập admin không
     */
    public boolean hasAdminAccess(String authHeader) {
        User user = getUserFromToken(authHeader);
        return isAdmin(user);
    }

    /**
     * Kiểm tra user có quyền quản lý không
     */
    public boolean hasManagerAccess(String authHeader) {
        User user = getUserFromToken(authHeader);
        return isManager(user);
    }

    /**
     * Kiểm tra user có phải chủ sở hữu resource không
     */
    public boolean isOwner(String authHeader, String resourceUserId) {
        User user = getUserFromToken(authHeader);
        return user != null && user.getUserId().equals(resourceUserId);
    }

    /**
     * Kiểm tra user có quyền truy cập resource không (admin hoặc chủ sở hữu)
     */
    public boolean canAccessResource(String authHeader, String resourceUserId) {
        User user = getUserFromToken(authHeader);
        return isAdmin(user) || (user != null && user.getUserId().equals(resourceUserId));
    }
}

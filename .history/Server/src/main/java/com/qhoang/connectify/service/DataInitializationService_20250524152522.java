package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.utils.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.Date;

@Service
public class DataInitializationService {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        createDefaultAdminUser();
    }

    /**
     * Tạo tài khoản admin mặc định nếu chưa có
     */
    private void createDefaultAdminUser() {
        try {
            // Kiểm tra xem đã có admin nào chưa
            boolean hasAdmin = userService.getAllUsers().stream()
                    .anyMatch(user -> "admin".equals(user.getType()));

            if (!hasAdmin) {
                // Tạo admin mặc định
                User admin = new User();
                admin.setUserId("admin_" + System.currentTimeMillis());
                admin.setUsername("admin");
                admin.setFullname("Administrator");
                admin.setEmail("admin@connectify.com");
                admin.setPhonenumber("0123456789");
                admin.setPassword(passwordEncoder.encode("admin123")); // Mật khẩu mặc định
                admin.setAvatar(null);
                admin.setType("admin");
                admin.setCreatedAt(new Date());
                admin.setUpdatedAt(new Date());

                userService.saveUser(admin);

                System.out.println("=== THÔNG TIN ADMIN MẶC ĐỊNH ===");
                System.out.println("Email: admin@connectify.com");
                System.out.println("Mật khẩu: admin123");
                System.out.println("Vui lòng đổi mật khẩu sau khi đăng nhập!");
                System.out.println("================================");
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo admin mặc định: " + e.getMessage());
        }
    }
}

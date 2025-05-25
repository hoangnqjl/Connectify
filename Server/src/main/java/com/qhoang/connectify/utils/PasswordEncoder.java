package com.qhoang.connectify.utils;

import org.springframework.stereotype.Component;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class PasswordEncoder {
    
    private static final String ALGORITHM = "SHA-256";
    private static final int SALT_LENGTH = 16;
    
    /**
     * Mã hóa mật khẩu với salt
     */
    public String encode(String rawPassword) {
        try {
            // Tạo salt ngẫu nhiên
            byte[] salt = generateSalt();
            
            // Kết hợp password và salt
            String saltedPassword = rawPassword + Base64.getEncoder().encodeToString(salt);
            
            // Hash password
            MessageDigest md = MessageDigest.getInstance(ALGORITHM);
            byte[] hashedPassword = md.digest(saltedPassword.getBytes());
            
            // Kết hợp salt và hash để lưu trữ
            String encodedSalt = Base64.getEncoder().encodeToString(salt);
            String encodedHash = Base64.getEncoder().encodeToString(hashedPassword);
            
            return encodedSalt + ":" + encodedHash;
            
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Lỗi mã hóa mật khẩu", e);
        }
    }
    
    /**
     * Kiểm tra mật khẩu có khớp không
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        try {
            // Tách salt và hash
            String[] parts = encodedPassword.split(":");
            if (parts.length != 2) {
                return false;
            }
            
            String encodedSalt = parts[0];
            String storedHash = parts[1];
            
            // Tái tạo hash với salt đã lưu
            String saltedPassword = rawPassword + encodedSalt;
            MessageDigest md = MessageDigest.getInstance(ALGORITHM);
            byte[] hashedPassword = md.digest(saltedPassword.getBytes());
            String newHash = Base64.getEncoder().encodeToString(hashedPassword);
            
            return storedHash.equals(newHash);
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Tạo salt ngẫu nhiên
     */
    private byte[] generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[SALT_LENGTH];
        random.nextBytes(salt);
        return salt;
    }
}

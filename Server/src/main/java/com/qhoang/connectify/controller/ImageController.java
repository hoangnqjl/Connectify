package com.qhoang.connectify.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Random;
import javax.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ImageController {

    // ⚠️ QUAN TRỌNG: Thay đổi đường dẫn này theo máy của bạn khi clone dự án
    // Windows: "D:/Your/Path/To/Data/"
    // Linux: "/home/username/connectify/data/"
    // macOS: "/Users/username/connectify/data/"
    private final String UPLOAD_DIR = "C:/Users/Lenovo/IdeaProjects/JVW/Connectify/Data/";

    private final String AVATAR_DIR = "C:/Users/Lenovo/IdeaProjects/JVW/Connectify/Data/";

    @GetMapping("/avatar/{imageName}")
    public void getAvatarByName(@PathVariable String imageName, HttpServletResponse response) throws IOException {
        serveAvatar(imageName, response);
    }



    @GetMapping("/images/{imageName}")
    public void getImageByPath(@PathVariable String imageName, HttpServletResponse response) throws IOException {
        serveImage(imageName, response);
    }



    @GetMapping("/uploads/{imageName}")
    public void getUploadByPath(@PathVariable String imageName, HttpServletResponse response) throws IOException {
        serveImage(imageName, response);
    }

    private void serveImage(String imageName, HttpServletResponse response) throws IOException {
        // Security: Validate image name to prevent path traversal attacks
        if (!isValidImageName(imageName)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid image name");
            return;
        }

        File imageFile = new File(UPLOAD_DIR + imageName);

        if (!imageFile.exists()) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Image not found");
            return;
        }

        // Xác định content type dựa trên phần mở rộng file
        String contentType = "image/jpeg";
        if (imageName.toLowerCase().endsWith(".png")) {
            contentType = "image/png";
        } else if (imageName.toLowerCase().endsWith(".gif")) {
            contentType = "image/gif";
        } else if (imageName.toLowerCase().endsWith(".webp")) {
            contentType = "image/webp";
        }

        response.setContentType(contentType);
        response.setContentLength((int) imageFile.length());

        // Đọc và ghi file
        try (FileInputStream fis = new FileInputStream(imageFile);
             OutputStream os = response.getOutputStream()) {

            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
            os.flush();
        }
    }

    private void serveAvatar(String imageName, HttpServletResponse response) throws IOException {
        if (!isValidImageName(imageName)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid image name");
            return;
        }

        File imageFile = new File(AVATAR_DIR + imageName);

        if (!imageFile.exists()) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Avatar not found");
            return;
        }

        // Xác định content type dựa trên phần mở rộng
        String contentType = "image/png"; // mặc định .png
        if (imageName.toLowerCase().endsWith(".jpg") || imageName.toLowerCase().endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (imageName.toLowerCase().endsWith(".gif")) {
            contentType = "image/gif";
        } else if (imageName.toLowerCase().endsWith(".webp")) {
            contentType = "image/webp";
        }

        response.setContentType(contentType);
        response.setContentLength((int) imageFile.length());

        try (FileInputStream fis = new FileInputStream(imageFile);
             OutputStream os = response.getOutputStream()) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
            os.flush();
        }
    }


    /**
     * Validate image name to prevent security issues
     * @param imageName the image file name
     * @return true if valid, false otherwise
     */
    private boolean isValidImageName(String imageName) {
        if (imageName == null || imageName.trim().isEmpty()) {
            return false;
        }

        // Prevent path traversal attacks
        if (imageName.contains("..") || imageName.contains("/") || imageName.contains("\\")) {
            return false;
        }

        // Check for valid image extensions
        String[] allowedExtensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"};
        String lowerName = imageName.toLowerCase();
        for (String ext : allowedExtensions) {
            if (lowerName.endsWith(ext)) {
                return true;
            }
        }

        return false;
    }
}

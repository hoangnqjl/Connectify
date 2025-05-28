package com.qhoang.connectify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class ConnectifyApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        System.out.println("🚀 Starting Connectify Application...");

        // Set server port
        System.setProperty("server.port", "1512");

        SpringApplication.run(ConnectifyApplication.class, args);

        System.out.println("✅ Connectify Server started successfully!");
        System.out.println("🌐 Server running at: http://localhost:1512");
        System.out.println("📊 API Base URL: http://localhost:1512");
        System.out.println("🛒 Electronics API: http://localhost:1512/electronics");
        System.out.println("🔐 Login API: http://localhost:1512/auth/login");
    }
}

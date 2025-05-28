package com.qhoang.connectify;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import com.qhoang.connectify.utils.AppConfig;

public class ConnectifyApplication {
    public static void main(String[] args) {
        System.out.println("🚀 Starting Connectify Application...");
        
        try {
            // Khởi tạo Spring Application Context
            AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
            
            System.out.println("✅ Spring Context initialized successfully!");
            System.out.println("📊 Available beans:");
            
            String[] beanNames = context.getBeanDefinitionNames();
            for (String beanName : beanNames) {
                if (beanName.contains("connectify")) {
                    System.out.println("  - " + beanName);
                }
            }
            
            System.out.println("🌐 Server would be running on http://localhost:1512");
            System.out.println("📝 Note: This is a Spring MVC web application that needs to be deployed to a servlet container like Tomcat.");
            
            // Giữ ứng dụng chạy
            System.out.println("Press Ctrl+C to stop...");
            Thread.currentThread().join();
            
        } catch (Exception e) {
            System.err.println("❌ Error starting application: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

package com.qhoang.connectify.utils;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Đảm bảo đường dẫn trỏ đến thư mục uploads trong webapp
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:D:/Project/ConnectifyShop/Data/");
    }
}

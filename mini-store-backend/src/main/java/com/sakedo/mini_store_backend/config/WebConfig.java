package com.sakedo.mini_store_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Cho phép tất cả các đường dẫn API
                .allowedOrigins("*") // Cho phép mọi nơi truy cập (Lúc dev thì để *, production sẽ chặn sau)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các loại lệnh này
                .allowedHeaders("*");
    }
}

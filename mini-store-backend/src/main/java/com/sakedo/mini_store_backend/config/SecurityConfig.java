package com.sakedo.mini_store_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // 1. Cho phép vào khu vực đăng ký/đăng nhập/quên mật khẩu
                        .requestMatchers("/api/auth/**").permitAll()

                        // 2. THÊM DÒNG NÀY: Cho phép vào khu vực sản phẩm (để xem menu và tạo data mẫu)
                        .requestMatchers("/api/products/**").permitAll()

                        // 3. Các link khác (nếu có) mới bắt buộc đăng nhập
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
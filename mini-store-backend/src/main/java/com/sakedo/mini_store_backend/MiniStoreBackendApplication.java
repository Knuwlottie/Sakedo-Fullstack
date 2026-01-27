package com.sakedo.mini_store_backend;


import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;


@SpringBootApplication
public class MiniStoreBackendApplication {


	public static void main(String[] args) {
		SpringApplication.run(MiniStoreBackendApplication.class, args);
	}


	// Cấu hình bắt buộc để sửa lỗi "Unrecognized field expiredAt"
	@Bean
	@Primary
	public ObjectMapper objectMapper() {
		ObjectMapper mapper = new ObjectMapper();
		// Lệnh cho Java bỏ qua các trường lạ từ API mà không báo lỗi sập hệ thống
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		return mapper;
	}
}

package com.sakedo.mini_store_backend.repository;

import com.sakedo.mini_store_backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional; // <--- Nhớ import dòng này

public interface UserRepository extends MongoRepository<User, String> {

    // Sửa dòng này: Trả về Optional để tránh lỗi Null và dùng được .isPresent()
    Optional<User> findByEmail(String email);

    // Thêm dòng này để kiểm tra nhanh (dùng cho phần Đăng ký)
    boolean existsByEmail(String email);
}
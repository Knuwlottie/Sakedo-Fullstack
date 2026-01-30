package com.sakedo.mini_store_backend.controller;

import com.sakedo.mini_store_backend.model.User;
import com.sakedo.mini_store_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 1. API LẤY THÔNG TIN USER
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.badRequest().body("User not found");
        }
    }

    // 2. API CẬP NHẬT THÔNG TIN
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();

            user.setName(userDetails.getName());
            user.setPhone(userDetails.getPhone());
            user.setAddress(userDetails.getAddress());

            if (userDetails.getAvatar() != null && !userDetails.getAvatar().isEmpty()) {
                user.setAvatar(userDetails.getAvatar());
            }

            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null);
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 3. API ĐỔI MẬT KHẨU
    @PostMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable String id, @RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu cũ sai!"));
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. API TẠO USER MẪU
    @GetMapping("/init")
    public String initUser() {
        if (!userRepository.existsById("1")) {
            User user = new User("1", "Knhu", "huynhlekhanhu.kg@gmail.com", "0939171801", "HCM", "", passwordEncoder.encode("123456"));
            userRepository.save(user);
            return "Đã tạo User mẫu!";
        }
        return "User mẫu đã tồn tại.";
    }
}
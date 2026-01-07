package com.sakedo.mini_store_backend.controller;

import com.sakedo.mini_store_backend.model.User;
import com.sakedo.mini_store_backend.repository.UserRepository;
import com.sakedo.mini_store_backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Công cụ mã hóa mật khẩu
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Bộ nhớ tạm để lưu mã OTP (Dạng: Email -> Mã OTP)
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    // ------------------------------------------------------------------
    // 1. ĐĂNG KÝ TÀI KHOẢN
    // ------------------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Kiểm tra xem email đã tồn tại chưa
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được sử dụng!"));
        }

        // Mã hóa mật khẩu trước khi lưu
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Lưu vào MongoDB
        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    // ------------------------------------------------------------------
    // 2. ĐĂNG NHẬP
    // ------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        // Tìm user trong DB (Dùng Optional để tránh lỗi Null)
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // So sánh mật khẩu nhập vào (password) với mật khẩu đã mã hóa trong DB (user.getPassword())
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Xóa password trước khi trả về để bảo mật
                user.setPassword(null);
                return ResponseEntity.ok(user);
            }
        }

        return ResponseEntity.status(401).body(Map.of("message", "Email hoặc mật khẩu không đúng!"));
    }

    // ------------------------------------------------------------------
    // 3. QUÊN MẬT KHẨU (Gửi OTP qua Email)
    // ------------------------------------------------------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không tồn tại trong hệ thống!"));
        }

        String otp = String.format("%06d", new Random().nextInt(999999));

        otpStorage.put(email, otp);

        // Gửi email
        try {
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok(Map.of("message", "Mã OTP đã được gửi đến email của bạn!"));
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra console để debug
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi gửi email: " + String.valueOf(e.getMessage())));
        }
    }

    // ------------------------------------------------------------------
    // 4. XÁC THỰC OTP
    // ------------------------------------------------------------------
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otpInput = body.get("otp");

        // Lấy mã OTP đúng đang lưu trong bộ nhớ
        String correctOtp = otpStorage.get(email);

        // So sánh
        if (correctOtp != null && correctOtp.equals(otpInput)) {
            return ResponseEntity.ok(Map.of("message", "Xác thực thành công!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã OTP không đúng hoặc đã hết hạn!"));
        }
    }

    // ------------------------------------------------------------------
    // 5. ĐẶT LẠI MẬT KHẨU MỚI
    // ------------------------------------------------------------------
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String newPassword = body.get("newPassword");

            // 1. Tìm User
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Người dùng không tồn tại!"));
            }

            // 2. DEBUG QUAN TRỌNG: In ra xem ID có bị null không?
            System.out.println("--- DEBUG RESET PASSWORD ---");
            System.out.println("Found User: " + user.getEmail());
            System.out.println("User ID: " + user.getId()); // <--- Kiểm tra dòng này trong Console
            System.out.println("----------------------------");

            // 3. Cập nhật mật khẩu
            user.setPassword(passwordEncoder.encode(newPassword));

            // 4. Lưu lại (Nếu ID có giá trị -> Update. Nếu ID null -> Insert)
            userRepository.save(user);

            // 5. Dọn dẹp
            otpStorage.remove(email);

            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));

        } catch (Exception e) {
            // 6. NẾU CÓ LỖI: In lỗi ra Console để xem
            e.printStackTrace();
            // Trả về JSON đàng hoàng để Frontend không bị lỗi "Unexpected token"
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi Server: " + e.getMessage()));
        }
    }
}
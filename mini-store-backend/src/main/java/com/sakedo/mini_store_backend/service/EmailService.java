package com.sakedo.mini_store_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Lấy email từ file properties để làm người gửi
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã xác thực OTP - SAKDO Store");
            message.setText("Chào bạn,\n\n"
                    + "Mã xác thực (OTP) để đặt lại mật khẩu của bạn là: " + otpCode + "\n\n"
                    + "Mã này sẽ hết hạn trong vòng 5 phút.\n"
                    + "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.\n\n"
                    + "Trân trọng,\nSAKDO Team");

            mailSender.send(message);
            System.out.println("Mail sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            throw e; // Ném lỗi để Controller bắt được
        }
    }
}

package com.sakedo.mini_store_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private final String fromEmail = "nhimvleggo@gmail.com";

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã OTP xác thực - Sakedo Mini Store");
            message.setText("Xin chào,\n\n"
                    + "Mã xác thực (OTP) của bạn là: " + otp + "\n\n"
                    + "Mã này sẽ hết hạn trong vòng 5 phút.\n"
                    + "Vui lòng không chia sẻ mã này cho bất kỳ ai.");

            mailSender.send(message);
            System.out.println("Đã gửi OTP đến: " + toEmail);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }
}
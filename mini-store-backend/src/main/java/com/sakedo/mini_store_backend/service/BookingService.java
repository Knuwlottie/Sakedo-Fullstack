package com.sakedo.mini_store_backend.service;

import com.sakedo.mini_store_backend.model.Booking;
import com.sakedo.mini_store_backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(Booking booking) {
        // 1. Quy định giữ bàn 3 tiếng: tính expiryDate
        LocalDateTime start = booking.getBookingDate();
        LocalDateTime end = start.plusHours(3);
        booking.setExpiryDate(end);

        // 2. Xác định danh sách bàn phù hợp với số lượng khách (guestCount)
        List<Integer> targetTables = getEligibleTables(booking.getGuestCount());

        if (targetTables.isEmpty()) {
            throw new RuntimeException("Số lượng khách vượt quá sức chứa tối đa của nhà hàng (20 người).");
        }

        // 3. Quét các bàn trong danh sách mục tiêu để tìm bàn trống
        for (Integer tableNum : targetTables) {
            // Kiểm tra xem bàn 'tableNum' có ai đặt trùng khung giờ 3 tiếng này không
            List<Booking> conflicts = bookingRepository.findByTableNumberAndBookingDateLessThanAndExpiryDateGreaterThan(
                    tableNum, end, start);

            // Nếu không có xung đột, gán số bàn này cho khách và lưu
            if (conflicts.isEmpty()) {
                booking.setTableNumber(tableNum);
                booking.setStatus("CONFIRMED");
                return bookingRepository.save(booking);
            }
        }

        // 4. Nếu đi hết vòng lặp mà không return được, tức là tất cả bàn thuộc nhóm đó đã kín
        throw new RuntimeException("Xin lỗi, hiện tại tất cả các bàn dành cho " + booking.getGuestCount() + " người đã kín chỗ trong khung giờ này!");
    }

    // Hàm phân loại bàn theo yêu cầu của bạn
    private List<Integer> getEligibleTables(int guests) {
        List<Integer> tables = new ArrayList<>();
        if (guests >= 1 && guests <= 5) {
            // Nhóm 1: Bàn 1 đến 4
            for (int i = 1; i <= 4; i++) tables.add(i);
        } else if (guests >= 6 && guests <= 12) {
            // Nhóm 2: Bàn 5 đến 7 (Sửa lại 6-12 người cho logic liên tục)
            for (int i = 5; i <= 7; i++) tables.add(i);
        } else if (guests >= 13 && guests <= 20) {
            // Nhóm 3: Bàn 8 đến 10
            for (int i = 8; i <= 10; i++) tables.add(i);
        }
        return tables;
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }
}
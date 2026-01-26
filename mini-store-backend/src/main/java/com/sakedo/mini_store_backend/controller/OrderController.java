package com.sakedo.mini_store_backend.controller;

// --- PHẦN QUAN TRỌNG: CÁC DÒNG IMPORT NÀY ĐANG BỊ THIẾU ---
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sakedo.mini_store_backend.model.Order;
import com.sakedo.mini_store_backend.repository.OrderRepository;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
// -----------------------------------------------------------

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    // 1. TẠO ĐƠN HÀNG
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order orderData) {
        try {
            // Gán thời gian tạo
            orderData.setCreatedAt(new Date());
            // Gán trạng thái: 0 = Chờ xác nhận
            orderData.setStatus(0);

            // Lưu vào MongoDB
            Order savedOrder = orderRepository.save(orderData);

            // Trả về kết quả thành công
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", savedOrder.getId());
            response.put("message", "Đặt hàng thành công!");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi Server: " + e.getMessage());
        }
    }

    // 2. LẤY DANH SÁCH ĐƠN CHỜ DUYỆT (ADMIN)
    @GetMapping("/admin/pending")
    public List<Order> getPendingOrders() {
        return orderRepository.findByStatusIn(Arrays.asList(0, 1));
    }

    // 3. LẤY DANH SÁCH ĐƠN CHỜ GIAO (DRIVER)
    @GetMapping("/driver/available")
    public List<Order> getDriverOrders() {
        return orderRepository.findByStatus(2);
    }

    // 4. CẬP NHẬT TRẠNG THÁI
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam int newStatus) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.status(404).body("Không tìm thấy đơn hàng");
        }
        order.setStatus(newStatus);
        orderRepository.save(order);
        return ResponseEntity.ok("Cập nhật thành công");
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String id) {
        return orderRepository.findById(id)
                .map(order -> {
                    // Chỉ cho phép hủy khi đơn đang ở trạng thái 0 (Chờ xác nhận)
                    if (order.getStatus() == 0) {
                        order.setStatus(4); // 4 là trạng thái ĐÃ HỦY
                        orderRepository.save(order);
                        return ResponseEntity.ok(order);
                    } else {
                        return ResponseEntity.badRequest().body("Đơn hàng đã được xử lý, không thể hủy!");
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
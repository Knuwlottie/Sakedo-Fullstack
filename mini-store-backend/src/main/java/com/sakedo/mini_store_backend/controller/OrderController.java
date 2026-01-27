package com.sakedo.mini_store_backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import com.sakedo.mini_store_backend.model.Order;
import com.sakedo.mini_store_backend.model.OrderItem;
import com.sakedo.mini_store_backend.repository.OrderRepository;


import java.util.*;


@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {


    @Autowired
    private OrderRepository orderRepository;


    // ==========================================================================
    // 1. SYNC GIỎ HÀNG: Thêm/Cập nhật món vào giỏ hàng (status = 0)
    // ==========================================================================
    @PostMapping("/cart/sync")
    public ResponseEntity<?> syncCart(@RequestBody Map<String, Object> requestData) {
        try {
            String userId = (String) requestData.get("userId");
            if (userId == null || userId.trim().isEmpty()) {
                userId = "guest_" + UUID.randomUUID().toString().substring(0, 8);
            }


            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) requestData.get("items");


            // Tìm giỏ hàng hiện tại của user (status = 0)
            Optional<Order> existingCart = orderRepository.findByUserIdAndStatus(userId, 0);
            Order cart;


            if (existingCart.isPresent()) {
                cart = existingCart.get();
            } else {
                cart = new Order();
                cart.setUserId(userId);
                cart.setStatus(0); // Giỏ hàng chưa thanh toán
                cart.setCreatedAt(new Date());
            }


            // Cập nhật danh sách items
            List<OrderItem> orderItems = new ArrayList<>();
            double totalAmount = 0;


            if (items != null) {
                for (Map<String, Object> item : items) {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setProductName((String) item.get("name"));
                    orderItem.setQuantity(((Number) item.get("quantity")).intValue());
                    orderItem.setPrice(((Number) item.get("price")).doubleValue());
                    orderItem.setImage((String) item.get("image"));
                    orderItems.add(orderItem);


                    totalAmount += orderItem.getPrice() * orderItem.getQuantity();
                }
            }


            cart.setItems(orderItems);
            cart.setTotalAmount(totalAmount);


            // Lấy thông tin khách hàng nếu có
            if (requestData.get("customerName") != null) {
                cart.setCustomerName((String) requestData.get("customerName"));
            }
            if (requestData.get("customerPhone") != null) {
                cart.setCustomerPhone((String) requestData.get("customerPhone"));
            }


            Order savedCart = orderRepository.save(cart);


            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", savedCart.getId());
            response.put("userId", userId);
            response.put("itemCount", orderItems.size());
            response.put("totalAmount", totalAmount);


            System.out.println("--> Đã sync giỏ hàng cho user: " + userId + ", items: " + orderItems.size());


            return ResponseEntity.ok(response);


        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi sync giỏ hàng: " + e.getMessage()));
        }
    }


    // ==========================================================================
    // 2. LẤY GIỎ HÀNG HIỆN TẠI CỦA USER
    // ==========================================================================
    @GetMapping("/cart/{userId}")
    public ResponseEntity<?> getCart(@PathVariable String userId) {
        Optional<Order> cart = orderRepository.findByUserIdAndStatus(userId, 0);
        if (cart.isPresent()) {
            return ResponseEntity.ok(cart.get());
        }
        return ResponseEntity.ok(Map.of("items", new ArrayList<>(), "totalAmount", 0));
    }


    // ==========================================================================
    // 3. THANH TOÁN: Cập nhật status từ 0 -> 1
    // ==========================================================================
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> requestData) {
        try {
            String userId = (String) requestData.get("userId");
            String orderId = (String) requestData.get("orderId");


            Order order;


            // Tìm order bằng orderId hoặc userId
            if (orderId != null && !orderId.isEmpty()) {
                order = orderRepository.findById(orderId).orElse(null);
            } else if (userId != null && !userId.isEmpty()) {
                order = orderRepository.findByUserIdAndStatus(userId, 0).orElse(null);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu userId hoặc orderId"));
            }


            if (order == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy đơn hàng"));
            }


            // Cập nhật trạng thái thanh toán
            order.setStatus(1); // Đã thanh toán
            order.setPaidAt(new Date());


            // Cập nhật thông tin khách hàng nếu có
            if (requestData.get("customerName") != null) {
                order.setCustomerName((String) requestData.get("customerName"));
            }
            if (requestData.get("customerPhone") != null) {
                order.setCustomerPhone((String) requestData.get("customerPhone"));
            }
            if (requestData.get("customerAddress") != null) {
                order.setCustomerAddress((String) requestData.get("customerAddress"));
            }
            if (requestData.get("shippingFee") != null) {
                order.setShippingFee(((Number) requestData.get("shippingFee")).doubleValue());
                order.setTotalAmount(order.getTotalAmount() + order.getShippingFee());
            }


            Order savedOrder = orderRepository.save(order);


            System.out.println("--> Đã thanh toán đơn hàng: " + savedOrder.getId());


            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", savedOrder.getId());
            response.put("message", "Thanh toán thành công!");


            return ResponseEntity.ok(response);


        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi thanh toán: " + e.getMessage()));
        }
    }


    // ==========================================================================
    // 4. TẠO ĐƠN HÀNG (API cũ - giữ lại để tương thích)
    // ==========================================================================
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order orderData) {
        try {
            orderData.setCreatedAt(new Date());
            if (orderData.getStatus() == 0) {
                orderData.setStatus(1); // Mặc định là đã thanh toán nếu gọi API này
            }


            Order savedOrder = orderRepository.save(orderData);


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


    // ==========================================================================
    // 5. LẤY DANH SÁCH ĐƠN HÀNG (ADMIN)
    // ==========================================================================
    @GetMapping("/admin/pending")
    public List<Order> getPendingOrders() {
        return orderRepository.findByStatusIn(Arrays.asList(1, 2)); // Đã thanh toán + đang giao
    }


    @GetMapping("/admin/all")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }


    // ==========================================================================
    // 6. LẤY ĐƠN HÀNG CHO DRIVER
    // ==========================================================================
    @GetMapping("/driver/available")
    public List<Order> getDriverOrders() {
        return orderRepository.findByStatus(2);
    }


    // ==========================================================================
    // 7. CẬP NHẬT TRẠNG THÁI
    // ==========================================================================
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


    // ==========================================================================
    // 8. LẤY LỊCH SỬ ĐƠN HÀNG CỦA USER
    // ==========================================================================
    @GetMapping("/history/{userId}")
    public List<Order> getOrderHistory(@PathVariable String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}


package com.sakedo.mini_store_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "orders") // MongoDB dùng @Document
public class Order {

    @Id
    private String id; // MongoDB tự sinh ID là chuỗi (String)

    // --- [MỚI] THÊM TRƯỜNG NÀY ĐỂ HIỆN LỊCH SỬ ĐƠN HÀNG ---
    private String userId; // ID của khách hàng (lấy từ User đang đăng nhập)

    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String note;
    private double shippingFee;
    private double totalAmount;

    private String driverId;
    private int status;

    private Date createdAt;

    private List<OrderItem> items = new ArrayList<>();

    public Order() {
        this.createdAt = new Date();
        this.status = 0;
    }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    // [MỚI] Getter/Setter cho userId
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public double getShippingFee() { return shippingFee; }
    public void setShippingFee(double shippingFee) { this.shippingFee = shippingFee; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    // [MỚI] Getter/Setter cho driverId
    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
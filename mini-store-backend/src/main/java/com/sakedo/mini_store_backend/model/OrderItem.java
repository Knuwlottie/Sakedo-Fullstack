package com.sakedo.mini_store_backend.model;

public class OrderItem {

    private String productName;
    private int quantity;
    private double price;

    // --- [THÊM MỚI] Biến này để lưu tên ảnh (vd: comga.jpg) ---
    private String image;

    // Constructor mặc định
    public OrderItem() {}

    // Constructor đầy đủ (Cập nhật thêm image)
    public OrderItem(String productName, int quantity, double price, String image) {
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.image = image;
    }

    // --- Getters và Setters ---

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    // [QUAN TRỌNG] Phải có 2 hàm này thì MongoDB mới lưu được ảnh
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
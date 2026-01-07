package com.sakedo.mini_store_backend.model;

import java.util.ArrayList;
import java.util.List;

public class Product {
    private int id;
    private String name;
    private double price; // Giá hiện tại (đã giảm)
    private double originalPrice; // Giá gốc
    private String description;
    private String image;
    private String category;

    // HAI TRƯỜNG QUAN TRỌNG ĐỂ HIỂN THỊ TRANG CHỦ
    private boolean bestSeller;
    private int discount;

    // Danh sách đánh giá
    private List<Review> reviews = new ArrayList<>();

    public Product() {
    }

    public Product(int id, String name, double originalPrice, String description, String image, String category, boolean bestSeller, int discount) {
        this.id = id;
        this.name = name;
        this.originalPrice = originalPrice;
        this.description = description;
        this.image = image;
        this.category = category;
        this.bestSeller = bestSeller;
        this.discount = discount;
        // Tính giá sau khi giảm
        this.price = originalPrice * (100 - discount) / 100;

        // Data giả review
        this.reviews.add(new Review("Người dùng ẩn danh", 5, "Món ăn tuyệt vời!"));
    }

    // ==============================================================
    // QUAN TRỌNG: PHẢI CÓ ĐỦ CÁC HÀM GETTER NÀY THÌ JSON MỚI CÓ DỮ LIỆU
    // ==============================================================

    public int getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public double getOriginalPrice() { return originalPrice; }
    public String getDescription() { return description; }
    public String getImage() { return image; }
    public String getCategory() { return category; }

    // Getter cho BestSeller (JSON sẽ là "bestSeller": true/false)
    public boolean isBestSeller() { return bestSeller; }

    // Getter cho Discount (JSON sẽ là "discount": 30)
    public int getDiscount() { return discount; }

    public List<Review> getReviews() { return reviews; }

    // Inner class Review
    public static class Review {
        public String user;
        public int rating;
        public String comment;

        public Review(String user, int rating, String comment) {
            this.user = user;
            this.rating = rating;
            this.comment = comment;
        }
    }
}
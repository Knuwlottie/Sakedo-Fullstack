package com.sakedo.mini_store_backend.model;


public class OrderItem {
    private String productName;
    private int quantity;
    private double price;
    private String image;


    public OrderItem() {}


    public OrderItem(String productName, int quantity, double price, String image) {
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.image = image;
    }


    // Getters & Setters
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}


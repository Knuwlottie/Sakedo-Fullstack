package com.sakedo.mini_store_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "products")
public class Product {
    @Id
    private int id;

    private String name;
    private double price;
    private String description;
    private String image;
    private String category;
    private boolean isBestSeller;
    private int discount;

    public static class Review {
        private String user;
        private int rating;
        private String comment;
        public Review() {}
        public Review(String user, int rating, String comment) {
            this.user = user;
            this.rating = rating;
            this.comment = comment;
        }
        public String getUser() { return user; }
        public void setUser(String user) { this.user = user; }
        public int getRating() { return rating; }
        public void setRating(int rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    private List<Review> reviews = new ArrayList<>();

    public Product() {}

    public Product(int id, String name, double price, String description, String image, String category, boolean isBestSeller, int discount) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.image = image;
        this.category = category;
        this.isBestSeller = isBestSeller;
        this.discount = discount;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isBestSeller() { return isBestSeller; }
    public void setBestSeller(boolean bestSeller) { isBestSeller = bestSeller; }

    public int getDiscount() { return discount; }
    public void setDiscount(int discount) { this.discount = discount; }

    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }
}
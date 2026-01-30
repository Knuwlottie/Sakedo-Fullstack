package com.sakedo.mini_store_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "contacts")
public class Contact {
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String topic;
    private String message;
    private LocalDateTime createdAt;

    public Contact() {}

    public Contact(String name, String email, String phone, String topic, String message) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.topic = topic;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    // --- GETTER & SETTER ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
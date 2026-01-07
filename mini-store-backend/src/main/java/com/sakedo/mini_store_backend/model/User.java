package com.sakedo.mini_store_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String name;
    private String phone;
    private String email;
    private String password; // Sẽ được hash sau
}
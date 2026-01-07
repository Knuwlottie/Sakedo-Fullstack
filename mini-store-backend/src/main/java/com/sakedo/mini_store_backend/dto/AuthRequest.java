package com.sakedo.mini_store_backend.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String name;
    private String phone;
    private String email;
    private String password;
}

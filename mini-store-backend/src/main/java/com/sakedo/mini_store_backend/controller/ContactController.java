package com.sakedo.mini_store_backend.controller;

import com.sakedo.mini_store_backend.model.Contact;
import com.sakedo.mini_store_backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactRepository contactRepository;

    @PostMapping
    public ResponseEntity<?> sendContact(@RequestBody Contact contact) {
        contact.setCreatedAt(LocalDateTime.now());
        contactRepository.save(contact);
        return ResponseEntity.ok(Map.of("message", "Gửi liên hệ thành công!"));
    }
}
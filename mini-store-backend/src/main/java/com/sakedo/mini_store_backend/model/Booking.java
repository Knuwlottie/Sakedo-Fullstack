package com.sakedo.mini_store_backend.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
public class Booking {
    @Id
    private String id;
    private String userId;
    private String fullName;
    private String phone;
    private int guestCount;
    private LocalDateTime bookingDate;
    private LocalDateTime expiryDate;
    private int tableNumber;
    private String status;
}
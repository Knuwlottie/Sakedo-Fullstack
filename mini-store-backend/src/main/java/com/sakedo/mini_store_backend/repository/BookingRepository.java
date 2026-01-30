package com.sakedo.mini_store_backend.repository;
import com.sakedo.mini_store_backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByTableNumberAndBookingDateLessThanAndExpiryDateGreaterThan(
            int tableNumber, LocalDateTime expiry, LocalDateTime booking);

    List<Booking> findByUserId(String userId);
}
package com.sakedo.mini_store_backend.repository;

import com.sakedo.mini_store_backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository; // Import MongoDB
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// Đổi Long thành String vì ID của Mongo là String
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByStatusIn(List<Integer> statuses);

    List<Order> findByStatus(int status);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
}
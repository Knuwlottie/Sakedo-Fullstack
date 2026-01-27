package com.sakedo.mini_store_backend.repository;


import com.sakedo.mini_store_backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface OrderRepository extends MongoRepository<Order, String> {


    List<Order> findByStatusIn(List<Integer> statuses);


    List<Order> findByStatus(int status);


    // Tìm giỏ hàng của user (status = 0)
    Optional<Order> findByUserIdAndStatus(String userId, int status);


    // Lấy tất cả đơn hàng của user
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
}


package com.sakedo.mini_store_backend.repository;


import com.sakedo.mini_store_backend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategory(String category);
}
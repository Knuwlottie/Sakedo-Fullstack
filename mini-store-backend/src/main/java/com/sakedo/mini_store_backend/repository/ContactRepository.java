package com.sakedo.mini_store_backend.repository;

import com.sakedo.mini_store_backend.model.Contact;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository extends MongoRepository<Contact, String> {
}
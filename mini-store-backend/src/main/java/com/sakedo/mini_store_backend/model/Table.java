package com.sakedo.mini_store_backend.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Document(collection = "tables")
@Data
public class Table {
    @Id
    private String id;
    private int tableNumber;
    private int capacity;
}
package com.sakedo.mini_store_backend.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Override
    protected String getDatabaseName() {
        return "mini_store_db";
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        // Đây là chuỗi kết nối Atlas của bạn, mình đã gắn cứng vào đây
        return MongoClients.create("mongodb+srv://sakedo_user:rRVxCXAnSmwnDAGL@cluster0.krjlsfr.mongodb.net/mini_store_db?retryWrites=true&w=majority");
    }
}

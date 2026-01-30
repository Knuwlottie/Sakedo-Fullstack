package com.sakedo.mini_store_backend.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final String clientId = "6d74340c-5044-4f79-9c02-4d3a1af73b67";
    private final String apiKey = "dff450a3-9c81-4679-b1fc-9e00d801e588";
    private final String checksumKey = "da3433f6c76493b96835f307946e45f369c904eed47de91e93f102599b0652e2";

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000); // 30 giây
        factory.setReadTimeout(30000);    // 30 giây
        return new RestTemplate(factory);
    }

    @PostMapping("/create-link")
    public ResponseEntity<?> createPaymentLink(@RequestBody Map<String, Object> requestData) {
        try {
            int amount = Integer.parseInt(requestData.get("amount").toString());
            long orderCode = System.currentTimeMillis() / 1000;

            String cancelUrl = "http://127.0.0.1:5500/mini-store-frontend/pages/global.html?status=CANCELLED";
            String returnUrl = "http://127.0.0.1:5500/mini-store-frontend/pages/global.html?payment=success";
            String description = "Nha hang Sakedo";

            String dataToSign = "amount=" + amount +
                    "&cancelUrl=" + cancelUrl +
                    "&description=" + description +
                    "&orderCode=" + orderCode +
                    "&returnUrl=" + returnUrl;

            String signature = calculateHmacSHA256(dataToSign, checksumKey);

            Map<String, Object> body = new HashMap<>();
            body.put("orderCode", orderCode);
            body.put("amount", amount);
            body.put("description", description);
            body.put("cancelUrl", cancelUrl);
            body.put("returnUrl", returnUrl);
            body.put("signature", signature);

            RestTemplate restTemplate = createRestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            System.out.println("--> Đang gọi PayOS API...");
            System.out.println("--> Body: " + body);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api-merchant.payos.vn/v2/payment-requests", entity, Map.class);

            System.out.println("--> PayOS Response: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data != null) {
                    return ResponseEntity.ok(Map.of("checkoutUrl", data.get("checkoutUrl")));
                }
            }
            return ResponseEntity.status(500).body(Map.of("error", "PayOS không trả về dữ liệu"));

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("--> Lỗi PayOS: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi kết nối PayOS: " + e.getMessage()));
        }
    }

    private String calculateHmacSHA256(String data, String key) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] bytes = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hash = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hash.append('0');
            hash.append(hex);
        }
        return hash.toString();
    }
}
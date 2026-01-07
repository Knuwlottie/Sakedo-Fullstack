package com.sakedo.mini_store_backend.controller;

import com.sakedo.mini_store_backend.model.Product;
import com.sakedo.mini_store_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // THÊM: Cho phép Frontend gọi API thoải mái
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // 1. API Lấy tất cả món ăn
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. API Lọc sản phẩm theo loại
    @GetMapping("/category/{type}")
    public List<Product> getProductsByCategory(@PathVariable String type) {
        return productRepository.findByCategory(type);
    }

    // 3. (MỚI) API Lấy chi tiết 1 món ăn theo ID (Dùng cho trang Product Detail)
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable int id) {
        // Tìm món ăn trong danh sách có ID trùng khớp
        Product product = productRepository.findAll().stream()
                .filter(p -> p.getId() == id)
                .findFirst()
                .orElse(null);

        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.status(404).body("Không tìm thấy sản phẩm có ID: " + id);
        }
    }

    // 4. API Khởi tạo dữ liệu (Đã thêm ID vào từng món)
    @GetMapping("/init")
    public ResponseEntity<?> initData() {
        productRepository.deleteAll();

        List<Product> list = new ArrayList<>();
        int idCounter = 1; // THÊM: Biến đếm ID bắt đầu từ 1

        // ==========================================
        // 1. MÓN CHÍNH (Category: "steak")
        // ==========================================
        // Lưu ý: Đã thêm tham số idCounter++ vào đầu mỗi constructor

        list.add(new Product(idCounter++, "Bánh Xèo Miền Tây", 50000, "Vỏ bánh vàng giòn, nhân tôm thịt đầy đặn, rau sống tươi ngon.", "banhxeo.png", "steak", true, 30));
        list.add(new Product(idCounter++, "Nem Nướng Nha Trang", 65000, "Nem nướng thơm lừng, nước chấm tương đặc biệt.", "nemnuong.png", "steak", false, 15));
        list.add(new Product(idCounter++, "Cơm Gà Xối Mỡ", 55000, "Da gà giòn tan, cơm chiên dương châu đậm vị.", "comga.png", "steak", true, 18));
        list.add(new Product(idCounter++, "Bún Bò Huế Đặc Biệt", 70000, "Hương vị cố đô, chả cua to, nước dùng cay nồng.", "bunbo.png", "steak", true, 14));

        // --- CÁC MÓN CŨ (Giữ nguyên của bạn) ---
        list.add(new Product(idCounter++, "CƠM TẤM SIÊU TO KHỔNG LỒ", 999999, "Món đặc biệt chỉ dành cho người sành ăn.", "comtam.png", "steak", true, 50));
        list.add(new Product(idCounter++, "Phở Bò Tái Nạm", 60000, "Nước dùng hầm xương 24h, bò tái mềm ngọt.", "pho.png", "steak", true, 0));
        list.add(new Product(idCounter++, "Bún Riêu Cua", 50000, "Riêu cua đồng tươi ngon, đậm đà hương vị quê hương.", "bunrieu.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Gỏi Cuốn Tôm Thịt", 15000, "Tôm thịt tươi ngon, chấm mắm nêm đậm đà.", "goicuon.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Bún Đậu Mắm Tôm", 55000, "Đậu mơ giòn rụm, chả cốm thơm ngon.", "bundau.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Mì Quảng", 45000, "Đặc sản miền Trung, hương vị đậm đà khó quên.", "miquang.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Bánh Mì Đặc Biệt", 35000, "Bánh mì giòn tan, full topping chả thịt.", "banhmi.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Canh Chua Cá Lóc", 60000, "Vị chua thanh mát, giải nhiệt ngày hè.", "canhchua.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Cá Kho Tộ", 120000, "Cá lóc kho tộ đậm đà, giảm giá sốc.", "cakho.png", "steak", false, 20));

        // ==========================================
        // 2. TRÁNG MIỆNG (Category: "dessert")
        // ==========================================
        list.add(new Product(idCounter++, "Chè Thái Sầu Riêng", 40000, "Sầu riêng tươi nguyên chất, béo ngậy.", "chethai.png", "dessert", false, 20));
        list.add(new Product(idCounter++, "Bánh Flan Caramen", 15000, "Mềm mịn, tan ngay trong miệng.", "banhflan.png", "dessert", false, 0));
        list.add(new Product(idCounter++, "Bánh Đậu Xanh", 40000, "Đặc sản Hải Dương, ngọt thanh.", "banhdau.png", "dessert", false, 25));

        // ==========================================
        // 3. ĐỒ UỐNG (Category: "coffee")
        // ==========================================
        list.add(new Product(idCounter++, "Coffee Latte", 55000, "Cà phê Ý pha máy, lớp bọt sữa bồng bềnh.", "cafee.png", "coffee", true, 0));
        list.add(new Product(idCounter++, "Nước Cam Vắt", 40000, "Cam sành tươi, bổ sung Vitamin C.", "nuoccam.png", "coffee", false, 0));
        list.add(new Product(idCounter++, "Trà Xoài Macchiato", 45000, "Trà xoài tươi mát kết hợp kem cheese.", "traxoai.png", "coffee", false, 0));
        list.add(new Product(idCounter++, "Nước Sâm Bí Đao", 20000, "Nhà làm, thanh lọc cơ thể.", "nuocsam.png", "coffee", false, 0));

        // Lưu tất cả vào Database
        productRepository.saveAll(list);

        return ResponseEntity.ok("Đã cập nhật dữ liệu thành công! (ID từ 1 đến " + (idCounter-1) + ")");
    }
    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addReview(@PathVariable int id, @RequestBody Product.Review review) {
        // 1. Tìm món ăn theo ID
        Product product = productRepository.findAll().stream()
                .filter(p -> p.getId() == id)
                .findFirst()
                .orElse(null);

        if (product == null) {
            return ResponseEntity.status(404).body("Không tìm thấy sản phẩm!");
        }

        // 2. Thêm review mới vào danh sách review của món đó
        product.getReviews().add(review);

        // 3. Lưu lại vào Database (Cập nhật dữ liệu mới)
        productRepository.save(product);

        return ResponseEntity.ok("Đã thêm đánh giá thành công!");
    }
}
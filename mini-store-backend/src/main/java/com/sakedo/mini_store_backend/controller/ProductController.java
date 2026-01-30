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
@CrossOrigin(origins = "*")
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

    // 3. API Lấy chi tiết 1 món ăn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable int id) {
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

    // 4. API Khởi tạo dữ liệu
    @GetMapping("/init")
    public ResponseEntity<?> initData() {
        productRepository.deleteAll();

        List<Product> list = new ArrayList<>();
        int idCounter = 1;

        // 1. MÓN CHÍNH
        list.add(new Product(idCounter++, "Bánh Xèo Miền Tây", 50000, "Vỏ bánh vàng giòn, nhân tôm thịt đầy đặn, rau sống tươi ngon.", "banhxeo.png", "steak", true, 30));
        list.add(new Product(idCounter++, "Nem Nướng Nha Trang", 65000, "Nem nướng thơm lừng, nước chấm tương đặc biệt.", "nemnuong.png", "steak", false, 15));
        list.add(new Product(idCounter++, "Cơm Gà Xối Mỡ", 55000, "Da gà giòn tan, cơm chiên dương châu đậm vị.", "comga.png", "steak", true, 18));
        list.add(new Product(idCounter++, "Bún Bò Huế Đặc Biệt", 70000, "Hương vị cố đô, chả cua to, nước dùng cay nồng.", "bunbo.png", "steak", true, 14));

        // --- CÁC MÓN CŨ ---
        list.add(new Product(idCounter++, "CƠM TẤM SIÊU TO KHỔNG LỒ", 999999, "Món đặc biệt chỉ dành cho người sành ăn.", "comtam.png", "steak", true, 50));
        list.add(new Product(idCounter++, "Phở Bò Tái Nạm", 85000, "Nước dùng hầm xương 24h, bò tái mềm ngọt.", "phobo.png", "steak", true, 0)); // chỉnh giá cho khớp web
        list.add(new Product(idCounter++, "Bún Riêu Cua", 70000, "Riêu cua đồng tươi ngon, đậm đà hương vị quê hương.", "bunrieuu.png", "steak", false, 0)); // chỉnh ảnh + giá
        list.add(new Product(idCounter++, "Gỏi Cuốn Tôm Thịt", 50000, "Tôm thịt tươi ngon, chấm mắm nêm đậm đà.", "goicuonthit.png", "steak", false, 0)); // chỉnh giá cho khớp
        list.add(new Product(idCounter++, "Bún Đậu Mắm Tôm", 110000, "Đậu mơ giòn rụm, chả cốm thơm ngon.", "bundau2.png", "steak", false, 10)); // chỉnh giá + ảnh + có ưu đãi
        list.add(new Product(idCounter++, "Mì Quảng", 70000, "Đặc sản miền Trung, hương vị đậm đà khó quên.", "miquang2.png", "steak", false, 0)); // chỉnh giá + ảnh
        list.add(new Product(idCounter++, "Bánh Mì Đặc Biệt", 35000, "Bánh mì giòn tan, full topping chả thịt.", "banhmithit.png", "steak", false, 23)); // chỉnh ảnh + ưu đãi
        list.add(new Product(idCounter++, "Canh Chua Cá Lóc", 130000, "Vị chua thanh mát, giải nhiệt ngày hè.", "canhchuaca.png", "steak", false, 0)); // chỉnh giá + ảnh

        list.add(new Product(idCounter++, "Cơm tấm sườn", 65000, "Cơm tấm nóng hổi với sườn nướng thơm lừng", "suonbi.png", "steak", true, 0));
        list.add(new Product(idCounter++, "Cơm tấm sườn chả", 59000, "Phiên bản ưu đãi đặc biệt trong ngày", "suonbi.png", "steak", true, 10));
        list.add(new Product(idCounter++, "Cơm chiên hải sản", 140000, "Cơm chiên nhiều hải sản tươi ngon", "comchien.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Gỏi đu đủ đâm", 100000, "Gỏi đu đủ xanh đâm tay cay nồng", "goibakhia.png", "steak", true, 0));
        list.add(new Product(idCounter++, "Bò kho", 90000, "Bò kho mềm, nước dùng đậm đà", "bokho.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Bánh xèo tôm thịt", 60000, "Bánh xèo truyền thống miền Tây", "banhxeo.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Hủ tiếu", 70000, "Hủ tiếu Nam Vang hoặc khô tùy chọn", "hutieu.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Súp cua trứng bắc thảo", 60000, "Súp cua thơm ngon, topping trứng bắc thảo", "supcua.png", "steak", false, 0));

        list.add(new Product(idCounter++, "Combo Gà 4 món", 0, "Combo đặc biệt đang giảm 20% - giá gốc liên hệ", "setga.png", "steak", true, 20));
        list.add(new Product(idCounter++, "Combo Cuốn", 120000, "Set cuốn tươi ngon đa dạng", "setcuon.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Set cơm 2 người", 70000, "Set tiết kiệm cho 2 người", "xoiman.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Set cơm 3 người", 150000, "Phù hợp nhóm 3 người ăn no", "setcom.png", "steak", true, 0));

        // Món cao cấp
        list.add(new Product(idCounter++, "Gà nướng", 250000, "Gà nướng nguyên con hoặc đùi", "ganuong.png", "steak", false, 0));
        list.add(new Product(idCounter++, "Vịt quay", 250000, "Vịt quay giòn da, thịt mềm", "vitquay.png", "steak", false, 0));

        // 2. TRÁNG MIỆNG
        list.add(new Product(idCounter++, "Chè Thái Sầu Riêng", 40000, "Sầu riêng tươi nguyên chất, béo ngậy.", "chethai.png", "dessert", false, 20));
        list.add(new Product(idCounter++, "Bánh Flan Caramen", 30000, "Mềm mịn, tan ngay trong miệng.", "banhplan.png", "dessert", false, 0)); // chỉnh giá + ảnh
        list.add(new Product(idCounter++, "Bánh Đậu Xanh", 40000, "Đặc sản Hải Dương, ngọt thanh.", "banhdau.png", "dessert", false, 25));

        // Thêm tráng miệng mới
        list.add(new Product(idCounter++, "Chè khúc bạch", 40000, "Khúc bạch mát lạnh, nhiều topping", "khucbach.png", "dessert", false, 0));
        list.add(new Product(idCounter++, "Chè chuối", 30000, "Chè chuối nóng hoặc lạnh đều ngon", "chechuoi.png", "dessert", false, 0));
        list.add(new Product(idCounter++, "Chè dưỡng nhan", 35000, "Ngọt thanh, tốt cho làn da", "duongnhan.png", "dessert", false, 0));
        list.add(new Product(idCounter++, "Bánh Dâu", 60000, "Bánh ngọt vị dâu tươi", "dautay.png", "dessert", false, 0));

        // 3. ĐỒ UỐNG
        list.add(new Product(idCounter++, "Coffee Latte", 55000, "Cà phê Ý pha máy, lớp bọt sữa bồng bềnh.", "cafee.png", "coffee", true, 0));
        list.add(new Product(idCounter++, "Nước Cam Vắt", 40000, "Cam sành tươi, bổ sung Vitamin C.", "nuoccam.png", "coffee", false, 0));
        list.add(new Product(idCounter++, "Trà Xoài Macchiato", 45000, "Trà xoài tươi mát kết hợp kem cheese.", "traxoai.png", "coffee", false, 0));
        list.add(new Product(idCounter++, "Nước Sâm Bí Đao", 20000, "Nhà làm, thanh lọc cơ thể.", "nuocsam.png", "coffee", false, 0));

        list.add(new Product(idCounter++, "Trà hoa cúc", 35000, "Thơm nhẹ, thư giãn", "tralai.png", "coffee", false, 0));
        list.add(new Product(idCounter++, "Trà sen", 40000, "Trà sen thanh mát", "trasen.png", "coffee", false, 0));
        list.add(new Product(idCounter++, "Trà chanh", 30000, "Trà chanh tươi mát, giải nhiệt", "nuocchanh.png", "coffee", true, 0));

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

        // 3. Lưu lại vào Database
        productRepository.save(product);

        return ResponseEntity.ok("Đã thêm đánh giá thành công!");
    }
}
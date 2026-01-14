let currentProduct = null; // Biến toàn cục lưu món ăn hiện tại

// Chạy khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  console.log("--> Đang xem sản phẩm ID:", productId);

  if (productId) {
    fetchProductDetail(productId);
  } else {
    alert("Không tìm thấy ID sản phẩm trên đường dẫn!");
    window.location.href = "/pages/menu.html";
  }

  updateCartBadge();
  initStarRating();
});

async function fetchProductDetail(id) {
  try {
    const response = await fetch(`http://localhost:8080/api/products/${id}`);

    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const product = await response.json();

    console.log("--> Dữ liệu nhận được từ Backend:", product);

    currentProduct = product;
    renderProductInfo(product);
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
    // Xử lý lỗi hiển thị nếu cần
    document.getElementById("detail-name").textContent = "Lỗi tải dữ liệu";
  }
}

// --- 1. HÀM HIỂN THỊ THÔNG TIN (SỬA LOGIC GIÁ) ---
function renderProductInfo(product) {
  // 1. Hiển thị Tên & Mô tả
  document.title = `${product.name || "Chi tiết món"} - Sakedo`;
  document.getElementById("detail-name").textContent =
    product.name || "Đang cập nhật...";
  document.getElementById("detail-desc").textContent =
    product.description || "Món ngon tuyệt vời từ Sakedo.";

  // 2. Hiển thị Ảnh
  const imgElement = document.getElementById("detail-img");
  if (imgElement) {
    let rawImage = product.image || product.imageUrl || "";

    // Xử lý đường dẫn ảnh (Dùng ../ để lùi ra khỏi thư mục pages)
    let finalImageSrc = "";
    if (!rawImage) {
      finalImageSrc = "https://via.placeholder.com/500x400?text=Sakedo";
    } else if (rawImage.startsWith("http")) {
      finalImageSrc = rawImage;
    } else {
      finalImageSrc = `../assets/images/${rawImage}`;
    }

    imgElement.src = finalImageSrc;
    imgElement.onerror = function () {
      this.src = "https://via.placeholder.com/500x400?text=Anh+Loi";
    };
  }

  // 3. Hiển thị Giá (LOGIC MỚI: TÍNH TOÁN GIẢM GIÁ)
  const priceBox = document.getElementById("detail-price");
  if (priceBox) {
    let finalPrice = product.price; // Mặc định là giá gốc
    let htmlContent = "";

    // Kiểm tra xem có giảm giá (discount > 0) không
    if (product.discount && product.discount > 0) {
      // Công thức: Giá sau giảm = Giá gốc * (100 - %giảm) / 100
      finalPrice = (product.price * (100 - product.discount)) / 100;

      // Lưu giá đã giảm vào biến toàn cục để tí nữa thêm vào giỏ dùng
      currentProduct.finalPrice = finalPrice;

      // HTML: Hiện giá cũ gạch ngang, giá mới to đỏ, và tem giảm giá
      htmlContent = `
        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <span class="old-price" style="text-decoration: line-through; color: #999; font-size: 1.3rem;">
                ${product.price.toLocaleString("vi-VN")}đ
            </span>
            <span class="current-price" style="color: #d32f2f; font-size: 2.2rem; font-weight: 800;">
                ${finalPrice.toLocaleString("vi-VN")}đ
            </span>
            <span style="background: #d32f2f; color: white; padding: 4px 10px; border-radius: 15px; font-weight: bold; font-size: 0.9rem;">
                -${product.discount}%
            </span>
        </div>
      `;
    } else {
      // Không giảm giá
      currentProduct.finalPrice = product.price;
      htmlContent = `<span class="current-price" style="color: #d32f2f; font-size: 2.2rem; font-weight: 800;">${product.price.toLocaleString(
        "vi-VN"
      )}đ</span>`;
    }

    priceBox.innerHTML = htmlContent;
  }
}

// --- 2. HÀM THÊM VÀO GIỎ (SỬA ĐỂ LẤY GIÁ ĐÃ GIẢM) ---
function addToCartDetail(isBuyNow) {
  if (!currentProduct) return;

  const qtyInput = document.getElementById("qty-input");
  const qty = parseInt(qtyInput.value) || 1;
  const note = document.getElementById("order-note").value;

  // Lấy giá bán (đã giảm)
  const priceToAdd = currentProduct.finalPrice
    ? currentProduct.finalPrice
    : currentProduct.price;

  // --- QUAN TRỌNG: Lấy giá gốc để lưu vào ---
  const originalPriceToAdd = currentProduct.price;

  // Xử lý ảnh
  let imgSrc = currentProduct.image;
  if (imgSrc && !imgSrc.startsWith("http"))
    imgSrc = `../assets/images/${imgSrc}`;

  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: priceToAdd, // Giá bán thực tế
    originalPrice: originalPriceToAdd, // <--- THÊM DÒNG NÀY: Lưu giá gốc
    image: imgSrc,
    quantity: qty,
    note: note,
  };

  // ... (Đoạn dưới lưu vào localStorage giữ nguyên) ...
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id == cartItem.id);

  if (existingItem) {
    existingItem.quantity += qty;
    if (note) existingItem.note = note;
    // Cập nhật lại giá gốc nếu món cũ chưa có
    existingItem.originalPrice = originalPriceToAdd;
  } else {
    cart.push(cartItem);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();

  if (isBuyNow) {
    window.location.href = "/pages/cart.html";
  } else {
    alert(`Đã thêm ${qty} phần "${currentProduct.name}" vào giỏ!`);
  }
}

// ... (Các hàm hỗ trợ giữ nguyên) ...
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-count-badge");
  if (badge) badge.innerText = totalQty;
}

function initStarRating() {
  const stars = document.querySelectorAll("#star-rating-input i");
  const ratingInput = document.getElementById("rating-value");
  if (!stars.length) return;

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const value = this.getAttribute("data-value");
      if (ratingInput) ratingInput.value = value;
      stars.forEach((s) => {
        if (s.getAttribute("data-value") <= value) s.classList.add("active");
        else s.classList.remove("active");
      });
    });
  });
}

function submitReview() {
  alert("Cảm ơn bạn đã đánh giá!");
}

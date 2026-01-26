let currentProduct = null;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  console.log("--> Đang xem sản phẩm ID:", productId);

  if (productId) {
    fetchProductDetail(productId);
  } else {
    alert("Không tìm thấy ID sản phẩm!");
    window.location.href = "menu.html";
  }

  updateCartBadge();
  initStarRating();
});

// ============================================================
// 1. TẢI VÀ HIỂN THỊ DỮ LIỆU
// ============================================================
async function fetchProductDetail(id) {
  try {
    const response = await fetch(`http://localhost:8080/api/products/${id}`);
    if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

    const product = await response.json();
    currentProduct = product;
    renderProductInfo(product);
  } catch (error) {
    console.error("Lỗi:", error);
    document.getElementById("detail-name").textContent = "Lỗi tải dữ liệu";
  }
}

function renderProductInfo(product) {
  // 1. Tên & Mô tả
  document.title = `${product.name} - Sakedo`;
  document.getElementById("detail-name").textContent = product.name;
  document.getElementById("detail-desc").textContent =
    product.description || "Món ngon từ Sakedo.";

  // 2. Ảnh
  const imgElement = document.getElementById("detail-img");
  if (imgElement) {
    let rawImage = product.image || "";
    // Xử lý đường dẫn ảnh
    if (!rawImage) imgElement.src = "https://placehold.co/500x400?text=Sakedo";
    else if (rawImage.startsWith("http")) imgElement.src = rawImage;
    else imgElement.src = `../assets/images/${rawImage}`;

    imgElement.onerror = () =>
      (imgElement.src = "https://placehold.co/500x400?text=No+Image");
  }

  // 3. Giá & Khuyến mãi
  const priceBox = document.getElementById("detail-price");
  if (priceBox) {
    let finalPrice = product.price;

    if (product.discount && product.discount > 0) {
      finalPrice = (product.price * (100 - product.discount)) / 100;
      currentProduct.finalPrice = finalPrice; // Lưu giá đã giảm

      priceBox.innerHTML = `
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
        </div>`;
    } else {
      currentProduct.finalPrice = product.price;
      priceBox.innerHTML = `
        <span class="current-price" style="color: #d32f2f; font-size: 2.2rem; font-weight: 800;">
            ${product.price.toLocaleString("vi-VN")}đ
        </span>`;
    }
  }
}

// ============================================================
// 2. XỬ LÝ GIỎ HÀNG (CHẶN KHÁCH)
// ============================================================
function addToCartDetail(isBuyNow) {
  // 🔥 CHẶN KHÁCH: Kiểm tra quyền trước
  if (typeof window.checkLoginRequired === "function") {
    if (!window.checkLoginRequired()) return;
  }

  if (!currentProduct) return;

  const qtyInput = document.getElementById("qty-input");
  const qty = parseInt(qtyInput.value) || 1;
  const note = document.getElementById("order-note").value;

  // Lấy giá bán thực tế và giá gốc
  const priceToAdd = currentProduct.finalPrice || currentProduct.price;
  const originalPriceToAdd = currentProduct.price;

  // Xử lý ảnh để lưu vào cart (chỉ lưu tên file cho gọn nếu là ảnh local)
  let imageToSave = currentProduct.image;

  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: priceToAdd,
    originalPrice: originalPriceToAdd,
    image: imageToSave,
    quantity: qty,
    note: note,
  };

  // Logic lưu vào LocalStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id == cartItem.id);

  if (existingItem) {
    existingItem.quantity += qty;
    if (note) existingItem.note = note;
    existingItem.originalPrice = originalPriceToAdd;
  } else {
    cart.push(cartItem);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();

  if (isBuyNow) {
    window.location.href = "cart.html";
  } else {
    alert(`Đã thêm ${qty} phần "${currentProduct.name}" vào giỏ!`);
  }
}

// ============================================================
// 3. CÁC HÀM HỖ TRỢ
// ============================================================
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
  // 🔥 CHẶN KHÁCH ĐÁNH GIÁ
  if (typeof window.checkLoginRequired === "function") {
    if (!window.checkLoginRequired()) return;
  }

  alert("Cảm ơn bạn đã đánh giá!");
}

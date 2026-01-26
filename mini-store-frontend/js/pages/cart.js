document.addEventListener("DOMContentLoaded", function () {
  renderCart();
  setupCheckoutButton();
});

// ============================================================
// 1. XỬ LÝ SỰ KIỆN NÚT THANH TOÁN (CHẶN KHÁCH)
// ============================================================
function setupCheckoutButton() {
  const btnCheckout = document.getElementById("btn-checkout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", function (e) {
      e.preventDefault(); // Ngăn chuyển trang mặc định

      // Gọi hàm kiểm tra quyền từ file global.js
      if (typeof window.checkLoginRequired === "function") {
        if (!window.checkLoginRequired()) return;
      }

      // Nếu là Member hợp lệ -> Chuyển trang thanh toán
      window.location.href = "checkout.html";
    });
  }
}

// ============================================================
// 2. HIỂN THỊ GIỎ HÀNG
// ============================================================
function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContent = document.getElementById("cart-content");
  const emptyMsg = document.getElementById("empty-cart-msg");
  const itemsWrapper = document.getElementById("cart-items-wrapper");

  // Xử lý khi giỏ rỗng
  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "block";
    return;
  } else {
    if (cartContent) cartContent.style.display = "flex";
    if (emptyMsg) emptyMsg.style.display = "none";
  }

  itemsWrapper.innerHTML = "";
  let subTotal = 0;

  cart.forEach((item, index) => {
    // Xử lý giá (đảm bảo là số)
    let price = item.price;
    if (typeof price === "string") {
      price = parseFloat(price.replace(/\./g, "").replace("đ", ""));
    }

    let originalPrice = item.originalPrice ? item.originalPrice : 0;
    if (typeof originalPrice === "string") {
      originalPrice = parseFloat(
        originalPrice.replace(/\./g, "").replace("đ", ""),
      );
    }

    // Tính tổng tiền món
    const itemTotal = price * item.quantity;
    subTotal += itemTotal;

    // Logic hiển thị giá (Có giảm giá vs Không giảm giá)
    let priceHtml = "";
    if (originalPrice > price) {
      priceHtml = `
            <div style="display: flex; flex-direction: column; align-items: flex-start;">
                <span style="text-decoration: line-through; color: #999; font-size: 0.85rem;">
                    ${originalPrice.toLocaleString()}đ
                </span>
                <span class="item-price" style="color: #d32f2f; font-weight: 700;">
                    ${price.toLocaleString()}đ
                </span>
            </div>`;
    } else {
      priceHtml = `<span class="item-price" style="font-weight: 700;">${price.toLocaleString()}đ</span>`;
    }

    // Xử lý đường dẫn ảnh (Tránh lỗi 404)
    let imgSrc = item.image;
    if (!imgSrc.includes("/") && !imgSrc.startsWith("http")) {
      imgSrc = `../assets/images/${item.image}`;
    }

    // Render HTML Item
    const html = `
            <div class="cart-item">
                <img src="${imgSrc}" alt="${item.name}" class="item-img" 
                     onerror="this.src='https://placehold.co/100x100?text=Food'">
                
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-note">${item.note ? "Ghi chú: " + item.note : ""}</span>
                    ${priceHtml}
                </div>

                <div class="qty-ctrl">
                    <button class="qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
                </div>

                <i class="fas fa-trash-alt btn-remove" onclick="removeItem(${index})"></i>
            </div>
        `;
    itemsWrapper.innerHTML += html;
  });

  // Cập nhật Tổng tiền cuối cùng
  const shippingFee = 15000;
  const finalTotal = subTotal + shippingFee;

  const subTotalEl = document.getElementById("sub-total");
  const finalTotalEl = document.getElementById("final-total");

  if (subTotalEl) subTotalEl.textContent = subTotal.toLocaleString() + "đ";
  if (finalTotalEl)
    finalTotalEl.textContent = finalTotal.toLocaleString() + "đ";
}

// ============================================================
// 3. CÁC HÀM HỖ TRỢ (TĂNG GIẢM / XÓA)
// ============================================================

function updateItemQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index]) {
    cart[index].quantity += change;

    // Nếu giảm về 0 thì hỏi xóa
    if (cart[index].quantity < 1) {
      if (confirm("Bạn muốn xóa món này khỏi giỏ?")) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = 1;
      }
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();

  // Cập nhật badge trên header (nếu có)
  if (window.updateCartBadge) window.updateCartBadge();
}

function removeItem(index) {
  if (confirm("Xóa món này khỏi giỏ hàng?")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();

    if (window.updateCartBadge) window.updateCartBadge();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderCart();
});

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContent = document.getElementById("cart-content");
  const emptyMsg = document.getElementById("empty-cart-msg");
  const itemsWrapper = document.getElementById("cart-items-wrapper");

  // Nếu giỏ rỗng
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
    // --- SỬA LỖI NaN TẠI ĐÂY ---
    // Đảm bảo giá là số. Nếu lưu nhầm chuỗi "55.000" thì xóa dấu chấm đi
    let price = item.price;
    if (typeof price === "string") {
      price = parseFloat(price.replace(/\./g, "").replace("đ", ""));
    }
    // ---------------------------

    const itemTotal = price * item.quantity;
    subTotal += itemTotal;

    const html = `
            <div class="cart-item">
                <img src="/assets/images/${item.image}" alt="${
      item.name
    }" class="item-img" 
                     onerror="this.src='https://placehold.co/100x100?text=Food'">
                
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-note">${
                      item.note ? "Note: " + item.note : ""
                    }</span>
                    <span class="item-price">${price.toLocaleString()}đ</span>
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

  // Cập nhật Tổng tiền
  const shippingFee = 15000;
  const finalTotal = subTotal + shippingFee;

  const subTotalEl = document.getElementById("sub-total");
  const finalTotalEl = document.getElementById("final-total");

  if (subTotalEl) subTotalEl.textContent = subTotal.toLocaleString() + "đ";
  if (finalTotalEl)
    finalTotalEl.textContent = finalTotal.toLocaleString() + "đ";
}

// Hàm tăng giảm số lượng
function updateItemQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index]) {
    cart[index].quantity += change;

    // Nếu giảm về 0 thì hỏi có xóa không
    if (cart[index].quantity < 1) {
      if (confirm("Bạn muốn xóa món này khỏi giỏ?")) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = 1; // Hủy xóa thì trả về 1
      }
    }
  }

  // Lưu lại và render lại
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();

  // Cập nhật số trên header (Hàm trong global.js)
  if (window.updateCartBadge) window.updateCartBadge();
}

// Hàm xóa hẳn món ăn
function removeItem(index) {
  if (confirm("Xóa món này khỏi giỏ hàng?")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));

    renderCart();
    if (window.updateCartBadge) window.updateCartBadge();
  }
}

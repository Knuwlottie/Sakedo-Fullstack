document.addEventListener("DOMContentLoaded", function () {
  renderCart();

  // Gán sự kiện cho nút thanh toán
  const checkoutBtn = document.querySelector(".btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.onclick = handleCheckout;
  }
});

// Hàm xử lý đường dẫn ảnh
function getCartImageUrl(imgName) {
  if (!imgName || imgName.trim() === "" || imgName === "no-image.png") {
    return "https://placehold.co/100x100?text=Sakedo";
  }
  // Nếu là link online hoặc base64 -> giữ nguyên
  if (imgName.startsWith("http") || imgName.startsWith("data:")) {
    return imgName;
  }
  // Nếu đã có đường dẫn -> giữ nguyên
  if (imgName.includes("/")) {
    return imgName;
  }
  // Nếu chỉ là tên file -> thêm đường dẫn
  return `../assets/images/${imgName}`;
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsWrapper = document.getElementById("cart-items-wrapper");
  const cartContent = document.getElementById("cart-content");
  const emptyMsg = document.getElementById("empty-cart-msg");

  if (!itemsWrapper) return;

  // Hiện/ẩn nội dung dựa vào giỏ hàng
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
    // Xử lý giá tiền
    let price =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/\./g, "").replace("đ", ""))
        : item.price;
    subTotal += price * item.quantity;

    // Xử lý ảnh
    let imgSrc = getCartImageUrl(item.image);

    itemsWrapper.innerHTML += `
      <div class="cart-item">
        <img src="${imgSrc}" class="item-img" onerror="this.src='https://placehold.co/100x100?text=Sakedo'">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-price" style="font-weight: 700;">${price.toLocaleString()}đ</span>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
        </div>
        <i class="fas fa-trash-alt btn-remove" onclick="removeItem(${index})"></i>
      </div>`;
  });

  // Tính tổng
  const shippingFee = 15000;
  const finalTotal = subTotal + shippingFee;

  if (document.getElementById("sub-total")) {
    document.getElementById("sub-total").textContent =
      subTotal.toLocaleString() + "đ";
  }
  if (document.getElementById("shipping-fee")) {
    document.getElementById("shipping-fee").textContent =
      shippingFee.toLocaleString() + "đ";
  }
  if (document.getElementById("final-total")) {
    document.getElementById("final-total").textContent =
      finalTotal.toLocaleString() + "đ";
  }
}

// Xử lý thanh toán qua PayOS
async function handleCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  const finalTotalEl = document.getElementById("final-total");
  if (!finalTotalEl) return;

  const amountText = finalTotalEl.textContent.replace(/[^\d]/g, "");
  const amount = parseInt(amountText);

  if (amount <= 0) {
    alert("Số tiền không hợp lệ!");
    return;
  }

  const btn = document.querySelector(".btn-checkout");

  try {
    if (btn) {
      btn.innerText = "ĐANG TẠO MÃ QR...";
      btn.disabled = true;
    }

    console.log("--> Đang gọi API tạo link thanh toán với số tiền:", amount);

    const response = await fetch(
      "http://localhost:8080/api/payment/create-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount }),
      },
    );

    const data = await response.json();
    console.log("--> Response từ Backend:", data);

    if (response.ok && data.checkoutUrl) {
      // Chuyển hướng đến trang thanh toán PayOS
      window.location.href = data.checkoutUrl;
    } else {
      alert("Lỗi: " + (data.error || "Server không trả về link thanh toán"));
      if (btn) {
        btn.innerText = "THANH TOÁN NGAY";
        btn.disabled = false;
      }
    }
  } catch (error) {
    console.error("--> Lỗi kết nối Backend:", error);
    alert("Lỗi kết nối Server! Kiểm tra Backend đang chạy không.");
    if (btn) {
      btn.innerText = "THANH TOÁN NGAY";
      btn.disabled = false;
    }
  }
}

function updateItemQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += change;
  if (cart[index].quantity < 1) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  if (confirm("Xóa món này khỏi giỏ hàng?")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}

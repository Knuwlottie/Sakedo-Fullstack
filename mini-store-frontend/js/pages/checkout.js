// --- FILE: js/pages/checkout.js (PHIÊN BẢN ĐÃ FIX USER ID) ---

console.log("--> FILE JS CHECKOUT ĐÃ TẢI THÀNH CÔNG!");

let subTotalAmount = 0;

document.addEventListener("DOMContentLoaded", function () {
  console.log("1. Trang đã tải xong HTML");

  // Tự động điền thông tin nếu đã đăng nhập (UX tốt hơn)
  autoFillUserInfo();

  // Kiểm tra giỏ hàng
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    console.warn("Giỏ hàng trống!");
    // Nếu muốn chặn người dùng vào trang này khi giỏ trống thì mở comment dưới ra
    // alert("Giỏ hàng đang trống!");
    // window.location.href = "menu.html";
    return;
  }

  const miniList = document.getElementById("mini-cart-list");
  if (miniList) {
    // Render Giỏ hàng nhỏ
    subTotalAmount = 0;
    miniList.innerHTML = ""; // Xóa cũ
    cart.forEach((item) => {
      let price = item.price;
      if (typeof price === "string") {
        price = parseFloat(price.replace(/\./g, "").replace("đ", ""));
      }
      subTotalAmount += price * item.quantity;

      miniList.innerHTML += `
                <div class="item-mini" style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px dashed #eee; padding-bottom:5px;">
                    <div><b>${item.name}</b> <span style="font-size:0.85em; color:#666;">x${item.quantity}</span></div>
                    <div>${(price * item.quantity).toLocaleString()}đ</div>
                </div>`;
    });
  }

  // Hiển thị tạm tính
  const subTotalEl = document.getElementById("ck-subtotal");
  if (subTotalEl)
    subTotalEl.textContent = subTotalAmount.toLocaleString() + "đ";

  calculateShipping();
});

// Hàm tự điền thông tin user (Mới thêm)
function autoFillUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const nameEl = document.getElementById("cus-name");
    const phoneEl = document.getElementById("cus-phone");
    const addrEl = document.getElementById("cus-address-detail");

    // Ưu tiên lấy tên hiển thị hoặc họ tên đầy đủ
    if (nameEl) nameEl.value = user.name || user.fullName || "";
    if (phoneEl) phoneEl.value = user.phone || "";
    if (addrEl) addrEl.value = user.address || "";
  }
}

function calculateShipping() {
  const districtSelect = document.getElementById("shipping-district");
  const totalEl = document.getElementById("ck-total");
  const shipDisplay = document.getElementById("shipping-fee-display");

  let shippingFee = 0;
  if (districtSelect && districtSelect.value) {
    shippingFee = parseInt(districtSelect.value);
  }

  if (shipDisplay) shipDisplay.textContent = shippingFee.toLocaleString() + "đ";
  if (totalEl)
    totalEl.textContent = (subTotalAmount + shippingFee).toLocaleString() + "đ";
}

// --- HÀM QUAN TRỌNG NHẤT: SUBMIT ---
async function submitOrder() {
  console.log(">>> BẮT ĐẦU ẤN NÚT ĐẶT HÀNG <<<");

  // 1. Lấy dữ liệu từ Form HTML
  const nameEl = document.getElementById("cus-name");
  const phoneEl = document.getElementById("cus-phone");
  const addrEl = document.getElementById("cus-address-detail");
  const distEl = document.getElementById("shipping-district");
  const noteEl = document.getElementById("cus-note");

  if (!nameEl || !phoneEl || !addrEl || !distEl) {
    alert("Lỗi code HTML: Thiếu ID input (cus-name, cus-phone...)");
    return;
  }

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const addressDetail = addrEl.value.trim();
  const districtValue = distEl.value;
  const note = noteEl ? noteEl.value.trim() : "";

  // 2. Validate cơ bản
  if (!name || !phone || !addressDetail) {
    alert("Vui lòng điền đủ: Họ tên, SĐT, Địa chỉ chi tiết!");
    return;
  }
  if (!districtValue) {
    alert("Vui lòng chọn Quận/Huyện để tính ship!");
    return;
  }

  // 3. Chuẩn bị dữ liệu gửi đi
  const districtName = distEl.options[distEl.selectedIndex].text;
  const fullAddress = `${addressDetail}, ${districtName}, TP. Hồ Chí Minh`;
  const shippingFee = parseInt(districtValue);
  const totalAmount = subTotalAmount + shippingFee;

  // Map Items từ localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsToSend = cart.map((item) => {
    let p = item.price;
    if (typeof p === "string")
      p = parseFloat(p.replace(/\./g, "").replace("đ", ""));

    // Đảm bảo gửi đủ ảnh và tên
    return {
      productName: item.name,
      quantity: item.quantity,
      price: p,
      image: item.image || "", // Gửi kèm ảnh để hiện bên lịch sử
    };
  });

  // --- [QUAN TRỌNG] LẤY USER ID ---
  let userId = localStorage.getItem("currentUserId");
  if (!userId) {
    // Fallback: Nếu không có currentUserId, thử lấy từ object user
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser) userId = localUser.id || localUser._id;
  }

  // Nếu vẫn không có ID -> Bắt đăng nhập
  if (!userId) {
    alert("Bạn cần đăng nhập để tích điểm và theo dõi đơn hàng!");
    window.location.href = "auth.html";
    return;
  }

  // 4. Tạo gói tin JSON (Đã có userId)
  const orderData = {
    userId: userId, // <--- DÒNG NÀY QUYẾT ĐỊNH VIỆC HIỆN LỊCH SỬ
    customerName: name,
    customerPhone: phone,
    customerAddress: fullAddress,
    note: note,
    shippingFee: shippingFee,
    totalAmount: totalAmount,
    status: 0, // 0: Chờ xác nhận
    items: itemsToSend,
  };

  console.log("--> Đang gửi dữ liệu:", orderData);

  // 5. Gửi API
  const btnSubmit =
    document.querySelector("button[onclick='submitOrder()']") ||
    document.querySelector(".btn-confirm");
  if (btnSubmit) {
    btnSubmit.innerHTML = "Đang xử lý...";
    btnSubmit.disabled = true;
  }

  try {
    const response = await fetch("http://localhost:8080/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const result = await response.json();
      alert("✅ ĐẶT HÀNG THÀNH CÔNG!");

      // Xóa giỏ hàng và chuyển hướng về trang lịch sử
      localStorage.removeItem("cart");
      window.location.href = "profile.html"; // Chuyển về profile để xem đơn vừa đặt
    } else {
      const errText = await response.text();
      alert("Lỗi Server: " + errText);
      if (btnSubmit) {
        btnSubmit.innerHTML = "XÁC NHẬN ĐẶT HÀNG";
        btnSubmit.disabled = false;
      }
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    alert("Không thể kết nối đến Server Backend!");
    if (btnSubmit) {
      btnSubmit.innerHTML = "XÁC NHẬN ĐẶT HÀNG";
      btnSubmit.disabled = false;
    }
  }
}

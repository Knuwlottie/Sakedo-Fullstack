// --- BIẾN TOÀN CỤC ---
let subTotalAmount = 0; // Tổng tiền hàng (chưa ship)

// --- 1. KHỞI TẠO KHI LOAD TRANG ---
document.addEventListener("DOMContentLoaded", function () {
  // A. Kiểm tra giỏ hàng có hàng không
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Giỏ hàng của bạn đang trống! Vui lòng chọn món ăn.");
    window.location.href = "/index.html"; // Quay về trang chủ
    return;
  }

  // B. Render danh sách món ăn thu nhỏ (Mini Cart)
  const miniList = document.getElementById("mini-cart-list");
  miniList.innerHTML = ""; // Xóa nội dung cũ (nếu có)

  subTotalAmount = 0; // Reset tổng tiền

  cart.forEach((item) => {
    // Xử lý giá tiền an toàn (Chuyển chuỗi "35.000đ" thành số 35000)
    let price = item.price;
    if (typeof price === "string") {
      price = parseFloat(price.replace(/\./g, "").replace("đ", ""));
    }

    // Cộng dồn tổng tiền hàng
    subTotalAmount += price * item.quantity;

    // HTML cho từng món
    miniList.innerHTML += `
            <div class="item-mini">
                <img src="/assets/images/${
                  item.image
                }" onerror="this.src='https://placehold.co/60x60?text=Food'">
                <div>
                    <div style="font-weight:bold; color:#333;">${
                      item.name
                    }</div>
                    <div style="font-size:0.85rem; color:#777;">Số lượng: ${
                      item.quantity
                    }</div>
                    <div style="color:#d32f2f; font-weight:600;">${(
                      price * item.quantity
                    ).toLocaleString()}đ</div>
                </div>
            </div>
        `;
  });

  // C. Hiển thị Tạm tính lên giao diện
  const subTotalEl = document.getElementById("ck-subtotal");
  if (subTotalEl)
    subTotalEl.textContent = subTotalAmount.toLocaleString() + "đ";

  // D. Gọi hàm tính ship lần đầu (để cập nhật Tổng cộng mặc định)
  calculateShipping();

  // E. Tự động điền thông tin khách hàng (Nếu đã đăng nhập)
  const userJson = localStorage.getItem("user");
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const nameInput = document.getElementById("cus-name");
      const phoneInput = document.getElementById("cus-phone");

      if (nameInput && user.name) nameInput.value = user.name;
      if (phoneInput && user.phone) phoneInput.value = user.phone;
    } catch (e) {
      console.error("Lỗi đọc dữ liệu user:", e);
    }
  }
});

// --- 2. HÀM TÍNH PHÍ SHIP & TỔNG TIỀN (GỌI KHI ĐỔI QUẬN) ---
function calculateShipping() {
  const districtSelect = document.getElementById("shipping-district");
  const shippingFeeEl = document.getElementById("shipping-fee-display");
  const totalEl = document.getElementById("ck-total");

  // Lấy giá trị ship từ value của option (Nếu chưa chọn gì thì = 0)
  let shippingFee = 0;
  if (districtSelect && districtSelect.value) {
    shippingFee = parseInt(districtSelect.value);
  }

  // Cập nhật hiển thị phí ship lên màn hình
  if (shippingFeeEl) {
    shippingFeeEl.textContent =
      shippingFee > 0 ? shippingFee.toLocaleString() + "đ" : "0đ";

    // Đổi màu nếu chưa chọn ship
    shippingFeeEl.style.color = shippingFee > 0 ? "#28a745" : "#555";
  }

  // Cập nhật Tổng Thanh Toán (Hàng + Ship)
  const finalTotal = subTotalAmount + shippingFee;
  if (totalEl) {
    totalEl.textContent = finalTotal.toLocaleString() + "đ";
  }
}

// --- 3. HÀM GỬI ĐƠN HÀNG (SUBMIT) ---
async function submitOrder() {
  // A. Lấy dữ liệu từ Form
  const name = document.getElementById("cus-name").value.trim();
  const phone = document.getElementById("cus-phone").value.trim();
  const addressDetail = document
    .getElementById("cus-address-detail")
    .value.trim();
  const districtSelect = document.getElementById("shipping-district");
  const note = document.getElementById("cus-note").value.trim();

  // B. Validate (Kiểm tra dữ liệu)
  if (!name || !phone || !addressDetail) {
    alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
    return;
  }

  // Kiểm tra đã chọn Quận chưa
  if (!districtSelect || districtSelect.value === "") {
    alert("Vui lòng chọn Khu vực giao hàng để chúng tôi tính phí ship!");
    districtSelect.focus();
    return;
  }

  // C. Xử lý dữ liệu đơn hàng
  // Lấy tên quận (Text) thay vì lấy giá tiền (Value)
  const districtName = districtSelect.options[districtSelect.selectedIndex].text
    .split("(")[0]
    .trim();

  // Gộp địa chỉ đầy đủ (Thêm TP.HCM mặc định)
  const fullAddress = `${addressDetail}, ${districtName}, TP. Hồ Chí Minh`;

  const shippingFee = parseInt(districtSelect.value);
  const finalTotal = subTotalAmount + shippingFee;
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  // Tạo Object Đơn Hàng chuẩn để gửi về Backend
  const orderData = {
    customerName: name,
    customerPhone: phone,
    customerAddress: fullAddress,
    note: note,
    shippingFee: shippingFee,
    totalAmount: finalTotal,
    items: cartItems,
    createdAt: new Date().toISOString(),
  };

  console.log("--> Đang gửi đơn hàng:", orderData);

  // D. Gửi dữ liệu (Giả lập hoặc gọi API thật)
  try {
    // --- CÁCH 1: NẾU ĐÃ CÓ API BACKEND ---
    /*
        const response = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) throw new Error("Lỗi Server");
        const result = await response.json(); // Nhận về Order ID ví dụ: { id: "ORD-123" }
        */

    // --- CÁCH 2: GIẢ LẬP THÀNH CÔNG (Dùng tạm khi chưa có Backend Order) ---
    // Giả vờ đợi 1 giây cho giống thật
    const btn = document.querySelector(".btn-confirm");
    const originalText = btn.innerText;
    btn.innerText = "ĐANG XỬ LÝ...";
    btn.disabled = true;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Tạo mã đơn hàng giả
    const fakeOrderId = "SKD-" + Math.floor(Math.random() * 10000);

    // THÔNG BÁO THÀNH CÔNG
    alert(
      `🎉 ĐẶT HÀNG THÀNH CÔNG!\nMã đơn: ${fakeOrderId}\nTổng tiền: ${finalTotal.toLocaleString()}đ\n\nChúng tôi sẽ giao đến: ${fullAddress}`
    );

    // E. Dọn dẹp và Chuyển hướng
    localStorage.removeItem("cart"); // Xóa giỏ hàng

    // NẾU BẠN ĐÃ LÀM TRANG TRACKING:
    // window.location.href = `/pages/order-tracking.html?id=${fakeOrderId}`;

    // NẾU CHƯA CÓ TRANG TRACKING THÌ VỀ TRANG CHỦ:
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Lỗi đặt hàng:", error);
    alert("Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại!");

    // Reset nút bấm
    const btn = document.querySelector(".btn-confirm");
    btn.innerText = "XÁC NHẬN ĐẶT HÀNG";
    btn.disabled = false;
  }
}

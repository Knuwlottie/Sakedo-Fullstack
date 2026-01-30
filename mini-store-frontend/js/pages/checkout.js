console.log("--> FILE JS CHECKOUT ĐÃ TẢI THÀNH CÔNG!");

let subTotalAmount = 0;

document.addEventListener("DOMContentLoaded", function () {
  console.log("1. Trang đã tải xong HTML");

  autoFillUserInfo();

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    console.warn("Giỏ hàng trống!");
    return;
  }

  const miniList = document.getElementById("mini-cart-list");
  if (miniList) {
    subTotalAmount = 0;
    miniList.innerHTML = "";
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

  const subTotalEl = document.getElementById("ck-subtotal");
  if (subTotalEl)
    subTotalEl.textContent = subTotalAmount.toLocaleString() + "đ";

  calculateShipping();
});

function autoFillUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const nameEl = document.getElementById("cus-name");
    const phoneEl = document.getElementById("cus-phone");
    const addrEl = document.getElementById("cus-address-detail");

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

async function submitOrder() {
  console.log(">>> BẮT ĐẦU ẤN NÚT ĐẶT HÀNG <<<");

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

  if (!name || !phone || !addressDetail) {
    alert("Vui lòng điền đủ: Họ tên, SĐT, Địa chỉ chi tiết!");
    return;
  }
  if (!districtValue) {
    alert("Vui lòng chọn Quận/Huyện để tính ship!");
    return;
  }

  // Lấy phương thức thanh toán
  const paymentMethodEl = document.querySelector(
    'input[name="paymentMethod"]:checked',
  );
  const paymentMethod = paymentMethodEl
    ? paymentMethodEl.value.toUpperCase()
    : "COD";

  const districtName = distEl.options[distEl.selectedIndex].text;
  const fullAddress = `${addressDetail}, ${districtName}, TP. Hồ Chí Minh`;
  const shippingFee = parseInt(districtValue);
  const totalAmount = subTotalAmount + shippingFee;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsToSend = cart.map((item) => {
    let p = item.price;
    if (typeof p === "string")
      p = parseFloat(p.replace(/\./g, "").replace("đ", ""));

    // Lấy image name an toàn
    let safeImage = item.image || "no-image.png";
    if (safeImage.startsWith("data:")) {
      safeImage = "no-image.png";
    } else if (safeImage.includes("/")) {
      safeImage = safeImage.split("/").pop();
    }

    return {
      productName: item.name,
      quantity: item.quantity,
      price: p,
      image: safeImage,
      note: item.note || "",
    };
  });

  let userId = localStorage.getItem("currentUserId");
  if (!userId) {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser) userId = localUser.id || localUser._id;
  }

  if (!userId) {
    alert("Bạn cần đăng nhập để tích điểm và theo dõi đơn hàng!");
    window.location.href = "auth.html";
    return;
  }

  // Status = 0: Chờ xác nhận (Admin duyệt)
  // Đơn hàng mới sẽ đợi: Admin duyệt -> Driver nhận -> Giao hàng -> Hoàn thành
  const orderData = {
    userId: userId,
    customerName: name,
    customerPhone: phone,
    customerAddress: fullAddress,
    note: note,
    paymentMethod: paymentMethod,
    shippingFee: shippingFee,
    totalAmount: totalAmount,
    status: 0, // Chờ admin duyệt
    items: itemsToSend,
  };

  console.log("--> Đang gửi dữ liệu:", orderData);

  const btnSubmit =
    document.querySelector("button[onclick='submitOrder()']") ||
    document.querySelector(".btn-confirm");
  if (btnSubmit) {
    btnSubmit.innerHTML = "Đang xử lý...";
    btnSubmit.disabled = true;
  }

  try {
    // Nếu thanh toán chuyển khoản, tạo link thanh toán trước
    if (paymentMethod === "BANK") {
      // Lưu order pending để khi thanh toán xong sẽ cập nhật
      localStorage.setItem("pendingOrder", JSON.stringify(orderData));

      const paymentResponse = await fetch(
        "http://localhost:8080/api/payment/create-link",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount }),
        },
      );

      const paymentData = await paymentResponse.json();
      console.log("--> Response từ PayOS:", paymentData);

      if (paymentResponse.ok && paymentData.checkoutUrl) {
        // Lưu orderId để xử lý sau khi thanh toán
        if (paymentData.orderCode) {
          localStorage.setItem(
            "pendingPaymentOrderCode",
            paymentData.orderCode,
          );
        }
        window.location.href = paymentData.checkoutUrl;
        return;
      } else {
        alert(
          "Lỗi tạo link thanh toán: " +
            (paymentData.error || "Không thể kết nối"),
        );
        if (btnSubmit) {
          btnSubmit.innerHTML = "XÁC NHẬN ĐẶT HÀNG";
          btnSubmit.disabled = false;
        }
        return;
      }
    }

    // Thanh toán COD - tạo đơn hàng trực tiếp
    const response = await fetch("http://localhost:8080/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("--> ✅ Đơn hàng đã được tạo:", result);

      alert(
        "✅ ĐẶT HÀNG THÀNH CÔNG!\n\nĐơn hàng của bạn đang chờ xác nhận từ cửa hàng.",
      );

      localStorage.removeItem("cart");
      window.location.href = "profile.html";
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

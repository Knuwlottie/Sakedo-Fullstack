const API_BASE_URL = "http://localhost:8080/api";

// Lấy userId từ localStorage
function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) return user.id;
    if (user && user.email) return user.email;
  } catch (e) {}

  // Nếu chưa đăng nhập, tạo guest ID
  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId =
      "guest_" + Date.now() + "_" + Math.random().toString(36).substring(7);
    localStorage.setItem("guestId", guestId);
  }
  return guestId;
}

// Lấy thông tin khách hàng
function getCustomerInfo() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      return {
        customerName: user.name || user.fullName || "",
        customerPhone: user.phone || "",
        customerAddress: user.address || "",
      };
    }
  } catch (e) {}
  return { customerName: "", customerPhone: "", customerAddress: "" };
}

async function syncCartToMongoDB() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const userId = getCurrentUserId();
  const customerInfo = getCustomerInfo();

  console.log("--> Đang sync giỏ hàng lên MongoDB...", {
    userId,
    itemCount: cart.length,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/orders/cart/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        items: cart,
        ...customerInfo,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("--> ✅ Sync thành công!", result);
      // Lưu orderId để dùng khi thanh toán
      if (result.orderId) {
        localStorage.setItem("currentOrderId", result.orderId);
      }
      return result;
    } else {
      const errorText = await response.text();
      console.error("--> ❌ Lỗi sync:", errorText);
    }
  } catch (error) {
    console.error("--> ❌ Không thể kết nối server:", error);
  }
  return null;
}

async function checkoutOrder() {
  const userId = getCurrentUserId();
  const orderId = localStorage.getItem("currentOrderId");
  const customerInfo = getCustomerInfo();

  console.log("--> Đang thanh toán đơn hàng...");

  try {
    const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        orderId: orderId,
        shippingFee: 15000,
        ...customerInfo,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("--> ✅ Thanh toán thành công!", result);
      // Xóa currentOrderId sau khi thanh toán
      localStorage.removeItem("currentOrderId");
      return result;
    } else {
      const errorText = await response.text();
      console.error("--> ❌ Lỗi thanh toán:", errorText);
    }
  } catch (error) {
    console.error("--> ❌ Không thể kết nối server:", error);
  }
  return null;
}

async function addToCartAndSync(id, name, price, originalPrice, image) {
  // 1. Làm sạch ảnh
  let cleanImage = "no-image.png";
  if (image) {
    if (image.startsWith("http")) {
      cleanImage = image;
    } else if (image.startsWith("data:")) {
      cleanImage = "no-image.png";
    } else {
      cleanImage = image.replace(/^.*[\\\/]/, "");
    }
  }

  // 2. Thêm vào localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id == id);

  if (existing) {
    existing.quantity += 1;
    existing.price = price;
    existing.originalPrice = originalPrice;
    existing.image = cleanImage;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      originalPrice: originalPrice,
      image: cleanImage,
      quantity: 1,
      note: "",
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // 3. Cập nhật badge
  updateCartBadgeGlobal();

  // 4. Sync lên MongoDB (chạy async, không block UI)
  syncCartToMongoDB();

  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

function updateCartBadgeGlobal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document
    .querySelectorAll(".cart-count")
    .forEach((b) => (b.innerText = total));
}

window.syncCartToMongoDB = syncCartToMongoDB;
window.checkoutOrder = checkoutOrder;
window.addToCartAndSync = addToCartAndSync;
window.getCurrentUserId = getCurrentUserId;

document.addEventListener("DOMContentLoaded", async function () {
  const statusMsg = document.getElementById("status-msg");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    statusMsg.innerText = "Đơn hàng đã được ghi nhận hoặc giỏ hàng trống.";
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
    return;
  }

  let subTotal = 0;
  const orderItems = cart.map((item) => {
    let rawPrice =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/\./g, "").replace(/[^\d]/g, ""))
        : item.price;
    subTotal += rawPrice * item.quantity;
    return {
      productName: item.name,
      quantity: item.quantity,
      price: rawPrice,
      image: item.image,
    };
  });

  const orderData = {
    customerName: "Khách Thanh Toán QR",
    customerAddress: "Thanh toán qua PayOS",
    shippingFee: 15000,
    totalAmount: subTotal + 15000,
    status: 1,
    items: orderItems,
  };

  try {
    const response = await fetch("http://localhost:8080/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      console.log("Lưu MongoDB thành công!");
      localStorage.removeItem("cart");
      statusMsg.style.color = "green";
      statusMsg.innerText = "✅ Đã lưu đơn hàng! Đang quay về trang chủ...";

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
    } else {
      const errorData = await response.json();
      statusMsg.innerText =
        "❌ Lỗi lưu đơn: " + (errorData.message || "Server error");
    }
  } catch (error) {
    console.error("Lỗi Fetch:", error);
    statusMsg.innerText = "❌ Lỗi kết nối Server!";
  }
});

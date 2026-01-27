document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);

  // Kiểm tra nếu URL có tham số payment=success
  if (urlParams.get("payment") === "success") {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length > 0) {
      // Chuẩn bị dữ liệu
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

      // Lưu vào MongoDB
      try {
        // Link API backend (đảm bảo backend đang chạy)
        await fetch("http://localhost:8080/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
        console.log("✅ Đã lưu vào MongoDB");
      } catch (error) {
        console.error("❌ Lỗi lưu đơn hàng:", error);
      }
    }

    // --- XÓA GIỎ HÀNG ---
    localStorage.removeItem("cart");

    alert("Thanh toán thành công! Giỏ hàng đã được làm trống.");

    // Xóa tham số trên URL để nhìn cho sạch
    window.history.replaceState({}, document.title, window.location.pathname);

    // Load lại trang để cập nhật giao diện (số giỏ hàng về 0)
    location.reload();
  }
});

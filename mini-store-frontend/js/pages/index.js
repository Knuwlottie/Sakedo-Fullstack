document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("payment") === "success") {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length > 0) {
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

    localStorage.removeItem("cart");
    alert("Thanh toán thành công! Giỏ hàng đã được làm trống.");
    window.history.replaceState({}, document.title, window.location.pathname);
    location.reload();
  }
});

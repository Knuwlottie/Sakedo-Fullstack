document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm");

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const date = document.getElementById("date").value;
      const time = document.getElementById("time").value;
      const quantity = parseInt(document.getElementById("quantity").value);
      const note = document.getElementById("note")
        ? document.getElementById("note").value
        : "";

      if (!date || !time) {
        alert("Vui lòng chọn ngày giờ!");
        return;
      }
      if (quantity <= 0 || quantity > 50) {
        alert("Số lượng khách không hợp lệ!");
        return;
      }

      const bookingDateISO = `${date}T${time}:00`;

      // Xử lý User ID an toàn
      let userId = null;
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.id) userId = user.id;
      } catch (err) {}

      const bookingData = {
        userId: userId, // Backend chấp nhận null
        fullName: name,
        phone: phone,
        guestCount: quantity,
        bookingDate: bookingDateISO,
        status: "PENDING",
        note: note,
      };

      console.log("Đang gửi Booking:", bookingData);

      try {
        const response = await fetch(
          "http://localhost:8080/api/bookings/create",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
          },
        );

        // Kiểm tra nếu response không phải JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server trả về lỗi không phải JSON (Có thể lỗi 500)");
        }

        const result = await response.json();

        if (response.ok) {
          alert(
            `✅ ĐẶT BÀN THÀNH CÔNG!\nSố bàn: ${result.tableNumber || "Đang xếp"}\nThời gian: ${time} ngày ${date}`,
          );
          window.location.reload();
        } else {
          alert("❌ Lỗi: " + (result.message || "Không thể đặt bàn lúc này."));
        }
      } catch (err) {
        console.error("Kết nối thất bại:", err);
        alert("❌ Lỗi kết nối Server! Vui lòng kiểm tra lại Console.");
      }
    });
  }
});

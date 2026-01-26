document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm");

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 🔥 CHẶN KHÁCH: Kiểm tra quyền trước
      if (typeof window.checkLoginRequired === "function") {
        if (!window.checkLoginRequired()) return;
      }

      // 1. Lấy dữ liệu form
      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const date = document.getElementById("date").value;
      const time = document.getElementById("time").value;
      const quantity = parseInt(document.getElementById("quantity").value);
      const note = document.getElementById("note").value;

      // Kiểm tra dữ liệu đầu vào
      if (!date || !time) {
        alert("Vui lòng chọn đầy đủ ngày và giờ đặt bàn!");
        return;
      }

      // Kiểm tra quy định số lượng khách
      if (quantity > 20) {
        alert(
          "Sakedo chỉ phục vụ tối đa 20 khách mỗi bàn. Vui lòng liên hệ hotline để đặt tiệc lớn hơn!",
        );
        return;
      }
      if (quantity <= 0) {
        alert("Số lượng khách không hợp lệ!");
        return;
      }

      // 2. Chuẩn bị dữ liệu gửi Backend
      const bookingDateISO = `${date}T${time}:00`;
      const user = JSON.parse(localStorage.getItem("user")); // Chắc chắn có user vì đã check ở trên

      const bookingData = {
        userId: user.id,
        fullName: name,
        phone: phone,
        guestCount: quantity,
        bookingDate: bookingDateISO,
        status: "PENDING",
      };

      // 3. Gọi API
      try {
        const response = await fetch(
          "http://localhost:8080/api/bookings/create",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
          },
        );

        const result = await response.json();

        if (response.ok) {
          alert(`ĐẶT BÀN THÀNH CÔNG!
- Số bàn: ${result.tableNumber}
- Thời gian giữ bàn: 3 tiếng`);
          window.location.reload();
        } else {
          alert(
            "Thông báo: " +
              (result.message ||
                "Hiện tại đã hết bàn phù hợp trong khung giờ này!"),
          );
        }
      } catch (err) {
        console.error("Lỗi:", err);
        alert("Lỗi kết nối đến máy chủ!");
      }
    });
  }
});

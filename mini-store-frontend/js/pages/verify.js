document.addEventListener("DOMContentLoaded", function () {
  // Lấy đúng ID nút bấm như trong HTML của bạn
  const btnVerify = document.getElementById("btn-verify-otp");

  if (btnVerify) {
    btnVerify.addEventListener("click", function (e) {
      e.preventDefault(); // Chặn hành vi mặc định (nếu có)

      // 1. Lấy giá trị từ ô nhập liệu (ID: otp-input)
      const otpInput = document.getElementById("otp-input");
      const otpValue = otpInput.value.trim(); // Xóa khoảng trắng thừa

      // 2. Lấy Email đã lưu ở bước trước (trong localStorage)
      const email = localStorage.getItem("resetEmail");

      // --- KIỂM TRA LỖI TRƯỚC KHI GỬI ---

      // Nếu chưa nhập đủ 6 số
      if (!otpValue || otpValue.length < 6) {
        alert("Vui lòng nhập đầy đủ mã OTP 6 số!");
        otpInput.focus();
        return;
      }

      // Nếu không tìm thấy email (do người dùng vào thẳng trang này mà không qua bước quên mật khẩu)
      if (!email) {
        alert("Lỗi: Không tìm thấy email. Vui lòng quay lại bước nhập email.");
        window.location.href = "forgot-password.html";
        return;
      }

      // 3. HIỆU ỨNG NÚT BẤM (Để người dùng biết đang xử lý)
      const originalText = btnVerify.innerText;
      btnVerify.innerText = "Đang kiểm tra...";
      btnVerify.disabled = true; // Khóa nút lại để không bấm liên tục

      // 4. GỌI API BACKEND
      fetch("http://localhost:8080/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          otp: otpValue,
        }),
      })
        .then((response) => {
          // Nếu Backend trả về OK (200)
          if (response.ok) {
            return response.json();
          } else {
            // Nếu Backend báo lỗi (400, 500)
            return response.json().then((errorData) => {
              throw new Error(errorData.message || "Mã OTP không đúng!");
            });
          }
        })
        .then((data) => {
          // --- THÀNH CÔNG ---
          alert("Xác thực thành công!");
          window.location.href = "reset-password.html"; // Chuyển sang trang đặt lại mật khẩu
        })
        .catch((error) => {
          // --- THẤT BẠI ---
          alert("Lỗi: " + error.message);

          // Mở lại nút để bấm lại
          btnVerify.innerText = originalText;
          btnVerify.disabled = false;
        });
    });
  } else {
    console.error("Lỗi: Không tìm thấy nút xác nhận (ID: btn-verify-otp)");
  }
});

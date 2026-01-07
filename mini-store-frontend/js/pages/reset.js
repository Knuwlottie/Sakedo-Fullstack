document.addEventListener("DOMContentLoaded", function () {
  // 1. Lấy đúng cái nút theo ID trong HTML bạn gửi
  const btnReset = document.getElementById("btn-reset-pass");

  if (btnReset) {
    btnReset.addEventListener("click", function (e) {
      e.preventDefault();

      // 2. Lấy giá trị 2 ô mật khẩu
      const newPassInput = document.getElementById("new-password");
      const confirmPassInput = document.getElementById("confirm-password");

      const newPass = newPassInput.value.trim();
      const confirmPass = confirmPassInput.value.trim();

      // 3. Lấy email đang lưu tạm từ các bước trước
      const email = localStorage.getItem("resetEmail");

      // --- KIỂM TRA DỮ LIỆU ---
      if (!newPass || !confirmPass) {
        alert("Vui lòng nhập đầy đủ mật khẩu!");
        return;
      }

      if (newPass !== confirmPass) {
        alert("Hai mật khẩu không khớp nhau! Vui lòng nhập lại.");
        confirmPassInput.value = ""; // Xóa ô xác nhận để nhập lại
        confirmPassInput.focus();
        return;
      }

      if (!email) {
        alert(
          "Lỗi phiên làm việc (mất email). Vui lòng thực hiện lại quy trình Quên mật khẩu."
        );
        window.location.href = "forgot-password.html";
        return;
      }

      // --- HIỆU ỨNG NÚT BẤM ---
      const originalText = btnReset.innerText;
      btnReset.innerText = "Đang xử lý...";
      btnReset.disabled = true;

      // --- GỌI API ---
      fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          newPassword: newPass,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then((err) => {
              throw new Error(err.message);
            });
          }
        })
        .then((data) => {
          // THÀNH CÔNG
          alert(
            "Đổi mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới."
          );

          // Xóa email tạm để bảo mật
          localStorage.removeItem("resetEmail");

          // Chuyển về trang đăng nhập
          window.location.href = "auth.html";
        })
        .catch((error) => {
          // THẤT BẠI
          alert("Lỗi: " + error.message);

          // Mở lại nút
          btnReset.innerText = originalText;
          btnReset.disabled = false;
        });
    });
  } else {
    console.error("Không tìm thấy nút đổi mật khẩu (ID: btn-reset-pass)");
  }
});

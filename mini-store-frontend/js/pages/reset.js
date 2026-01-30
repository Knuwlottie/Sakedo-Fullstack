document.addEventListener("DOMContentLoaded", function () {
  const btnReset = document.getElementById("btn-reset-pass");

  if (btnReset) {
    btnReset.addEventListener("click", function (e) {
      e.preventDefault();

      const newPassInput = document.getElementById("new-password");
      const confirmPassInput = document.getElementById("confirm-password");

      const newPass = newPassInput.value.trim();
      const confirmPass = confirmPassInput.value.trim();
      const email = localStorage.getItem("resetEmail");

      if (!newPass || !confirmPass) {
        alert("Vui lòng nhập đầy đủ mật khẩu!");
        return;
      }

      if (newPass !== confirmPass) {
        alert("Hai mật khẩu không khớp nhau! Vui lòng nhập lại.");
        confirmPassInput.value = "";
        confirmPassInput.focus();
        return;
      }

      if (!email) {
        alert(
          "Lỗi phiên làm việc (mất email). Vui lòng thực hiện lại quy trình Quên mật khẩu.",
        );
        window.location.href = "forgot-password.html";
        return;
      }

      const originalText = btnReset.innerText;
      btnReset.innerText = "Đang xử lý...";
      btnReset.disabled = true;

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
          alert(
            "Đổi mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới.",
          );
          localStorage.removeItem("resetEmail");
          window.location.href = "auth.html";
        })
        .catch((error) => {
          alert("Lỗi: " + error.message);
          btnReset.innerText = originalText;
          btnReset.disabled = false;
        });
    });
  } else {
    console.error("Không tìm thấy nút đổi mật khẩu (ID: btn-reset-pass)");
  }
});

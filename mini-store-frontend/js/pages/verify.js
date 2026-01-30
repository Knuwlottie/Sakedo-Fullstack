document.addEventListener("DOMContentLoaded", function () {
  const btnVerify = document.getElementById("btn-verify-otp");

  if (btnVerify) {
    btnVerify.addEventListener("click", function (e) {
      e.preventDefault();

      const otpInput = document.getElementById("otp-input");
      const otpValue = otpInput.value.trim();
      const email = localStorage.getItem("resetEmail");

      if (!otpValue || otpValue.length < 6) {
        alert("Vui lòng nhập đầy đủ mã OTP 6 số!");
        otpInput.focus();
        return;
      }

      if (!email) {
        alert("Lỗi: Không tìm thấy email. Vui lòng quay lại bước nhập email.");
        window.location.href = "forgot-password.html";
        return;
      }

      const originalText = btnVerify.innerText;
      btnVerify.innerText = "Đang kiểm tra...";
      btnVerify.disabled = true;

      fetch("http://localhost:8080/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          otp: otpValue,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then((errorData) => {
              throw new Error(errorData.message || "Mã OTP không đúng!");
            });
          }
        })
        .then((data) => {
          alert("Xác thực thành công!");
          window.location.href = "reset-password.html";
        })
        .catch((error) => {
          alert("Lỗi: " + error.message);
          btnVerify.innerText = originalText;
          btnVerify.disabled = false;
        });
    });
  } else {
    console.error("Lỗi: Không tìm thấy nút xác nhận (ID: btn-verify-otp)");
  }
});

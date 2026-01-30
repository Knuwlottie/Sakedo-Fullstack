document.addEventListener("DOMContentLoaded", function () {
  const btnSend = document.querySelector("button");
  const emailInput = document.querySelector('input[type="email"]');

  if (btnSend) {
    btnSend.addEventListener("click", function (e) {
      e.preventDefault();
      const email = emailInput.value;

      if (!email) {
        alert("Vui lòng nhập email!");
        return;
      }

      btnSend.textContent = "Đang gửi...";
      btnSend.disabled = true;

      fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      })
        .then((res) =>
          res.ok
            ? res.json()
            : res.json().then((err) => {
                throw new Error(err.message);
              }),
        )
        .then((data) => {
          alert(data.message);
          localStorage.setItem("resetEmail", email);
          window.location.href = "verify-code.html";
        })
        .catch((err) => {
          alert(err.message);
          btnSend.textContent = "Tiếp tục";
          btnSend.disabled = false;
        });
    });
  }
});

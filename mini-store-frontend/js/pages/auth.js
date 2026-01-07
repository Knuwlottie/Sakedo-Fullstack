document.addEventListener("DOMContentLoaded", function () {
  // --- 1. XỬ LÝ CHUYỂN TAB (Đăng nhập / Đăng ký) ---
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      formLogin.style.display = "block";
      formRegister.style.display = "none";
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      formRegister.style.display = "block";
      formLogin.style.display = "none";
    });
  }

  // --- 2. XỬ LÝ ĐĂNG NHẬP (QUAN TRỌNG) ---
  if (formLogin) {
    formLogin.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const btnSubmit = formLogin.querySelector(".btn-submit");

      // Hiệu ứng nút bấm
      const originalText = btnSubmit.innerText;
      btnSubmit.innerText = "Đang xử lý...";
      btnSubmit.disabled = true;

      fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      })
        .then((res) => {
          if (res.ok) return res.json();
          return res.json().then((err) => {
            throw new Error(err.message);
          });
        })
        .then((user) => {
          alert("Đăng nhập thành công!");

          localStorage.setItem("user", JSON.stringify(user));
          window.location.href = "../index.html";
        })
        .catch((err) => {
          alert("Lỗi: " + err.message);
          btnSubmit.innerText = originalText;
          btnSubmit.disabled = false;
        });
    });
  }

  // --- 3. XỬ LÝ ĐĂNG KÝ ---
  if (formRegister) {
    formRegister.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("reg-name").value;
      const phone = document.getElementById("reg-phone").value;
      const email = document.getElementById("reg-email").value;
      const password = document.getElementById("reg-password").value;

      const btnSubmit = formRegister.querySelector(".btn-submit");
      const originalText = btnSubmit.innerText;
      btnSubmit.innerText = "Đang đăng ký...";
      btnSubmit.disabled = true;

      fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          phone: phone,
          email: email,
          password: password,
        }),
      })
        .then((res) => {
          if (res.ok) return res.json();
          return res.json().then((err) => {
            throw new Error(err.message);
          });
        })
        .then((data) => {
          alert("Đăng ký thành công! Vui lòng đăng nhập.");
          // Chuyển sang tab đăng nhập
          tabLogin.click();
          btnSubmit.innerText = originalText;
          btnSubmit.disabled = false;
        })
        .catch((err) => {
          alert("Lỗi: " + err.message);
          btnSubmit.innerText = originalText;
          btnSubmit.disabled = false;
        });
    });
  }
});

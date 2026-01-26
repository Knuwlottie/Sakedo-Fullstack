document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "http://localhost:8080/api";
  const GOOGLE_CLIENT_ID =
    "179543967912-51nveu64umt0ati2fic7onhnlopaba2p.apps.googleusercontent.com";

  // ============================================================
  // 1. CẤU HÌNH GOOGLE LOGIN
  // ============================================================
  let tokenClient;

  // Khởi tạo Google Token Client
  function initGoogleClient() {
    if (typeof google !== "undefined" && google.accounts) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope:
          "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            await handleGoogleResponse(tokenResponse.access_token);
          }
        },
      });
    }
  }

  // Xử lý thông tin trả về từ Google
  async function handleGoogleResponse(accessToken) {
    try {
      const googleRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const googleUser = await googleRes.json();

      // Check email với Backend
      checkEmailInDatabase(googleUser.email, googleUser);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lấy thông tin từ Google.");
    }
  }

  // Kiểm tra Email trong Database
  async function checkEmailInDatabase(email, googleInfo) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/email/${email}`);

      if (response.ok) {
        // Có tài khoản -> Đăng nhập
        const userData = await response.json();
        userData.loginType = "google";

        localStorage.setItem("user", JSON.stringify(userData));
        alert(`Đăng nhập thành công! Xin chào ${userData.name}.`);
        window.location.href = "../index.html";
      } else {
        // Chưa có tài khoản -> Gợi ý đăng ký
        if (
          confirm(
            `Email ${email} chưa đăng ký. Bạn có muốn đăng ký ngay không?`,
          )
        ) {
          document.getElementById("tab-register").click();
          document.getElementById("reg-email").value = email;
          document.getElementById("reg-name").value = googleInfo.name;
        }
      }
    } catch (error) {
      alert("Lỗi kết nối Server!");
    }
  }

  // Chờ thư viện Google load xong
  setTimeout(initGoogleClient, 500);

  // ============================================================
  // 2. XỬ LÝ SỰ KIỆN CLICK (GOOGLE & GUEST)
  // ============================================================

  // Nút Google
  const btnGoogle = document.getElementById("btn-google-check");
  if (btnGoogle) {
    btnGoogle.addEventListener("click", function () {
      if (tokenClient) {
        tokenClient.requestAccessToken();
      } else {
        alert("Google chưa sẵn sàng. Vui lòng tải lại trang.");
      }
    });
  }

  // Nút Khách (Guest)
  const btnGuest = document.getElementById("btn-guest-mode");
  if (btnGuest) {
    btnGuest.addEventListener("click", function () {
      if (
        !confirm("Vào xem với tư cách Khách (Không mua hàng được). Tiếp tục?")
      )
        return;

      const guestUser = {
        id: "guest_" + Date.now(),
        name: "Khách Tham Quan",
        role: "guest",
        loginType: "anonymous",
        avatar: "../assets/images/logo.png",
      };

      localStorage.setItem("user", JSON.stringify(guestUser));
      window.location.href = "../index.html";
    });
  }

  // ============================================================
  // 3. LOGIC TAB & FORM LOGIN/REGISTER
  // ============================================================
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");

  // Chuyển Tab
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

  // Xử lý Login Submit
  if (formLogin) {
    formLogin.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const btnSubmit = formLogin.querySelector(".btn-submit");
      const originalText = btnSubmit.innerText;

      try {
        btnSubmit.innerText = "Đang xử lý...";
        btnSubmit.disabled = true;

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Đăng nhập thất bại");

        alert("Đăng nhập thành công!");
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "../index.html";
      } catch (err) {
        alert("Lỗi: " + err.message);
      } finally {
        btnSubmit.innerText = originalText;
        btnSubmit.disabled = false;
      }
    });
  }

  // Xử lý Register Submit
  if (formRegister) {
    formRegister.addEventListener("submit", async function (e) {
      e.preventDefault();
      const name = document.getElementById("reg-name").value;
      const phone = document.getElementById("reg-phone").value;
      const email = document.getElementById("reg-email").value;
      const password = document.getElementById("reg-password").value;
      const btnSubmit = formRegister.querySelector(".btn-submit");
      const originalText = btnSubmit.innerText;

      try {
        btnSubmit.innerText = "Đang đăng ký...";
        btnSubmit.disabled = true;

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, password }),
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Đăng ký thất bại");

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        if (tabLogin) tabLogin.click();
      } catch (err) {
        alert("Lỗi: " + err.message);
      } finally {
        btnSubmit.innerText = originalText;
        btnSubmit.disabled = false;
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("🟢 Contact Page Loaded");

  // Khởi chạy các chức năng
  autoFillUserInfo();
  setupCharCounter();
  setupFormSubmit();
});

// ============================================================
// 1. TỰ ĐỘNG ĐIỀN THÔNG TIN (NẾU ĐÃ ĐĂNG NHẬP)
// ============================================================
function autoFillUserInfo() {
  const localUser = JSON.parse(localStorage.getItem("user"));

  if (localUser) {
    const displayName = localUser.name || localUser.fullName || "";

    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const phoneInput = document.getElementById("contact-phone");

    if (nameInput) nameInput.value = displayName;

    if (emailInput) {
      emailInput.value = localUser.email || "";
      // Làm mờ ô email để tránh sửa nhầm (UX tốt hơn)
      if (localUser.email) {
        emailInput.setAttribute("readonly", true);
        emailInput.style.backgroundColor = "#f9f9f9";
        emailInput.style.cursor = "not-allowed";
      }
    }

    if (phoneInput) phoneInput.value = localUser.phone || "";
  }
}

// ============================================================
// 2. BỘ ĐẾM KÝ TỰ CHO Ô NỘI DUNG
// ============================================================
function setupCharCounter() {
  const textarea = document.getElementById("contact-message");
  const counter = document.getElementById("char-count");
  const maxLength = 1000;

  if (textarea && counter) {
    textarea.addEventListener("input", function () {
      const currentLength = this.value.length;
      counter.textContent = `${currentLength}/${maxLength} ký tự`;

      if (currentLength >= maxLength) {
        counter.style.color = "#d32f2f"; // Màu đỏ cảnh báo
      } else {
        counter.style.color = "#888"; // Màu xám bình thường
      }
    });
  }
}

// ============================================================
// 3. XỬ LÝ GỬI FORM (GỌI API BACKEND)
// ============================================================
function setupFormSubmit() {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("btn-submit-contact");

  if (!form) {
    console.error(
      "🔴 LỖI: Không tìm thấy <form id='contact-form'>. Vui lòng kiểm tra file HTML!",
    );
    return;
  }

  form.addEventListener("submit", async function (e) {
    // QUAN TRỌNG: Chặn hành vi reload trang mặc định
    e.preventDefault();

    // 🔥 CHẶN QUYỀN KHÁCH (MỚI THÊM)
    if (typeof window.checkLoginRequired === "function") {
      if (!window.checkLoginRequired()) return;
    } else {
      // Fallback nếu hàm check chưa load kịp
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === "guest") {
        if (
          confirm(
            "Chức năng gửi liên hệ chỉ dành cho thành viên. Bạn có muốn đăng ký không?",
          )
        ) {
          localStorage.removeItem("user");
          window.location.href = "auth.html";
        }
        return;
      }
    }

    // 1. Thu thập dữ liệu từ các ô input
    const formData = {
      name: document.getElementById("contact-name").value,
      email: document.getElementById("contact-email").value,
      phone: document.getElementById("contact-phone").value,
      topic: document.getElementById("contact-topic").value,
      message: document.getElementById("contact-message").value,
    };

    console.log("📦 Đang gửi dữ liệu:", formData);

    // 2. Hiệu ứng nút bấm (UX)
    const originalBtnText = submitBtn.innerHTML;
    if (submitBtn) {
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";
    }

    try {
      // 3. Gọi API về Backend (Java Spring Boot)
      const response = await fetch("http://localhost:8080/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // 4. Xử lý kết quả trả về
      if (response.ok) {
        // Thành công
        alert(
          `✅ Cảm ơn ${formData.name}! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.`,
        );

        // Reset form về trắng
        form.reset();
        document.getElementById("char-count").textContent = "0/1000 ký tự";

        // Điền lại thông tin user (nếu đang đăng nhập)
        autoFillUserInfo();
      } else {
        // Thất bại (Lỗi Server)
        alert("❌ Có lỗi xảy ra. Vui lòng thử lại sau!");
        console.error("Server Error:", response.status);
      }
    } catch (error) {
      // Lỗi mạng hoặc Server chưa bật
      console.error("🔴 Lỗi kết nối:", error);
      alert(
        "⚠️ Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!",
      );
    } finally {
      // 5. Trả nút bấm về trạng thái ban đầu (dù thành công hay thất bại)
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      }
    }
  });
}

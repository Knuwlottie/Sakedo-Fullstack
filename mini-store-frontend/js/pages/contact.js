document.addEventListener("DOMContentLoaded", function () {
  console.log("🟢 Contact Page Loaded");
  autoFillUserInfo();
  setupCharCounter();
  setupFormSubmit();
});

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
      if (localUser.email) {
        emailInput.setAttribute("readonly", true);
        emailInput.classList.add("email-readonly");
      }
    }

    if (phoneInput) phoneInput.value = localUser.phone || "";
  }
}

function setupCharCounter() {
  const textarea = document.getElementById("contact-message");
  const counter = document.getElementById("char-count");
  const maxLength = 1000;

  if (textarea && counter) {
    textarea.addEventListener("input", function () {
      const currentLength = this.value.length;
      counter.textContent = `${currentLength}/${maxLength} ký tự`;

      if (currentLength >= maxLength) {
        counter.classList.remove("char-count-normal");
        counter.classList.add("char-count-warning");
      } else {
        counter.classList.remove("char-count-warning");
        counter.classList.add("char-count-normal");
      }
    });
  }
}

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
    e.preventDefault();

    const formData = {
      name: document.getElementById("contact-name").value,
      email: document.getElementById("contact-email").value,
      phone: document.getElementById("contact-phone").value,
      topic: document.getElementById("contact-topic").value,
      message: document.getElementById("contact-message").value,
    };

    console.log("📦 Đang gửi dữ liệu:", formData);

    const originalBtnText = submitBtn.innerHTML;
    if (submitBtn) {
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";
    }

    try {
      const response = await fetch("http://localhost:8080/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(
          `✅ Cảm ơn ${formData.name}! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.`,
        );
        form.reset();
        document.getElementById("char-count").textContent = "0/1000 ký tự";
        autoFillUserInfo();
      } else {
        alert("❌ Có lỗi xảy ra. Vui lòng thử lại sau!");
        console.error("Server Error:", response.status);
      }
    } catch (error) {
      console.error("🔴 Lỗi kết nối:", error);
      alert(
        "⚠️ Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!",
      );
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderHeader();
});

// Gán vào window để các file khác (như profile.js) có thể gọi lại nếu cần
window.renderHeader = function () {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (!headerPlaceholder) return;

  // 1. XỬ LÝ ĐƯỜNG DẪN (Để không bị lỗi ảnh khi ở trang con)
  const isPagesFolder = window.location.pathname.includes("/pages/");
  const assetRoot = isPagesFolder ? "../" : "./";

  // 2. LẤY USER TỪ LOCALSTORAGE (Nhanh hơn gọi API)
  const user = JSON.parse(localStorage.getItem("user"));

  // 3. XÁC ĐỊNH NỘI DUNG BÊN PHẢI (Login hay chưa)
  let rightContentHtml = "";

  if (user) {
    // --- ĐÃ ĐĂNG NHẬP ---
    let displayName = user.name || user.fullName || "Member";
    if (user.role === "guest") displayName = "Khách";

    // Xử lý Avatar
    let avatarSrc = user.avatar || "";
    if (!avatarSrc.startsWith("http") && !avatarSrc.includes("data:")) {
      // Nếu là tên file ảnh trong thư mục
      avatarSrc = `${assetRoot}assets/images/${avatarSrc}`;
    }
    // Nếu không có avatar -> dùng logo mặc định
    if (!avatarSrc) avatarSrc = `${assetRoot}assets/images/logo.png`;

    rightContentHtml = `
            <a href="cart.html" class="cart-btn">
                <i class="fas fa-shopping-basket"></i>
                <span class="cart-count">0</span>
            </a>
            
            <div class="user-dropdown" onclick="window.location.href='profile.html'" title="Vào trang cá nhân">
                <div class="user-avatar">
                     <img src="${avatarSrc}" onerror="this.src='${assetRoot}assets/images/logo.png'">
                </div>
                <span class="user-name">${getShortName(displayName)}</span>
                <i class="fas fa-sign-out-alt btn-logout" onclick="event.stopPropagation(); handleLogout()" title="Đăng xuất"></i>
            </div>
        `;
  } else {
    // --- CHƯA ĐĂNG NHẬP ---
    rightContentHtml = `
            <a href="cart.html" class="cart-btn">
                <i class="fas fa-shopping-basket"></i>
                <span class="cart-count">0</span>
            </a>
            <a href="auth.html" class="btn-primary">ĐĂNG NHẬP</a>
        `;
  }

  // 4. RENDER HTML (Giữ cấu trúc chuẩn class CSS)
  headerPlaceholder.innerHTML = `
        <header class="header">
            <div class="container header-inner">
                <a href="global.html" class="logo">
                    <img src="${assetRoot}assets/images/logo.png" alt="Sakedo Logo">
                </a>

                <ul class="nav-list">
                    <li><a href="global.html" class="nav-link" data-page="global.html">Trang Chủ</a></li>
                    <li><a href="menu.html" class="nav-link" data-page="menu.html">Thực Đơn</a></li>
                    <li><a href="booking.html" class="nav-link" data-page="booking.html">Đặt Bàn</a></li>
                    <li><a href="contact.html" class="nav-link" data-page="contact.html">Liên Hệ</a></li>
                    <li><a href="profile.html" class="nav-link" data-page="profile.html">Cá Nhân</a></li>
                </ul>

                <div class="header-actions">
                    ${rightContentHtml}
                </div>
            </div>
        </header>
    `;

  // 5. CHẠY CÁC HÀM PHỤ TRỢ
  highlightActiveMenu();
  if (typeof window.updateCartBadge === "function") {
    window.updateCartBadge();
  }
};

// --- CÁC HÀM HỖ TRỢ ---

function highlightActiveMenu() {
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (
      link.getAttribute("href") === currentPage ||
      link.getAttribute("data-page") === currentPage
    ) {
      link.classList.add("active");
    }
  });
}

function getShortName(fullName) {
  if (!fullName) return "U";
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1]; // Lấy tên cuối cùng
}

window.handleLogout = function () {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "auth.html";
  }
};

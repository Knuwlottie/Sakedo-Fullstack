document.addEventListener("DOMContentLoaded", function () {
  loadHeader();
});

function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (!headerPlaceholder) return;

  // VÌ TẤT CẢ FILE HTML GIỜ ĐỀU NẰM TRONG FOLDER /pages/
  // NÊN ĐƯỜNG DẪN LÀ CỐ ĐỊNH, KHÔNG CẦN TÍNH TOÁN NỮA.

  headerPlaceholder.innerHTML = `
    <header class="header">
      <div class="container header-inner">
        <a href="global.html" class="logo">
          <img src="../assets/images/logo.png" alt="Sakedo Logo" />
        </a>
        
        <nav class="navbar">
          <ul class="nav-list">
            <li><a href="global.html" class="nav-link">Trang Chủ</a></li>
            <li><a href="menu.html" class="nav-link">Thực Đơn</a></li>
            <li><a href="booking.html" class="nav-link">Đặt Bàn</a></li>
            <li><a href="contact.html" class="nav-link">Liên Hệ</a></li>
            <li><a href="profile.html" class="nav-link">Cá Nhân</a></li>
          </ul>
        </nav>

        <div class="header-actions" id="header-user-area">
            <a href="cart.html" class="cart-btn">
                <i class="fas fa-shopping-basket"></i>
                <span class="cart-count">0</span>
            </a>
            <a href="auth.html" class="btn btn-primary" style="background-color: var(--primary-color); color: #fff !important;">
                Đăng Nhập
            </a>
        </div>
      </div>
    </header>
  `;

  highlightActiveMenu();
  updateLoginState();
  updateCartBadge();
}

function updateLoginState() {
  const userArea = document.getElementById("header-user-area");
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && userArea) {
    // Xử lý ảnh: Nếu không có thì lấy ảnh mặc định (lùi ra 1 cấp ..)
    let avatarUrl = user.avatar ? user.avatar : "../assets/images/avata1.png";

    // Nếu ảnh lưu trong DB có dạng "assets/...", ta thêm "../" vào trước để nó lùi ra khỏi folder pages
    if (!avatarUrl.startsWith("http") && !avatarUrl.startsWith("../")) {
      // Xóa dấu / hoặc ./ ở đầu nếu có
      avatarUrl = "../" + avatarUrl.replace(/^(\.\/|\/)/, "");
    }

    const userName = user.fullName || user.name || "Khách hàng";

    userArea.innerHTML = `
        <a href="cart.html" class="cart-btn">
            <i class="fas fa-shopping-basket"></i>
            <span class="cart-count">0</span>
        </a>
        
        <div class="user-dropdown" style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-left: 15px;" onclick="window.location.href='profile.html'">
            <img src="${avatarUrl}" alt="User" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #d8b26e;">
            <span style="font-weight: 600; color: #333; font-size: 0.9rem;">${userName}</span>
        </div>
        
        <button onclick="handleLogout()" style="margin-left: 15px; background: none; border: none; color: #d32f2f; cursor: pointer; font-size: 1.2rem;" title="Đăng xuất">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
  }
}

function highlightActiveMenu() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    // So sánh tên file
    if (currentPath.includes(href)) {
      link.classList.add("active");
    }
  });
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach((b) => (b.innerText = total));
}

window.handleLogout = function () {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  }
};

document.addEventListener("DOMContentLoaded", function () {
  loadHeader();
});

async function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (!headerPlaceholder) return;

  const assetRoot = "../";

  headerPlaceholder.innerHTML = `
    <header class="header">
      <div class="container header-inner">
        <a href="global.html" class="logo">
          <img src="${assetRoot}assets/images/logo.png" alt="Sakedo Logo" />
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
                <i class="fas fa-shopping-basket"></i><span class="cart-count">0</span>
            </a>
            <a href="auth.html" class="btn btn-primary btn-login-primary">Đăng Nhập</a>
        </div>
      </div>
    </header>
  `;

  highlightActiveMenu();
  await updateLoginState(assetRoot);
  updateCartBadge();
}

async function updateLoginState(assetRoot) {
  const userArea = document.getElementById("header-user-area");
  let localUser = JSON.parse(localStorage.getItem("user"));

  if (localUser && localUser.email && userArea) {
    let currentUser = localUser;

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/email/${localUser.email}`,
      );
      if (response.ok) {
        const apiUser = await response.json();
        currentUser = {
          ...apiUser,
          avatar: apiUser.avatar || localUser.avatar,
        };
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } catch (error) {
      console.warn("Server offline, dùng dữ liệu cũ.");
    }

    let displayName = currentUser.name || currentUser.fullName;

    if (!displayName || displayName.trim() === "") {
      if (currentUser.email) {
        displayName = currentUser.email.split("@")[0];
      } else {
        displayName = "Khách hàng";
      }
    }

    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName,
    )}&background=d8b26e&color=fff&size=128&bold=true`;
    let finalAvatarUrl = defaultAvatarUrl;

    if (currentUser.avatar && currentUser.avatar.trim() !== "") {
      if (
        currentUser.avatar.startsWith("http") ||
        currentUser.avatar.startsWith("data:")
      ) {
        finalAvatarUrl = currentUser.avatar;
      } else {
        const cleanPath = currentUser.avatar.replace(
          /^(\.\/|\/|assets\/images\/)/,
          "",
        );
        finalAvatarUrl = `${assetRoot}assets/images/${cleanPath}`;
      }
    }

    userArea.innerHTML = `
        <a href="cart.html" class="cart-btn cart-btn-clean">
            <i class="fas fa-shopping-basket"></i>
            <span class="cart-count">0</span>
        </a>
        
        <div class="user-dropdown user-dropdown-container" onclick="window.location.href='profile.html'">
            <img src="${finalAvatarUrl}" 
                 alt="${displayName}" 
                 class="user-avatar-img"
                 onerror="this.src='${defaultAvatarUrl}'"
            >
            <span class="user-display-name">${displayName}</span>
        </div>
        
        <button onclick="handleLogout()" class="btn-logout-icon" title="Đăng xuất">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
  }
}

function highlightActiveMenu() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (currentPath.includes(link.getAttribute("href")))
      link.classList.add("active");
  });
}

function updateCartBadge() {
  const isBuyNowMode = localStorage.getItem("buyNowMode") === "true";
  let cart;

  if (isBuyNowMode) {
    cart = JSON.parse(localStorage.getItem("cart_backup")) || [];
  } else {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }

  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document
    .querySelectorAll(".cart-count")
    .forEach((b) => (b.innerText = total));
}

window.handleLogout = function () {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  }
};

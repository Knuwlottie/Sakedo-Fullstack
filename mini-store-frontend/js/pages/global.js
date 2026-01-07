document.addEventListener("DOMContentLoaded", function () {
  console.log("--> Global Page JS đã tải: Auth + API + Cart Logic.");

  // ==================================================================
  // 1. LOGIC AUTH: KIỂM TRA ĐĂNG NHẬP & HIỂN THỊ HEADER
  // ==================================================================
  function checkLoginStatus() {
    const userJson = localStorage.getItem("user");
    const headerActions = document.querySelector(".header-actions");

    // Nếu không tìm thấy header (ở trang lạ), bỏ qua
    if (!headerActions) return;

    if (userJson) {
      // --- TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP ---
      const user = JSON.parse(userJson);
      const userName = user.name || "User";
      // Tạo avatar từ tên (dùng dịch vụ ui-avatars)
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userName
      )}&background=D4AF37&color=fff&size=128`;

      headerActions.innerHTML = `
                <a href="/pages/cart.html" class="cart-btn" style="margin-right: 15px;">
                    <i class="fas fa-shopping-basket"></i>
                    <span class="cart-count">0</span>
                </a>

                <div class="user-dropdown" style="position: relative; display: inline-block;">
                    <div onclick="toggleUserMenu()" style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <img src="${avatarUrl}" alt="Avatar" 
                             style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #D4AF37; object-fit: cover;">
                        <span style="font-weight: 500; font-size: 0.9rem; display: none; @media(min-width:768px){display:block;}">${userName}</span>
                        <i class="fas fa-caret-down" style="font-size: 12px; color: #666;"></i>
                    </div>

                    <div id="user-menu-dropdown" style="display: none; position: absolute; top: 120%; right: 0; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 10px; min-width: 180px; padding: 10px; z-index: 1000; border: 1px solid #eee;">
                        <div style="padding: 8px 10px; font-weight:bold; color:#D4AF37; border-bottom: 1px solid #eee; margin-bottom:5px;">
                            Xin chào, ${userName}
                        </div>
                        <a href="/pages/profile.html" style="display: block; padding: 8px 10px; color: #333; text-decoration: none; border-bottom: 1px solid #f0f0f0; transition: 0.2s;">
                            <i class="fas fa-user-circle"></i> Hồ sơ cá nhân
                        </a>
                        <a href="#" style="display: block; padding: 8px 10px; color: #333; text-decoration: none; border-bottom: 1px solid #f0f0f0; transition: 0.2s;">
                            <i class="fas fa-history"></i> Lịch sử đơn hàng
                        </a>
                        <a href="#" onclick="handleLogout()" style="display: block; padding: 8px 10px; color: #d32f2f; text-decoration: none; font-weight: 600; margin-top: 5px;">
                            <i class="fas fa-sign-out-alt"></i> Đăng xuất
                        </a>
                    </div>
                </div>
            `;
    } else {
      // --- TRƯỜNG HỢP CHƯA ĐĂNG NHẬP (Giữ nút Đăng nhập) ---
      // Vẫn phải hiện nút giỏ hàng nhưng count = 0
      const existingCartBtn = headerActions.querySelector(".cart-btn");
      if (!existingCartBtn) {
        // Nếu HTML gốc chưa có nút cart thì thêm vào trước nút Login
        const loginBtn = headerActions.querySelector(".btn-primary");
        const cartHtml = `
                <a href="#" class="cart-btn" style="margin-right: 15px;">
                    <i class="fas fa-shopping-basket"></i>
                    <span class="cart-count">0</span>
                </a>
             `;
        if (loginBtn) loginBtn.insertAdjacentHTML("beforebegin", cartHtml);
      }
    }

    // Cập nhật số lượng giỏ hàng ngay khi load header
    window.updateCartBadge();
  }

  // Chạy logic check login
  checkLoginStatus();

  // ==================================================================
  // 2. LOGIC TRANG CHỦ: GỌI API & RENDER SẢN PHẨM
  // ==================================================================

  async function fetchAndRenderHomeData() {
    const promoContainer = document.getElementById("promo-container");
    const mustTryContainer = document.getElementById("mustTryTrack");

    // Nếu không tìm thấy các container này (tức là không ở trang chủ), dừng lại
    if (!promoContainer && !mustTryContainer) return;

    try {
      console.log("--> Đang gọi API: http://localhost:8080/api/products");
      const response = await fetch("http://localhost:8080/api/products");

      if (!response.ok)
        throw new Error("Không thể kết nối đến Backend Spring Boot");

      const products = await response.json();
      console.log(`--> Đã tải được ${products.length} sản phẩm.`);

      // --- A. RENDER MỤC ƯU ĐÃI (Discount > 0) ---
      if (promoContainer) {
        // Lấy 4 món có giảm giá
        const promoList = products.filter((p) => p.discount > 0).slice(0, 4);
        promoContainer.innerHTML = "";

        if (promoList.length === 0) {
          promoContainer.innerHTML =
            "<p>Hiện chưa có chương trình khuyến mãi.</p>";
        } else {
          promoList.forEach((product) => {
            // Link ảnh: Nếu lỗi thì dùng ảnh placeholder
            const imgPath = `/assets/images/${product.image}`;

            // Link chi tiết sản phẩm
            const detailLink = `/pages/product-detail.html?id=${product.id}`;

            const html = `
                <div class="promo-card">
                    <a href="${detailLink}" style="display:block; width:100%; height:100%;">
                        <img src="${imgPath}" alt="${product.name}" class="promo-img" 
                             onerror="this.src='https://placehold.co/300x300?text=Sakedo'"/>
                        <div class="promo-overlay">
                            <h3 class="dish-name">${product.name}</h3>
                        </div>
                        <div class="discount-badge"><span>-${product.discount}%</span></div>
                    </a>
                </div>
            `;
            promoContainer.innerHTML += html;
          });
        }
      }

      // --- B. RENDER MỤC MÓN NGON PHẢI THỬ (Best Seller) ---
      if (mustTryContainer) {
        // Lấy 8 món Best Seller
        const bestSellerList = products
          .filter((p) => p.bestSeller === true)
          .slice(0, 8);
        mustTryContainer.innerHTML = "";

        bestSellerList.forEach((product) => {
          // Tính giá gốc giả định
          const oldPrice = product.price * (1 + (product.discount || 10) / 100);
          const detailLink = `/pages/product-detail.html?id=${product.id}`;
          const imgPath = `/assets/images/${product.image}`;

          const html = `
                <div class="food-card">
                    <div class="card-header">
                        <span class="sale-badge">HOT</span>
                        <div class="img-bg"></div>
                        <a href="${detailLink}">
                            <img src="${imgPath}" alt="${
            product.name
          }" class="food-img"
                                 onerror="this.src='https://placehold.co/200x200?text=Mon+Ngon'"/>
                        </a>
                    </div>
                    <div class="card-body">
                        <h3 class="food-title">
                            <a href="${detailLink}" style="color: inherit; text-decoration: none;">
                                ${product.name}
                            </a>
                        </h3>
                        <div class="price-row">
                            <div class="price-info">
                                <span class="old-price">${oldPrice.toLocaleString()}đ</span>
                                <span class="new-price">${product.price.toLocaleString()}đ</span>
                            </div>
                            <button class="cart-btn-small" onclick="window.location.href='${detailLink}'">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
          mustTryContainer.innerHTML += html;
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      if (promoContainer)
        promoContainer.innerHTML =
          '<p style="color:red; text-align:center">Không kết nối được Server!</p>';
    }
  }

  // Gọi hàm fetch dữ liệu ngay
  fetchAndRenderHomeData();

  // ==================================================================
  // 3. LOGIC UI TĨNH: TAB MENU, SLIDER, MODAL
  // ==================================================================

  // --- TAB MENU (Chè / Ăn sáng / Coffee) ---
  const menuImg = document.getElementById("menu-img");
  const menuTitle = document.getElementById("menu-title");
  const menuList = document.getElementById("menu-list");
  const tabs = document.querySelectorAll(".cat-item");

  if (menuImg && menuTitle && menuList && tabs.length > 0) {
    const menuData = {
      dessert: {
        title: "Chè",
        image: "../assets/images/setche.png",
        items: [
          {
            name: "Chè bưởi",
            price: "35.000 VND",
            desc: "Cùi bưởi giòn sần sật.",
          },
          {
            name: "Chè Hạt Sen",
            price: "55.000 VND",
            desc: "Vị ngọt thanh mát.",
          },
          { name: "Chè đậu đỏ", price: "40.000 VND", desc: "Đậu đỏ ninh mềm." },
        ],
      },
      steak: {
        title: "Ăn sáng",
        image: "../assets/images/banhmichao.png",
        items: [
          {
            name: "Bánh mì chảo",
            price: "45.000 VND",
            desc: "Thịt bò mềm mại.",
          },
          {
            name: "Bánh cuốn",
            price: "40.000 VND",
            desc: "Nhân thịt, mộc nhĩ.",
          },
          {
            name: "Bánh mì thập cẩm",
            price: "40.000 VND",
            desc: "Thịt heo quay.",
          },
        ],
      },
      coffee: {
        title: "Coffee",
        image: "../assets/images/coffee_set.png",
        items: [
          { name: "Coffee đen", price: "35.000 VND", desc: "Đậm đà hương vị." },
          {
            name: "Coconut Coffee",
            price: "55.000 VND",
            desc: "Cốt dừa béo ngậy.",
          },
          {
            name: "Vanila Coffee",
            price: "40.000 VND",
            desc: "Hương thơm vani.",
          },
        ],
      },
    };

    function renderMenu(type) {
      const data = menuData[type];
      if (!data) return;

      // Hiệu ứng mờ ảnh khi đổi
      menuImg.style.opacity = 0;
      setTimeout(() => {
        menuImg.src = data.image;
        menuImg.style.opacity = 1;
      }, 200);

      menuTitle.textContent = data.title;
      menuList.innerHTML = "";

      data.items.forEach((item) => {
        menuList.innerHTML += `
            <div class="menu-item">
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${item.price}</span>
                </div>
                <p class="item-desc">${item.desc}</p>
            </div>`;
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        document.querySelector(".cat-item.active")?.classList.remove("active");
        this.classList.add("active");
        renderMenu(this.getAttribute("data-type"));
      });
    });
    // Render mặc định
    renderMenu("dessert");
  }

  // --- SLIDERS (Must Try & Reviews) ---
  const track1 = document.getElementById("mustTryTrack");
  const dots1 = document.querySelectorAll(
    ".must-try-section .carousel-dots .dot"
  );
  if (track1 && dots1.length > 0) {
    dots1.forEach((dot) => {
      dot.addEventListener("mouseover", function () {
        dots1.forEach((d) => d.classList.remove("active"));
        this.classList.add("active");
        const index = parseInt(this.getAttribute("data-index"));
        // Di chuyển slider (điều chỉnh px nếu cần)
        track1.style.transform = `translateX(${index * -300}px)`;
      });
    });
  }

  const track2 = document.getElementById("reviewTrack");
  const dots2 = document.querySelectorAll(".review-dots .dot");
  if (track2 && dots2.length > 0) {
    dots2.forEach((dot) => {
      dot.addEventListener("mouseover", function () {
        dots2.forEach((d) => d.classList.remove("active"));
        this.classList.add("active");
        const index = parseInt(this.getAttribute("data-index"));
        track2.style.transform = `translateX(${index * -1200}px)`;
      });
    });
  }

  // --- VIDEO MODAL ---
  const videoBtn = document.getElementById("openVideoBtn");
  const videoModal = document.getElementById("videoModal");
  const closeVideo = document.querySelector(".close-video");
  const iframe = document.getElementById("youtubeIframe");

  if (videoBtn && videoModal && iframe) {
    videoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      videoModal.style.display = "flex";
    });
    function closeVideoModal() {
      videoModal.style.display = "none";
      const currentSrc = iframe.src;
      iframe.src = "";
      iframe.src = currentSrc; // Reset src để dừng video
    }
    if (closeVideo) closeVideo.addEventListener("click", closeVideoModal);
    videoModal.addEventListener("click", function (e) {
      if (e.target === videoModal) closeVideoModal();
    });
  }
});

// ==================================================================
// 4. CÁC HÀM GLOBAL (GẮN VÀO WINDOW ĐỂ GỌI TỪ HTML)
// ==================================================================

// Toggle menu user
window.toggleUserMenu = function () {
  const menu = document.getElementById("user-menu-dropdown");
  if (menu)
    menu.style.display = menu.style.display === "block" ? "none" : "block";
};

// Đăng xuất
window.handleLogout = function () {
  if (confirm("Bạn có chắc muốn đăng xuất không?")) {
    localStorage.removeItem("user");
    window.location.reload();
  }
};

// Cập nhật số lượng giỏ hàng trên Header (Gọi từ mọi nơi: detail, list...)
window.updateCartBadge = function () {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  // Tính tổng số lượng (quantity) của các món
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Tìm tất cả các badge giỏ hàng (vì có thể có cả trên mobile/desktop)
  const badges = document.querySelectorAll(".cart-count");

  badges.forEach((badge) => {
    badge.textContent = totalQty;
    // Hiệu ứng rung nhẹ
    badge.style.transform = "scale(1.2)";
    badge.style.transition = "transform 0.2s";
    setTimeout(() => (badge.style.transform = "scale(1)"), 200);
  });
};

// Đóng dropdown khi click ra ngoài
window.addEventListener("click", function (e) {
  const dropdown = document.querySelector(".user-dropdown");
  const menu = document.getElementById("user-menu-dropdown");
  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.style.display = "none";
  }
});

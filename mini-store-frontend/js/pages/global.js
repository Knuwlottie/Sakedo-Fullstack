document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "--> Global Page JS đã tải: Chỉ xử lý nội dung trang chủ (Slider, API, Tab).",
  );

  // ============================================================
  // 🔥 MỚI THÊM: LOGIC DỌN DẸP GIỎ HÀNG CHO KHÁCH (FIX DƯ ÂM)
  // ============================================================
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    // Nếu là Guest -> Xóa sạch giỏ hàng cũ đi
    if (currentUser && currentUser.role === "guest") {
      localStorage.removeItem("cart");
      console.log("🧹 Đã tự động xóa giỏ hàng của Khách.");

      // Cập nhật lại số 0 trên Header (Gọi hàm bên header.js nếu có)
      if (typeof window.updateCartBadge === "function") {
        window.updateCartBadge();
      }
    }
  } catch (err) {
    console.error("Lỗi dọn dẹp giỏ hàng:", err);
  }
  // ============================================================

  window.checkLoginRequired = function () {
    const user = JSON.parse(localStorage.getItem("user"));

    // 1. Nếu chưa đăng nhập tí nào
    if (!user) {
      if (
        confirm(
          "Bạn cần đăng nhập để sử dụng tính năng này. Đi tới trang đăng nhập ngay?",
        )
      ) {
        window.location.href = "auth.html";
      }
      return false;
    }

    // 2. Nếu là Khách (Guest) -> CHẶN LẠI
    if (user.role === "guest") {
      if (
        confirm(
          "Tính năng này chỉ dành cho Thành viên chính thức.\nBạn đang ở chế độ Khách xem.\n\nBạn có muốn Đăng ký tài khoản ngay không?",
        )
      ) {
        localStorage.removeItem("user"); // Xóa chế độ khách
        localStorage.removeItem("cart"); // Tiện tay xóa luôn giỏ hàng
        window.location.href = "auth.html";
      }
      return false; // Ngăn không cho thực hiện hành động
    }

    // 3. Nếu là Member xịn -> CHO QUA
    return true;
  };

  // ==================================================================
  // 1. LOGIC TRANG CHỦ: GỌI API & RENDER SẢN PHẨM
  // ==================================================================

  async function fetchAndRenderHomeData() {
    const promoContainer = document.getElementById("promo-container");
    const mustTryContainer = document.getElementById("mustTryTrack");

    // Nếu không tìm thấy các container này, dừng lại
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
        const promoList = products.filter((p) => p.discount > 0).slice(0, 4);
        promoContainer.innerHTML = "";

        if (promoList.length === 0) {
          promoContainer.innerHTML =
            "<p>Hiện chưa có chương trình khuyến mãi.</p>";
        } else {
          promoList.forEach((product) => {
            // LƯU Ý: Đường dẫn ảnh dùng ../ để lùi ra ngoài thư mục pages
            const imgPath = `../assets/images/${product.image}`;
            const detailLink = `product-detail.html?id=${product.id}`;

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
        const bestSellerList = products
          .filter((p) => p.bestSeller === true)
          .slice(0, 8);
        mustTryContainer.innerHTML = "";

        bestSellerList.forEach((product) => {
          const oldPrice = product.price * (1 + (product.discount || 10) / 100);
          const detailLink = `product-detail.html?id=${product.id}`;
          const imgPath = `../assets/images/${product.image}`; // Dùng ../

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
          '<p style="color:red; text-align:center">Không kết nối được Server Backend!</p>';
    }
  }

  fetchAndRenderHomeData();

  // ==================================================================
  // 2. LOGIC UI TĨNH: TAB MENU, SLIDER, MODAL
  // ==================================================================

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
    renderMenu("dessert");
  }

  // --- SLIDERS ---
  const track1 = document.getElementById("mustTryTrack");
  const dots1 = document.querySelectorAll(
    ".must-try-section .carousel-dots .dot",
  );
  if (track1 && dots1.length > 0) {
    dots1.forEach((dot) => {
      dot.addEventListener("mouseover", function () {
        dots1.forEach((d) => d.classList.remove("active"));
        this.classList.add("active");
        const index = parseInt(this.getAttribute("data-index"));
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
      iframe.src = currentSrc;
    }
    if (closeVideo) closeVideo.addEventListener("click", closeVideoModal);
    videoModal.addEventListener("click", function (e) {
      if (e.target === videoModal) closeVideoModal();
    });
  }
});

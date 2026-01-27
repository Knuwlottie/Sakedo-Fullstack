// global.js (hoặc tên file tương ứng)

document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "--> Global Page JS đã tải: Xử lý giỏ hàng guest, callback PayOS, trang chủ & UI tĩnh",
  );

  // ────────────────────────────────────────────────
  // Phần 1: Xử lý giỏ hàng cho tài khoản Guest
  // ────────────────────────────────────────────────
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser && currentUser.role === "guest") {
      localStorage.removeItem("cart");
      console.log("🧹 Đã tự động xóa giỏ hàng của Khách (guest).");

      if (typeof window.updateCartBadge === "function") {
        window.updateCartBadge();
      }
    }
  } catch (err) {
    console.error("Lỗi khi dọn dẹp giỏ hàng guest:", err);
  }

  // ────────────────────────────────────────────────
  // Phần 2: Xử lý callback thanh toán từ PayOS
  // ────────────────────────────────────────────────
  async function handlePaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get("payment");
    const payosStatus = urlParams.get("status");

    console.log(
      `--> Callback params: payment=${payment}, status=${payosStatus}`,
    );

    if (payment === "success") {
      console.log("--> Thanh toán thành công → xử lý lưu đơn hàng");

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length === 0) {
        console.log("--> Giỏ hàng trống, bỏ qua lưu đơn");
        cleanupAfterSuccess();
        return;
      }

      // Chuẩn bị dữ liệu đơn hàng
      let subTotal = 0;
      const orderItems = cart.map((item) => {
        let price =
          Number(
            String(item.price || 0)
              .replace(/\./g, "")
              .replace(/[^\d]/g, ""),
          ) || 0;

        let image = item.image || "no-image.png";
        if (image.startsWith("data:")) image = "no-image.png";
        else if (image.includes("/")) image = image.split("/").pop();

        subTotal += price * (Number(item.quantity) || 1);

        return {
          productName: item.name || "Sản phẩm không tên",
          quantity: Number(item.quantity) || 1,
          price,
          image,
        };
      });

      // Thông tin khách hàng
      let customerName = "Khách Thanh Toán QR";
      let customerPhone = "";
      let customerAddress = "Thanh toán qua PayOS";

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          customerName = user.name || user.fullName || customerName;
          customerPhone = user.phone || customerPhone;
          customerAddress = user.address || customerAddress;
        }
      } catch {}

      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        note: "Thanh toán online qua PayOS",
        shippingFee: 15000,
        totalAmount: subTotal + 15000,
        status: 1, // Đã thanh toán
        items: orderItems,
      };

      try {
        const res = await fetch("http://localhost:8080/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (res.ok) {
          const result = await res.json();
          console.log("✅ Đơn hàng đã lưu thành công:", result);
          alert("Thanh toán thành công! Đơn hàng đã được ghi nhận.");
        } else {
          const errorText = await res.text();
          console.error("Lỗi server:", res.status, errorText);
          alert("Lưu đơn hàng thất bại. Vui lòng liên hệ hỗ trợ.");
        }
      } catch (err) {
        console.error("Lỗi gọi API tạo đơn hàng:", err);
        alert("Không kết nối được server. Vui lòng thử lại sau.");
      }

      cleanupAfterSuccess();
    } else if (payosStatus === "CANCELLED") {
      console.log("--> Người dùng đã hủy thanh toán");
      alert("Bạn đã hủy thanh toán. Giỏ hàng vẫn được giữ nguyên.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  function cleanupAfterSuccess() {
    localStorage.removeItem("cart");
    window.history.replaceState({}, document.title, window.location.pathname);
    if (typeof window.updateCartBadge === "function") {
      window.updateCartBadge();
    }
    location.reload();
  }

  // Gọi ngay lập tức
  handlePaymentCallback();

  // ────────────────────────────────────────────────
  // Phần 3: Trang chủ – Load sản phẩm từ API
  // ────────────────────────────────────────────────
  function getImageUrl(img) {
    if (!img || img.trim() === "")
      return "https://placehold.co/300x300?text=No+Image";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    if (img.startsWith("../") || img.startsWith("./")) return img;
    return `../assets/images/${img}`;
  }

  async function loadHomeProducts() {
    const promoEl = document.getElementById("promo-container");
    const mustTryEl = document.getElementById("mustTryTrack");

    if (!promoEl && !mustTryEl) return;

    try {
      const res = await fetch("http://localhost:8080/api/products");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const products = await res.json();

      // Ưu đãi
      if (promoEl) {
        const promos = products.filter((p) => p.discount > 0).slice(0, 4);
        promoEl.innerHTML =
          promos.length === 0
            ? "<p>Hiện chưa có chương trình khuyến mãi.</p>"
            : promos
                .map(
                  (p) => `
              <div class="promo-card">
                <a href="product-detail.html?id=${p.id}" style="display:block;height:100%;">
                  <img src="${getImageUrl(p.image)}" alt="${p.name}" class="promo-img"
                       onerror="this.src='https://placehold.co/300x300?text=Sakedo'"/>
                  <div class="promo-overlay"><h3 class="dish-name">${p.name}</h3></div>
                  <div class="discount-badge"><span>-${p.discount}%</span></div>
                </a>
              </div>
            `,
                )
                .join("");
      }

      // Món ngon phải thử
      if (mustTryEl) {
        const best = products.filter((p) => p.bestSeller).slice(0, 8);
        mustTryEl.innerHTML = best
          .map((p) => {
            const oldPrice = p.price * (1 + (p.discount || 10) / 100);
            const img = getImageUrl(p.image);
            return `
            <div class="food-card">
              <div class="card-header">
                <span class="sale-badge">HOT</span>
                <div class="img-bg"></div>
                <a href="product-detail.html?id=${p.id}">
                  <img src="${img}" alt="${p.name}" class="food-img"
                       onerror="this.src='https://placehold.co/200x200?text=Mon+Ngon'"/>
                </a>
              </div>
              <div class="card-body">
                <h3 class="food-title">
                  <a href="product-detail.html?id=${p.id}" style="color:inherit;text-decoration:none;">
                    ${p.name}
                  </a>
                </h3>
                <div class="price-row">
                  <div class="price-info">
                    <span class="old-price">${oldPrice.toLocaleString()}đ</span>
                    <span class="new-price">${p.price.toLocaleString()}đ</span>
                  </div>
                  <button class="cart-btn-small" onclick="window.location.href='product-detail.html?id=${p.id}'">
                    <i class="fas fa-shopping-bag"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
          })
          .join("");
      }
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      if (promoEl)
        promoEl.innerHTML =
          '<p style="color:red;text-align:center">Không kết nối được server!</p>';
    }
  }

  loadHomeProducts();

  // ────────────────────────────────────────────────
  // Phần 4: UI tĩnh – Tab menu, Slider dots, Video modal
  // ────────────────────────────────────────────────
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
        image: "../assets/images/icon_coffee.png",
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

      menuImg.style.opacity = "0";
      setTimeout(() => {
        menuImg.src = data.image;
        menuImg.style.opacity = "1";
      }, 200);

      menuTitle.textContent = data.title;
      menuList.innerHTML = data.items
        .map(
          (item) => `
            <div class="menu-item">
              <div class="item-header">
                <span class="item-name">${item.name}</span>
                <span class="item-price">${item.price}</span>
              </div>
              <p class="item-desc">${item.desc}</p>
            </div>
          `,
        )
        .join("");
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        document.querySelector(".cat-item.active")?.classList.remove("active");
        this.classList.add("active");
        renderMenu(this.dataset.type);
      });
    });

    // Load mặc định
    renderMenu("dessert");
  }

  // Slider dots – must try
  const track1 = document.getElementById("mustTryTrack");
  const dots1 = document.querySelectorAll(
    ".must-try-section .carousel-dots .dot",
  );
  if (track1 && dots1.length > 0) {
    dots1.forEach((dot) => {
      dot.addEventListener("mouseover", function () {
        dots1.forEach((d) => d.classList.remove("active"));
        this.classList.add("active");
        const idx = parseInt(this.dataset.index, 10);
        track1.style.transform = `translateX(${idx * -300}px)`;
      });
    });
  }

  // Slider dots – review
  const track2 = document.getElementById("reviewTrack");
  const dots2 = document.querySelectorAll(".review-dots .dot");
  if (track2 && dots2.length > 0) {
    dots2.forEach((dot) => {
      dot.addEventListener("mouseover", function () {
        dots2.forEach((d) => d.classList.remove("active"));
        this.classList.add("active");
        const idx = parseInt(this.dataset.index, 10);
        track2.style.transform = `translateX(${idx * -1200}px)`;
      });
    });
  }

  // Video modal
  const videoBtn = document.getElementById("openVideoBtn");
  const videoModal = document.getElementById("videoModal");
  const closeBtn = document.querySelector(".close-video");
  const iframe = document.getElementById("youtubeIframe");

  if (videoBtn && videoModal && iframe) {
    videoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      videoModal.style.display = "flex";
    });

    const closeModal = () => {
      videoModal.style.display = "none";
      const src = iframe.src;
      iframe.src = "";
      iframe.src = src; // reset video
    };

    closeBtn?.addEventListener("click", closeModal);
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) closeModal();
    });
  }

  // ────────────────────────────────────────────────
  // Hàm check login (nếu các trang khác gọi)
  // ────────────────────────────────────────────────
  window.checkLoginRequired = function () {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      if (
        confirm(
          "Bạn cần đăng nhập để sử dụng tính năng này.\nĐi tới trang đăng nhập ngay?",
        )
      ) {
        window.location.href = "auth.html";
      }
      return false;
    }
    return true;
  };
});

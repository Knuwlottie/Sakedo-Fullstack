document.addEventListener("DOMContentLoaded", function () {
  console.log("--> Global Page JS đã tải.");

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

  async function handlePaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const payosStatus = urlParams.get("status");

    console.log(
      "--> URL Params: payment=" + paymentStatus + ", status=" + payosStatus,
    );

    if (paymentStatus === "success") {
      console.log("--> Phát hiện thanh toán thành công. Bắt đầu xử lý...");

      const pendingOrderId = localStorage.getItem("pendingOrderId");

      if (pendingOrderId) {
        console.log(
          "--> Có pendingOrderId:",
          pendingOrderId,
          "- Cập nhật status order...",
        );

        try {
          const response = await fetch(
            `http://localhost:8080/api/orders/${pendingOrderId}/status?newStatus=1`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (response.ok) {
            console.log("--> ✅ Đã cập nhật trạng thái đơn hàng thành công!");
          } else {
            console.error(
              "--> ❌ Lỗi cập nhật trạng thái:",
              await response.text(),
            );
          }
        } catch (error) {
          console.error("--> ❌ Lỗi kết nối:", error);
        }

        localStorage.removeItem("pendingOrderId");
      } else {
        console.log(
          "--> Không có pendingOrderId - Order đã được tạo trước đó.",
        );
      }

      localStorage.removeItem("cart");

      alert("✅ Thanh toán thành công! Đơn hàng đã được xác nhận.");
      window.history.replaceState({}, document.title, window.location.pathname);
      location.reload();
    } else if (payosStatus === "CANCELLED") {
      console.log("--> Khách hàng đã hủy thanh toán.");

      const pendingOrderId = localStorage.getItem("pendingOrderId");
      if (pendingOrderId) {
        console.log("--> Hủy order:", pendingOrderId);
        try {
          await fetch(
            `http://localhost:8080/api/orders/${pendingOrderId}/status?newStatus=4`,
            {
              method: "PUT",
            },
          );
        } catch (e) {
          console.error("--> Lỗi hủy order:", e);
        }
        localStorage.removeItem("pendingOrderId");
      }

      alert("⚠️ Bạn đã hủy thanh toán. Đơn hàng đã bị hủy.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
  handlePaymentCallback();

  function getImageUrl(imgName) {
    if (!imgName || imgName.trim() === "")
      return "https://placehold.co/300x300?text=No+Image";
    if (imgName.startsWith("http") || imgName.startsWith("data:"))
      return imgName;
    if (imgName.startsWith("../") || imgName.startsWith("./")) return imgName;
    return `../assets/images/${imgName}`;
  }

  async function fetchAndRenderHomeData() {
    const promoContainer = document.getElementById("promo-container");
    const mustTryContainer = document.getElementById("mustTryTrack");

    if (!promoContainer && !mustTryContainer) return;

    try {
      console.log("--> Đang gọi API: http://localhost:8080/api/products");
      const response = await fetch("http://localhost:8080/api/products");

      if (!response.ok)
        throw new Error("Không thể kết nối đến Backend Spring Boot");

      const products = await response.json();

      if (promoContainer) {
        const promoList = products.filter((p) => p.discount > 0).slice(0, 4);
        promoContainer.innerHTML = "";

        if (promoList.length === 0) {
          promoContainer.innerHTML =
            "<p>Hiện chưa có chương trình khuyến mãi.</p>";
        } else {
          promoList.forEach((product) => {
            const imgPath = getImageUrl(product.image);
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

      if (mustTryContainer) {
        const bestSellerList = products
          .filter((p) => p.bestSeller === true)
          .slice(0, 8);
        mustTryContainer.innerHTML = "";

        bestSellerList.forEach((product) => {
          const oldPrice = product.price * (1 + (product.discount || 10) / 100);
          const detailLink = `product-detail.html?id=${product.id}`;
          const imgPath = getImageUrl(product.image);

          const html = `
                <div class="food-card">
                    <div class="card-header">
                        <span class="sale-badge">HOT</span>
                        <div class="img-bg"></div>
                        <a href="${detailLink}">
                            <img src="${imgPath}" alt="${product.name}" class="food-img"
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

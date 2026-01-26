document.addEventListener("DOMContentLoaded", function () {
  console.log("🏠 Home Page Loaded");
  fetchAllProducts();
});

// --- HÀM CHÍNH: GỌI API ---
function fetchAllProducts() {
  fetch("http://localhost:8080/api/products")
    .then((res) => res.json())
    .then((products) => {
      console.log("Dữ liệu Home:", products.length + " món");

      renderHeroProduct(products);
      renderPromoSection(products);
      renderBestSellers(products);
      setupMenuTabs(products);
    })
    .catch((err) => console.error("Lỗi API Home:", err));
}

// ==============================================
// 1. XỬ LÝ BANNER (HERO SECTION)
// ==============================================
function renderHeroProduct(products) {
  const heroArea = document.getElementById("hero-product-area");
  // Lấy món có giá cao nhất hoặc món đầu tiên làm Hero
  const product = products.find((p) => p.bestSeller) || products[0];

  if (!heroArea || !product) return;

  const price = formatCurrency(product.price);
  const detailLink = `product-detail.html?id=${product.id}`;

  heroArea.innerHTML = `
        <div class="hero-card float-card" onclick="window.location.href='${detailLink}'" style="cursor: pointer;">
            <div class="card-info">
                <span class="badge">Best Seller</span>
                <h3>${price}</h3>
                <p>${product.name}</p>
                <div class="stars">★★★★★</div>
            </div>
            <img src="../assets/images/${product.image}" 
                 alt="${product.name}" 
                 class="card-img"
                 onerror="this.src='https://placehold.co/400x400?text=Sakedo'"/>
        </div>
    `;
}

// ==============================================
// 2. XỬ LÝ MỤC KHÁM PHÁ ƯU ĐÃI (PROMOTION)
// ==============================================
function renderPromoSection(products) {
  const container = document.getElementById("promo-container");
  if (!container) return;

  const promoItems = products.filter((p) => p.discount > 0).slice(0, 4);

  container.innerHTML = promoItems
    .map(
      (item) => `
        <div class="promo-card">
            <a href="product-detail.html?id=${item.id}" style="display:block; width:100%; height:100%;">
                <img src="../assets/images/${item.image}" 
                     alt="${item.name}" class="promo-img" 
                     onerror="this.src='https://placehold.co/300x300?text=Sakedo'"/>
                <div class="promo-overlay">
                    <h3 class="dish-name">${item.name}</h3>
                </div>
                <div class="discount-badge"><span>-${item.discount}%</span></div>
            </a>
        </div>
    `,
    )
    .join("");
}

// ==============================================
// 3. XỬ LÝ CAROUSEL (MÓN NGON PHẢI THỬ)
// ==============================================
function renderBestSellers(products) {
  const track = document.getElementById("mustTryTrack");
  if (!track) return;

  const bestSellers = products.filter((p) => p.bestSeller === true).slice(0, 8);

  track.innerHTML = bestSellers
    .map((item) => {
      const price = formatCurrency(item.price);
      let oldPriceHtml = "";

      // Tính giá cũ giả định để hiển thị cho đẹp
      if (item.discount > 0) {
        const oldPrice = item.price * (1 + item.discount / 100);
        oldPriceHtml = `<span class="old-price">${formatCurrency(oldPrice)}</span>`;
      }

      // Chuẩn bị dữ liệu để truyền vào hàm thêm giỏ hàng
      // Lưu ý: Phải escape dấu nháy đơn trong tên món ăn để tránh lỗi JS
      const safeName = item.name.replace(/'/g, "\\'");

      return `
            <div class="food-card">
                <div class="card-header">
                    <span class="sale-badge">HOT</span>
                    <div class="img-bg"></div>
                    <a href="product-detail.html?id=${item.id}">
                        <img src="../assets/images/${item.image}" alt="${item.name}" class="food-img"
                             onerror="this.src='https://placehold.co/200x200?text=Sakedo'"/>
                    </a>
                </div>
                <div class="card-body">
                    <h3 class="food-title">
                        <a href="product-detail.html?id=${item.id}">${item.name}</a>
                    </h3>
                    <div class="price-row">
                        <div class="price-info">
                            ${oldPriceHtml}
                            <span class="new-price">${price}</span>
                        </div>
                        <button class="cart-btn-small" 
                                onclick="handleHomeAddToCart(${item.id}, '${safeName}', ${item.price}, '${item.image}')">
                            <i class="fas fa-shopping-bag"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// ==============================================
// 4. XỬ LÝ TAB MENU
// ==============================================
function setupMenuTabs(allProducts) {
  const tabs = document.querySelectorAll(".cat-item");
  const listContainer = document.getElementById("menu-list");
  const titleElement = document.getElementById("menu-title");
  const imgElement = document.getElementById("menu-img");

  const renderList = (category) => {
    const filtered = allProducts
      .filter((p) => p.category === category)
      .slice(0, 4);

    if (titleElement) {
      const titles = {
        steak: "Món Chính",
        coffee: "Coffee",
        dessert: "Tráng Miệng",
      };
      titleElement.innerText = titles[category] || "Thực Đơn";
    }

    if (imgElement && filtered.length > 0) {
      imgElement.src = `../assets/images/${filtered[0].image}`;
      imgElement.onerror = () =>
        (imgElement.src = "https://placehold.co/400x400?text=Sakedo");
    }

    listContainer.innerHTML = filtered
      .map(
        (item) => `
        <div class="menu-item" onclick="window.location.href='product-detail.html?id=${item.id}'" style="cursor: pointer;">
             <div class="item-header">
                <span class="item-name">${item.name}</span>
                <span class="item-price">${formatCurrency(item.price)}</span>
             </div>
             <p class="item-desc">${item.description || "Hương vị tuyệt hảo"}</p>
        </div>
    `,
      )
      .join("");
  };

  // Tab mặc định
  const activeTab = document.querySelector(".cat-item.active");
  if (activeTab) renderList(activeTab.getAttribute("data-type"));

  // Click chuyển tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      document
        .querySelectorAll(".cat-item")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      renderList(this.getAttribute("data-type"));
    });
  });
}

// ==============================================
// 5. CÁC HÀM HỖ TRỢ RIÊNG CHO HOME
// ==============================================

// Hàm xử lý thêm giỏ hàng (Có kiểm tra quyền từ global.js)
function handleHomeAddToCart(id, name, price, image) {
  // 1. Gọi hàm kiểm tra quyền trong global.js
  if (typeof window.checkLoginRequired === "function") {
    if (!window.checkLoginRequired()) return;
  }

  // 2. Logic thêm vào LocalStorage (Giống trong menu.js)
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id == id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      originalPrice: price,
      image: image,
      quantity: 1,
      note: "",
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // 3. Cập nhật Badge trên Header (Hàm trong global.js)
  if (window.updateCartBadge) window.updateCartBadge();

  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

// Hàm format tiền tệ (nếu global chưa có)
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

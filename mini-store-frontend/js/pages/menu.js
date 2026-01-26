document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  updateCartBadge();
});

async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:8080/api/products");
    if (!response.ok) throw new Error("Lỗi kết nối Server");
    const products = await response.json();

    console.log("Dữ liệu món ăn:", products);

    renderBestSellers(products);
    renderDailyOffers(products);
    renderMainDishes(products);
    renderDesserts(products);
  } catch (error) {
    console.error("Lỗi:", error);
  }
}

// ============================================================
// 1. CÁC HÀM RENDER GIAO DIỆN
// ============================================================

// 1. BEST SELLER
function renderBestSellers(products) {
  const container = document.querySelector(
    ".best-selling-section .product-grid",
  );
  if (!container) return;

  const bestSellers = products.filter((p) => p.bestSeller === true).slice(0, 8);
  container.innerHTML = bestSellers
    .map((product) => createProductCard(product))
    .join("");
}

// 2. ƯU ĐÃI TRONG NGÀY
function renderDailyOffers(products) {
  const container =
    document.querySelector(".daily-offer-section .offer-grid") ||
    document.querySelector(".daily-offer-section .product-grid");
  if (!container) return;

  const offers = products.filter((p) => p.discount > 0).slice(0, 5);
  container.innerHTML = offers
    .map((product) => createProductCard(product))
    .join("");
}

// 3. GỢI Ý MÓN ĂN (Steak)
function renderMainDishes(products) {
  const container = document.querySelector(".suggestion-grid");
  if (!container) return;

  const mainDishes = products.filter((p) => p.category === "steak").slice(0, 9);
  container.innerHTML = mainDishes
    .map((product) => createSuggestionCard(product))
    .join("");
}

// 4. TRÁNG MIỆNG (Dessert)
function renderDesserts(products) {
  const container = document.querySelector(".dessert-grid");
  if (!container) return;

  const desserts = products.filter((p) => p.category === "dessert");
  container.innerHTML = desserts
    .map(
      (product) => `
        <div class="dessert-card" 
             onclick="window.location.href='/pages/product-detail.html?id=${product.id}'" 
             style="cursor: pointer;">
             
            <div class="dessert-img-wrap">
                <div class="dessert-bg-shape"></div>
                <img src="${getImageUrl(product.image)}" alt="${product.name}" 
                     onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
            </div>
            <div class="dessert-info">
                <h3 class="dessert-name">${product.name}</h3>
                <div class="dessert-price-row">
                    <span class="d-price">${product.price.toLocaleString()}đ</span>
                    <button class="btn-d-cart" onclick="event.stopPropagation(); quickAddToCart(${product.id}, '${product.name}', ${product.price}, ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

// ============================================================
// 2. CÁC HÀM TẠO HTML (CARD)
// ============================================================

// --- CARD CHÍNH (Best Seller & Ưu đãi) ---
function createProductCard(product) {
  let finalPrice = product.price;
  let priceHTML = "";

  if (product.discount && product.discount > 0) {
    finalPrice = (product.price * (100 - product.discount)) / 100;
    priceHTML = `
            <div class="price-container">
                <span class="old-price-display">${product.price.toLocaleString()}đ</span>
                <span class="new-price-display">${finalPrice.toLocaleString()}đ</span>
            </div>`;
  } else {
    priceHTML = `<span class="price">${product.price.toLocaleString()}đ</span>`;
  }

  return `
        <div class="product-card" 
             onclick="window.location.href='/pages/product-detail.html?id=${product.id}'" 
             style="cursor: pointer;">
             
            <div class="card-img" style="position: relative;">
                <img src="${getImageUrl(product.image)}" alt="${product.name}" 
                     onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
                ${product.discount > 0 ? `<div class="sale-tag">-${product.discount}%</div>` : ""}
            </div>
            
            <div class="card-info">
                <div class="rating">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
                <h3 class="product-name" style="min-height: 40px; margin-bottom: 5px;">${product.name}</h3>
                
                <div class="price-row">
                    ${priceHTML}
                    <button class="add-cart-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id}, '${product.name}', ${finalPrice}, ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- CARD GỢI Ý (Suggestion) ---
function createSuggestionCard(product) {
  return `
        <div class="suggest-card" 
             onclick="window.location.href='/pages/product-detail.html?id=${product.id}'" 
             style="cursor: pointer;"> 
             
            <div class="suggest-img-wrap">
                <div class="bg-circle"></div>
                <img src="${getImageUrl(product.image)}" alt="${product.name}"
                     onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
            </div>
            <div class="suggest-info">
                <h3 class="suggest-name">${product.name}</h3>
                <div class="suggest-price-row">
                    <span class="s-price">${product.price.toLocaleString()}đ</span>
                    
                    <button class="btn-s-cart" onclick="event.stopPropagation(); quickAddToCart(${product.id}, '${product.name}', ${product.price}, ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// 3. CÁC HÀM HỖ TRỢ
// ============================================================

// Xử lý hiển thị ảnh
function getImageUrl(imgName) {
  if (!imgName || imgName.trim() === "")
    return "https://placehold.co/300x300?text=No+Image";

  if (imgName.startsWith("http") || imgName.startsWith("data:")) return imgName;
  if (imgName.startsWith("../") || imgName.startsWith("./")) return imgName;

  return `../assets/images/${imgName}`;
}

// 🔥 THÊM VÀO GIỎ HÀNG (CÓ CHẶN QUYỀN KHÁCH) 🔥
function quickAddToCart(id, name, price, originalPrice, image) {
  // 1. Kiểm tra quyền trước khi thêm
  if (typeof window.checkLoginRequired === "function") {
    if (!window.checkLoginRequired()) return;
  }

  // 2. Logic thêm vào giỏ
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id == id);

  if (existing) {
    existing.quantity += 1;
    existing.price = price;
    existing.originalPrice = originalPrice;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      originalPrice: originalPrice,
      image: image, // Chỉ lưu tên file gốc
      quantity: 1,
      note: "",
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

// Cập nhật số lượng trên icon giỏ hàng
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach((b) => (b.innerText = total));
}

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

// 1. BEST SELLER
function renderBestSellers(products) {
  const container = document.querySelector(
    ".best-selling-section .product-grid"
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
  const offers = products.filter((p) => p.discount > 0).slice(0, 5); // Lấy 5 món cho đẹp grid
  container.innerHTML = offers
    .map((product) => createProductCard(product))
    .join("");
}

// 3. GỢI Ý MÓN ĂN (Món ngon đề xuất)
function renderMainDishes(products) {
  const container = document.querySelector(".suggestion-grid");
  if (!container) return;
  const mainDishes = products.filter((p) => p.category === "steak").slice(0, 9);
  container.innerHTML = mainDishes
    .map((product) => createSuggestionCard(product))
    .join("");
}

// 4. TRÁNG MIỆNG
function renderDesserts(products) {
  const container = document.querySelector(".dessert-grid");
  if (!container) return;
  const desserts = products.filter((p) => p.category === "dessert");

  // SỬA LẠI ĐOẠN NÀY ĐỂ CLICK ĐƯỢC TOÀN BỘ CARD
  container.innerHTML = desserts
    .map(
      (product) => `
        <div class="dessert-card" 
             onclick="window.location.href='/pages/product-detail.html?id=${
               product.id
             }'" 
             style="cursor: pointer;">
             
            <div class="dessert-img-wrap">
                <div class="dessert-bg-shape"></div>
                <img src="${getImageUrl(product.image)}" alt="${product.name}">
            </div>
            <div class="dessert-info">
                <h3 class="dessert-name">${product.name}</h3>
                <div class="dessert-price-row">
                    <span class="d-price">${product.price.toLocaleString()}đ</span>
                    <button class="btn-d-cart" onclick="event.stopPropagation(); quickAddToCart(${
                      product.id
                    }, '${product.name}', ${product.price}, ${
        product.price
      }, '${product.image}')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// --- HÀM TẠO CARD CHÍNH (Dùng cho Best Seller & Ưu đãi) ---
function createProductCard(product) {
  let finalPrice = product.price;
  let priceHTML = "";

  if (product.discount && product.discount > 0) {
    finalPrice = (product.price * (100 - product.discount)) / 100;
    priceHTML = `
            <div class="price-container">
                <span class="old-price-display">${product.price.toLocaleString()}đ</span>
                <span class="new-price-display">${finalPrice.toLocaleString()}đ</span>
            </div>
        `;
  } else {
    priceHTML = `<span class="price">${product.price.toLocaleString()}đ</span>`;
  }

  // UPDATE QUAN TRỌNG: onclick nằm ở div ngoài cùng
  return `
        <div class="product-card" 
             onclick="window.location.href='/pages/product-detail.html?id=${
               product.id
             }'" 
             style="cursor: pointer;">
             
            <div class="card-img" style="position: relative;">
                <img src="${getImageUrl(product.image)}" alt="${product.name}">
                ${
                  product.discount > 0
                    ? `<div class="sale-tag">-${product.discount}%</div>`
                    : ""
                }
            </div>
            
            <div class="card-info">
                <div class="rating">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
                <h3 class="product-name" style="min-height: 40px; margin-bottom: 5px;">${
                  product.name
                }</h3>
                
                <div class="price-row">
                    ${priceHTML}
                    <button class="add-cart-btn" onclick="event.stopPropagation(); quickAddToCart(${
                      product.id
                    }, '${product.name}', ${finalPrice}, ${product.price}, '${
    product.image
  }')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- HÀM TẠO CARD GỢI Ý (Suggestion) ---
// ĐÂY LÀ HÀM BẠN ĐANG BỊ LỖI CLICK
function createSuggestionCard(product) {
  return `
        <div class="suggest-card" 
             onclick="window.location.href='/pages/product-detail.html?id=${
               product.id
             }'" 
             style="cursor: pointer;"> 
             <div class="suggest-img-wrap">
                <div class="bg-circle"></div>
                <img src="${getImageUrl(product.image)}" alt="${product.name}">
            </div>
            <div class="suggest-info">
                <h3 class="suggest-name">${product.name}</h3>
                <div class="suggest-price-row">
                    <span class="s-price">${product.price.toLocaleString()}đ</span>
                    
                    <button class="btn-s-cart" onclick="event.stopPropagation(); quickAddToCart(${
                      product.id
                    }, '${product.name}', ${product.price}, ${
    product.price
  }, '${product.image}')">
                        <i class="fas fa-shopping-basket"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- CÁC HÀM HỖ TRỢ KHÁC (GIỮ NGUYÊN) ---
function getImageUrl(imgName) {
  if (!imgName) return "https://via.placeholder.com/300";
  if (imgName.startsWith("http")) return imgName;
  return `../assets/images/${imgName}`;
}

function quickAddToCart(id, name, price, originalPrice, image) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id == id);

  if (existing) {
    existing.quantity += 1;
    existing.originalPrice = originalPrice;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      originalPrice: originalPrice,
      image: getImageUrl(image),
      quantity: 1,
      note: "",
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach((b) => (b.innerText = total));
}

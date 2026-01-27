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

// --- CÁC HÀM RENDER ---
function renderBestSellers(products) {
  const container = document.querySelector(
    ".best-selling-section .product-grid",
  );
  if (container) {
    const list = products.filter((p) => p.bestSeller === true).slice(0, 8);
    container.innerHTML = list.map((p) => createProductCard(p)).join("");
  }
}

function renderDailyOffers(products) {
  const container =
    document.querySelector(".daily-offer-section .offer-grid") ||
    document.querySelector(".daily-offer-section .product-grid");
  if (container) {
    const list = products.filter((p) => p.discount > 0).slice(0, 5);
    container.innerHTML = list.map((p) => createProductCard(p)).join("");
  }
}

function renderMainDishes(products) {
  const container = document.querySelector(".suggestion-grid");
  if (container) {
    const list = products.filter((p) => p.category === "steak").slice(0, 9);
    container.innerHTML = list.map((p) => createSuggestionCard(p)).join("");
  }
}

function renderDesserts(products) {
  const container = document.querySelector(".dessert-grid");
  if (container) {
    const list = products.filter((p) => p.category === "dessert");
    container.innerHTML = list
      .map(
        (product) => `
        <div class="dessert-card" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
            <div class="dessert-img-wrap">
                <div class="dessert-bg-shape"></div>
                <img src="${getCleanImageUrl(product.image)}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
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
}

// --- HÀM TẠO CARD ---
function createProductCard(product) {
  let finalPrice = product.price;
  let priceHTML = `<span class="price">${product.price.toLocaleString()}đ</span>`;

  if (product.discount && product.discount > 0) {
    finalPrice = (product.price * (100 - product.discount)) / 100;
    priceHTML = `
            <div class="price-container">
                <span class="old-price-display">${product.price.toLocaleString()}đ</span>
                <span class="new-price-display">${finalPrice.toLocaleString()}đ</span>
            </div>`;
  }

  return `
        <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
            <div class="card-img" style="position: relative;">
                <img src="${getCleanImageUrl(product.image)}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
                ${product.discount > 0 ? `<div class="sale-tag">-${product.discount}%</div>` : ""}
            </div>
            <div class="card-info">
                <div class="rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
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

function createSuggestionCard(product) {
  return `
        <div class="suggest-card" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
            <div class="suggest-img-wrap">
                <div class="bg-circle"></div>
                <img src="${getCleanImageUrl(product.image)}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300?text=Sakedo'">
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

// --- HÀM XỬ LÝ ẢNH ---
function getCleanImageUrl(imgName) {
  if (!imgName || imgName.trim() === "")
    return "https://placehold.co/300x300?text=No+Image";
  if (imgName.startsWith("http") || imgName.startsWith("data:")) return imgName;
  return `../assets/images/${imgName.replace(/^.*[\\\/]/, "")}`;
}

// 🔥 HÀM THÊM GIỎ HÀNG + SYNC MONGODB 🔥
async function quickAddToCart(id, name, price, originalPrice, image) {
  // 1. Làm sạch ảnh
  let cleanImage = "no-image.png";
  if (image) {
    if (image.startsWith("http")) {
      cleanImage = image;
    } else if (image.startsWith("data:")) {
      cleanImage = "no-image.png";
    } else {
      cleanImage = image.replace(/^.*[\\\/]/, "");
    }
  }

  // 2. Thêm vào localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id == id);

  if (existing) {
    existing.quantity += 1;
    existing.price = price;
    existing.originalPrice = originalPrice;
    existing.image = cleanImage;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      originalPrice: originalPrice,
      image: cleanImage,
      quantity: 1,
      note: "",
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();

  // 3. 🔥 SYNC LÊN MONGODB 🔥
  try {
    await syncCartToMongoDB();
  } catch (err) {
    console.warn("Không sync được MongoDB:", err);
  }

  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

// Hàm sync giỏ hàng lên MongoDB
async function syncCartToMongoDB() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Lấy userId
  let userId = "guest";
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) userId = user.id;
    else if (user && user.email) userId = user.email;
  } catch (e) {}

  // Nếu không có user, tạo guestId
  if (userId === "guest") {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = "guest_" + Date.now();
      localStorage.setItem("guestId", guestId);
    }
    userId = guestId;
  }

  console.log(
    "--> Sync giỏ hàng lên MongoDB, user:",
    userId,
    ", items:",
    cart.length,
  );

  const response = await fetch("http://localhost:8080/api/orders/cart/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      items: cart,
    }),
  });

  if (response.ok) {
    const result = await response.json();
    console.log("--> ✅ Sync thành công:", result);
    if (result.orderId) {
      localStorage.setItem("currentOrderId", result.orderId);
    }
  } else {
    console.error("--> ❌ Sync thất bại");
  }
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach((b) => (b.innerText = total));
}

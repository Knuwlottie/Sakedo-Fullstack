document.addEventListener("DOMContentLoaded", function () {
  fetchAllProducts();
});

function fetchAllProducts() {
  fetch("http://localhost:8080/api/products")
    .then((res) => res.json())
    .then((products) => {
      console.log("Đã lấy được danh sách món:", products);
      renderHeroProduct(products);
      renderPromoSection(products);
      renderBestSellers(products);
      setupMenuTabs(products);
    })
    .catch((err) => {
      console.error("Lỗi kết nối API:", err);
    });
}

function renderHeroProduct(products) {
  const heroArea = document.getElementById("hero-product-area");
  if (!heroArea || products.length === 0) return;

  const product = products[0];
  const price = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  heroArea.innerHTML = `
        <div class="hero-card float-card">
            <div class="card-info">
                <span class="badge">Best Seller</span>
                <h3>${price}</h3>
                <p>${product.name}</p>
                <div class="stars">★★★★★</div>
            </div>
            <img src="../assets/images/${product.image}" 
                 alt="${product.name}" 
                 class="card-img"
                 onerror="this.src='https://via.placeholder.com/400x400?text=Sakedo'"/>
        </div>
    `;
}

function renderPromoSection(products) {
  const container = document.getElementById("promo-container");
  if (!container) return;

  const promoItems = products.filter((p) => p.discount > 0).slice(0, 4);

  container.innerHTML = promoItems
    .map(
      (item) => `
        <div class="promo-card clickable-card" onclick="window.location.href='product-detail.html?id=${item.id}'">
            <img src="../assets/images/${item.image}" 
                 alt="${item.name}" 
                 class="promo-img" 
                 onerror="this.src='https://via.placeholder.com/300'"/>
            <div class="promo-overlay">
                <h3 class="dish-name">${item.name.toUpperCase()}</h3>
            </div>
            <div class="discount-badge"><span>-${item.discount}%</span></div>
        </div>
    `,
    )
    .join("");
}

function renderBestSellers(products) {
  const track = document.getElementById("mustTryTrack");
  if (!track) return;

  const bestSellers = products.filter((p) => p.bestSeller === true);

  track.innerHTML = bestSellers
    .map((item) => {
      const price = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(item.price);

      let oldPriceHtml = "";
      if (item.discount > 0) {
        const oldPrice = (item.price * (100 + item.discount)) / 100;
        const oldPriceStr = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(oldPrice);
        oldPriceHtml = `<span class="old-price">${oldPriceStr}</span>`;
      }

      return `
            <div class="food-card clickable-card" onclick="window.location.href='product-detail.html?id=${item.id}'">
                <div class="card-header">
                    <span class="sale-badge">HOT</span>
                    <div class="img-bg"></div>
                    <img src="../assets/images/${item.image}" 
                         alt="${item.name}" 
                         class="food-img"
                         onerror="this.src='https://via.placeholder.com/200'"/>
                </div>
                <div class="card-body">
                    <h3 class="food-title">${item.name}</h3>
                    <div class="price-row">
                        <div class="price-info">
                            ${oldPriceHtml}
                            <span class="new-price">${price}</span>
                        </div>
                        <button class="cart-btn-small" onclick="event.stopPropagation(); handleHomeAddToCart(${item.id}, '${item.name.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', ${item.price}, '${item.image}')">
                            <i class="fas fa-shopping-bag"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

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
      if (category === "steak") titleElement.innerText = "Món Chính";
      else if (category === "coffee") titleElement.innerText = "Coffee";
      else titleElement.innerText = "Tráng Miệng";
    }

    if (imgElement && filtered.length > 0) {
      imgElement.src = `../assets/images/${filtered[0].image}`;
    }

    listContainer.innerHTML = filtered
      .map((item) => {
        const price = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.price);
        return `
                <div class="menu-item menu-item-row">
                     <div class="menu-item-content">
                        <span class="item-name menu-item-name">${item.name}</span>
                        <p class="item-desc menu-item-desc">${item.description || "Hương vị tuyệt hảo từ Sakedo"}</p>
                    </div>
                    <span class="item-price menu-item-price">${price}</span>
                </div>
            `;
      })
      .join("");
  };

  const activeTab = document.querySelector(".cat-item.active");
  if (activeTab) {
    renderList(activeTab.getAttribute("data-type"));
  }

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

function handleHomeAddToCart(id, name, price, image) {
  if (typeof window.checkLoginRequired === "function") {
    if (!window.checkLoginRequired()) return;
  }

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

  if (window.updateCartBadge) window.updateCartBadge();

  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

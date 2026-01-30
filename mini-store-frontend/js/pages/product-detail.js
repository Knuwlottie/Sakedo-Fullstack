let currentProduct = null;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    fetchProductDetail(productId);
  } else {
    alert("Không tìm thấy sản phẩm!");
    window.location.href = "menu.html";
  }
  updateCartBadge();
  initStarRating();
});

async function fetchProductDetail(id) {
  try {
    const response = await fetch(`http://localhost:8080/api/products/${id}`);
    if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
    const product = await response.json();
    currentProduct = product;
    renderProductInfo(product);
  } catch (error) {
    console.error("Lỗi:", error);
    document.getElementById("detail-name").textContent = "Lỗi tải dữ liệu";
  }
}

function renderProductInfo(product) {
  document.title = `${product.name} - Sakedo`;
  document.getElementById("detail-name").textContent = product.name;
  document.getElementById("detail-desc").textContent = product.description;

  const imgElement = document.getElementById("detail-img");
  if (imgElement) {
    let imgSrc = product.image || "";
    if (!imgSrc.startsWith("http") && !imgSrc.startsWith("data:")) {
      imgSrc = `../assets/images/${imgSrc.replace(/^.*[\\\/]/, "")}`;
    }
    imgElement.src = imgSrc;
  }

  const priceBox = document.getElementById("detail-price");
  if (priceBox) {
    let finalPrice = product.price;
    let htmlContent = "";
    if (product.discount > 0) {
      finalPrice = (product.price * (100 - product.discount)) / 100;
      currentProduct.finalPrice = finalPrice;
      htmlContent = `
        <div class="price-wrapper">
            <span class="old-price">${product.price.toLocaleString()}đ</span>
            <span class="current-price">${finalPrice.toLocaleString()}đ</span>
            <span class="discount-badge">-${product.discount}%</span>
        </div>`;
    } else {
      currentProduct.finalPrice = product.price;
      htmlContent = `<span class="current-price">${product.price.toLocaleString()}đ</span>`;
    }
    priceBox.innerHTML = htmlContent;
  }
}

function addToCartDetail(isBuyNow) {
  if (!currentProduct) return;

  const qtyInput = document.getElementById("qty-input");
  const qty = parseInt(qtyInput.value) || 1;
  const note = document.getElementById("order-note").value;
  const priceToAdd = currentProduct.finalPrice || currentProduct.price;

  let cleanImage = currentProduct.image || "no-image.png";
  if (cleanImage.startsWith("data:")) {
    cleanImage = "no-image.png";
  } else if (!cleanImage.startsWith("http")) {
    cleanImage = cleanImage.replace(/^.*[\\\\/]/, "");
  }

  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: priceToAdd,
    originalPrice: currentProduct.price,
    image: cleanImage,
    quantity: qty,
    note: note,
  };

  if (isBuyNow) {
    const existingCart = localStorage.getItem("cart");
    if (existingCart) {
      localStorage.setItem("cart_backup", existingCart);
    }
    localStorage.setItem("cart", JSON.stringify([cartItem]));
    localStorage.setItem("buyNowMode", "true");
    window.location.href = "cart.html";
  } else {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item.id == cartItem.id);

    if (existingItem) {
      existingItem.quantity += qty;
      if (note) existingItem.note = note;
      existingItem.image = cleanImage;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    alert(`Đã thêm ${qty} phần "${currentProduct.name}" vào giỏ!`);
  }
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-count");
  badges.forEach((badge) => {
    badge.innerText = totalQty;
  });
}
function initStarRating() {
  const stars = document.querySelectorAll("#star-rating-input i");
  const ratingInput = document.getElementById("rating-value");
  if (!stars.length) return;

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const value = this.getAttribute("data-value");
      if (ratingInput) ratingInput.value = value;
      stars.forEach((s) => {
        if (s.getAttribute("data-value") <= value) s.classList.add("active");
        else s.classList.remove("active");
      });
    });
  });
}

function submitReview() {
  alert("Cảm ơn bạn đã đánh giá!");
}

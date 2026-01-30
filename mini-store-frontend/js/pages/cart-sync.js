document.addEventListener("DOMContentLoaded", function () {
  const isBuyNowMode = localStorage.getItem("buyNowMode") === "true";
  if (isBuyNowMode) {
    localStorage.removeItem("buyNowMode");
  }

  renderCart();

  const checkoutBtn = document.querySelector(".btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.onclick = handleCheckout;
  }
});

function showBuyNowNotice() {
  const cartContent = document.getElementById("cart-content");
  if (!cartContent) return;

  const notice = document.createElement("div");
  notice.id = "buy-now-notice";
  notice.className = "buy-now-notice";
  notice.innerHTML = `
    <span><i class="fas fa-info-circle"></i> Bạn đang ở chế độ <strong>Mua Ngay</strong>. Giỏ hàng cũ được lưu tạm.</span>
    <button onclick="cancelBuyNow()">
      <i class="fas fa-arrow-left"></i> Quay lại giỏ hàng
    </button>
  `;
  cartContent.insertBefore(notice, cartContent.firstChild);
}

function cancelBuyNow() {
  const backup = localStorage.getItem("cart_backup");
  if (backup) {
    localStorage.setItem("cart", backup);
    localStorage.removeItem("cart_backup");
  }
  localStorage.removeItem("buyNowMode");
  window.location.reload();
}

function getCartImageUrl(imgName) {
  if (!imgName || imgName.trim() === "" || imgName === "no-image.png") {
    return "https://placehold.co/100x100?text=Sakedo";
  }
  if (imgName.startsWith("http") || imgName.startsWith("data:")) {
    return imgName;
  }
  if (imgName.includes("/")) {
    return imgName;
  }
  return `../assets/images/${imgName}`;
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsWrapper = document.getElementById("cart-items-wrapper");
  const cartContent = document.getElementById("cart-content");
  const emptyMsg = document.getElementById("empty-cart-msg");

  if (!itemsWrapper) return;

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "block";
    return;
  } else {
    if (cartContent) cartContent.style.display = "flex";
    if (emptyMsg) emptyMsg.style.display = "none";
  }

  itemsWrapper.innerHTML = "";
  let subTotal = 0;

  cart.forEach((item, index) => {
    let price =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/\./g, "").replace("đ", ""))
        : item.price;
    subTotal += price * item.quantity;

    let imgSrc = getCartImageUrl(item.image);

    const noteHtml = item.note
      ? `<div class="item-note"><i class="fas fa-sticky-note"></i>${item.note}</div>`
      : "";

    itemsWrapper.innerHTML += `
      <div class="cart-item">
        <img src="${imgSrc}" class="item-img" onerror="this.src='https://placehold.co/100x100?text=Sakedo'">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-price item-price-bold">${price.toLocaleString()}đ</span>
          ${noteHtml}
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
        </div>
        <i class="fas fa-trash-alt btn-remove" onclick="removeItem(${index})"></i>
      </div>`;
  });

  const finalTotal = subTotal;

  if (document.getElementById("sub-total")) {
    document.getElementById("sub-total").textContent =
      subTotal.toLocaleString() + "đ";
  }
  if (document.getElementById("final-total")) {
    document.getElementById("final-total").textContent =
      finalTotal.toLocaleString() + "đ";
  }
}

async function handleCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  // Chuyển đến trang checkout để điền thông tin giao hàng
  window.location.href = "checkout.html";
}

function updateItemQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += change;
  if (cart[index].quantity < 1) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  if (confirm("Xóa món này khỏi giỏ hàng?")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}

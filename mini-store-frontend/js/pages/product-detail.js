// Biến toàn cục lưu thông tin món hiện tại
let currentProductData = null;

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    alert("Không tìm thấy sản phẩm! Quay về trang chủ.");
    window.location.href = "/index.html";
    return;
  }

  // Gọi API lấy chi tiết
  fetchProductDetail(productId);

  // Xử lý logic chọn sao đánh giá
  setupStarRating();
});

async function fetchProductDetail(id) {
  try {
    const response = await fetch(`http://localhost:8080/api/products/${id}`);
    if (!response.ok) throw new Error("Sản phẩm không tồn tại");

    const product = await response.json();
    currentProductData = product;

    // Render thông tin
    document.title = `${product.name} - Sakedo`;
    document.getElementById(
      "detail-img"
    ).src = `/assets/images/${product.image}`;
    document.getElementById("detail-name").textContent = product.name;
    document.getElementById("detail-desc").textContent = product.description;
    document.getElementById("detail-price").textContent =
      product.price.toLocaleString() + "đ";

    // Render danh sách review cũ
    renderReviews(product.reviews);
  } catch (error) {
    console.error(error);
    document.querySelector(".detail-container").innerHTML =
      "<h2>Sản phẩm không tồn tại.</h2>";
  }
}

function renderReviews(reviews) {
  const reviewContainer = document.getElementById("review-list");
  reviewContainer.innerHTML = "";

  if (reviews && reviews.length > 0) {
    // Đảo ngược để review mới nhất lên đầu (nếu cần)
    [...reviews].reverse().forEach((rv) => {
      let stars = "";
      for (let i = 0; i < rv.rating; i++)
        stars += '<i class="fas fa-star"></i>';
      // Xám các sao còn thiếu
      for (let i = rv.rating; i < 5; i++)
        stars += '<i class="fas fa-star" style="color:#ddd"></i>';

      const html = `
            <div class="review-item">
                <div class="reviewer-top">
                    <span class="reviewer-name">${rv.user}</span>
                    <span class="review-stars">${stars}</span>
                </div>
                <p class="review-text">"${rv.comment}"</p>
            </div>
        `;
      reviewContainer.innerHTML += html;
    });
  } else {
    reviewContainer.innerHTML =
      "<p style='text-align:center; color:#999'>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>";
  }
}

// --- LOGIC 1: THÊM GIỎ & MUA NGAY ---
function addToCartDetail(isBuyNow) {
  if (!currentProductData) return;

  const qtyInput = document.getElementById("qty-input");
  const noteInput = document.getElementById("order-note"); // Lấy ghi chú

  const quantity = parseInt(qtyInput.value) || 1;
  const note = noteInput.value.trim(); // Nội dung ghi chú

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Tìm xem món này (với cùng ghi chú) đã có chưa?
  // Nếu muốn phân biệt món "không hành" và món "có hành" là 2 dòng khác nhau -> check cả note
  // Ở đây mình làm đơn giản: Check ID thôi, ghi chú sẽ ghi đè hoặc nối thêm.

  const existItem = cart.find((item) => item.id === currentProductData.id);

  if (existItem) {
    existItem.quantity += quantity;
    // Cập nhật ghi chú mới nếu có
    if (note) existItem.note = note;
  } else {
    cart.push({
      id: currentProductData.id,
      name: currentProductData.name,
      price: currentProductData.price,
      image: currentProductData.image,
      quantity: quantity,
      note: note, // Lưu ghi chú vào giỏ
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // Cập nhật icon giỏ hàng
  if (window.updateCartBadge) window.updateCartBadge();

  if (isBuyNow) {
    // Nếu là Mua Ngay -> Chuyển sang trang giỏ hàng/thanh toán
    window.location.href = "/pages/cart.html";
  } else {
    // Nếu là Thêm giỏ -> Thông báo nhẹ
    alert(`Đã thêm món vào giỏ!\nGhi chú: ${note || "Không có"}`);
  }
}

// --- LOGIC 2: XỬ LÝ ĐÁNH GIÁ (REVIEW) ---
function setupStarRating() {
  const stars = document.querySelectorAll("#star-rating-input i");
  const ratingInput = document.getElementById("rating-value");

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const value = this.getAttribute("data-value");
      ratingInput.value = value;

      // Highlight các sao từ 1 đến value
      stars.forEach((s) => {
        if (s.getAttribute("data-value") <= value) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
  });
}

async function submitReview() {
  // 1. Lấy thông tin người dùng
  const userJson = localStorage.getItem("user");
  let userName = "Khách ẩn danh";
  if (userJson) {
    const user = JSON.parse(userJson);
    userName = user.name;
  } else {
    if (!confirm("Bạn chưa đăng nhập. Tiếp tục với tư cách ẩn danh?")) return;
  }

  // 2. Lấy dữ liệu từ Form
  const rating = document.getElementById("rating-value").value;
  const comment = document.getElementById("review-comment").value.trim();

  if (!comment) {
    alert("Vui lòng nhập nội dung đánh giá!");
    return;
  }

  // 3. Chuẩn bị dữ liệu gửi về Backend
  const newReview = {
    user: userName,
    rating: parseInt(rating),
    comment: comment,
  };

  try {
    // 4. GỌI API BACKEND (POST)
    // currentProductData.id là biến toàn cục đã lưu ID món ăn khi load trang
    const response = await fetch(
      `http://localhost:8080/api/products/${currentProductData.id}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      }
    );

    if (response.ok) {
      alert("Cảm ơn bạn đã đánh giá!");

      // 5. Cập nhật giao diện ngay lập tức (không cần F5)
      if (!currentProductData.reviews) currentProductData.reviews = [];
      currentProductData.reviews.push(newReview);
      renderReviews(currentProductData.reviews);

      // Reset ô nhập liệu
      document.getElementById("review-comment").value = "";
    } else {
      alert("Lỗi khi gửi đánh giá về Server!");
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    alert("Không thể kết nối đến Server.");
  }
}

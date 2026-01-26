// ============================================================
// 1. CONFIG & STATE
// ============================================================
const API_BASE_URL = "http://localhost:8080/api";
const DEFAULT_AVATAR = "../assets/images/logo.png";
const DEFAULT_FOOD_IMG = "https://placehold.co/60?text=Food";

let isEditing = false;
let tempAvatarBase64 = "";
let allOrders = [];

// ============================================================
// 2. INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", async function () {
  const localUser = getLocalUser();

  if (!localUser) {
    window.location.href = "auth.html";
    return;
  }

  setupActionHandler();
  setupAvatarUpload();
  setupModalLogic();

  if (localUser.role === "guest") {
    renderGuestProfile(localUser);
  } else {
    await Promise.all([loadProfileData(), loadOrderHistory()]);
  }
});

// ============================================================
// 3. UTILS & HELPERS
// ============================================================
function getLocalUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function getCurrentUserId() {
  const user = getLocalUser();
  return user?.id || user?._id || localStorage.getItem("currentUserId");
}

function getImageUrl(imgName) {
  if (!imgName || imgName.trim() === "") return DEFAULT_AVATAR;
  if (imgName.startsWith("http") || imgName.startsWith("data:")) return imgName;
  return `../assets/images/${imgName.split("/").pop()}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount || 0) + "đ";
}

function setTextValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

function getMapLink(userAddress) {
  const storeAddr = "70 Tô Ký, Tân Chánh Hiệp, Quận 12, Hồ Chí Minh";
  const destination = userAddress || "Hồ Chí Minh";
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(storeAddr)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

function getOrderStatusConfig(status) {
  const config = {
    0: {
      width: "33%",
      badgeBg: "#fff9c4",
      badgeColor: "#fbc02d",
      text: "Chờ xác nhận",
      activeStep: 2,
    },
    1: {
      width: "66%",
      badgeBg: "#e3f2fd",
      badgeColor: "#1976d2",
      text: "Bếp đang nấu",
      activeStep: 3,
    },
    2: {
      width: "90%",
      badgeBg: "#e8f5e9",
      badgeColor: "#388e3c",
      text: "Đang giao",
      activeStep: 4,
    },
    3: {
      width: "100%",
      badgeBg: "#2e7d32",
      badgeColor: "#fff",
      text: "Hoàn thành",
      activeStep: 5,
    },
    4: {
      width: "0%",
      badgeBg: "#ffebee",
      badgeColor: "#c62828",
      text: "Đã hủy",
      activeStep: 0,
    },
  };
  return config[status] || config[0];
}

// ============================================================
// 4. LOGIC RIÊNG CHO KHÁCH (GUEST MODE)
// ============================================================
function renderGuestProfile(guestUser) {
  setTextValue("profile-name", guestUser.name);
  setTextValue("profile-email", "Chưa đăng ký");
  setTextValue("profile-phone", "---");
  setTextValue("profile-address", "---");

  const heroName = document.querySelector(".profile-hero-name");
  if (heroName) heroName.textContent = guestUser.name;

  const avatarImg = document.getElementById("profile-avatar-img");
  if (avatarImg) avatarImg.src = "../assets/images/logo.png";

  const btnEdit = document.getElementById("btn-profile-action");
  if (btnEdit) {
    btnEdit.innerHTML = "Đăng ký thành viên ngay";
    btnEdit.onclick = () => (window.location.href = "auth.html");
  }

  const activeContainer = document.getElementById("active-order-list");
  if (activeContainer) {
    activeContainer.innerHTML = `
            <div style="text-align:center; padding:40px; color:#666; background:#f9f9f9; border-radius:10px;">
                <i class="fas fa-user-secret" style="font-size: 40px; margin-bottom: 15px; color:#d8b26e;"></i>
                <p>Bạn đang ở chế độ <strong>Khách tham quan</strong>.</p>
                <p>Khách không có lịch sử đơn hàng.</p>
            </div>
        `;
  }
}

// ============================================================
// 5. DATA FETCHING (MEMBER)
// ============================================================
async function loadProfileData() {
  const localUser = getLocalUser();
  if (!localUser?.email) return;

  try {
    const res = await fetch(`${API_BASE_URL}/users/email/${localUser.email}`);
    if (!res.ok) throw new Error("User not found");

    const userData = await res.json();
    localStorage.setItem("currentUserId", userData.id || userData._id);

    setTextValue("profile-name", userData.name || userData.fullName);
    setTextValue("profile-email", userData.email);
    setTextValue("profile-phone", userData.phone);
    setTextValue("profile-address", userData.address);

    const heroName = document.querySelector(".profile-hero-name");
    if (heroName) heroName.textContent = userData.name || userData.fullName;

    const avatarImg = document.getElementById("profile-avatar-img");
    if (avatarImg) {
      avatarImg.src =
        userData.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=d8b26e&color=fff`;
    }
  } catch (e) {
    console.error("Lỗi tải profile:", e);
  }
}

async function loadOrderHistory() {
  const userId = getCurrentUserId();
  const activeContainer = document.getElementById("active-order-list");
  if (!userId || !activeContainer) return;

  try {
    activeContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#999;"><i class="fas fa-spinner fa-spin"></i> Đang tải đơn hàng...</div>`;

    const res = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
    if (!res.ok) throw new Error("Lỗi API");

    allOrders = (await res.json()).reverse();
    const activeOrders = allOrders.filter((o) => [0, 1, 2].includes(o.status));
    renderOrderList(activeOrders, activeContainer, false);
  } catch (e) {
    activeContainer.innerHTML = `<p style="text-align:center; color:#777;">Chưa có đơn hàng nào.</p>`;
  }
}

// ============================================================
// 6. RENDERING LOGIC
// ============================================================

function renderOrderItemsHtml(items) {
  if (!items || items.length === 0) return "";
  return items
    .map((item) => {
      const imgPath = getImageUrl(item.image);
      return `
      <div class="order-item-detail">
          <div class="item-info-group">
              <img src="${imgPath}" class="item-img-thumb" onerror="this.src='${DEFAULT_FOOD_IMG}'">
              <div>
                  <div class="item-name">${item.productName}</div>
                  <div class="item-qty">Số lượng: x${item.quantity}</div>
              </div>
          </div>
          <div class="item-price">${formatCurrency(item.price)}</div>
      </div>`;
    })
    .join("");
}

function renderOrderList(orders, container, isHistoryMode) {
  if (orders.length === 0) {
    const msg = isHistoryMode
      ? "Bạn chưa có đơn hàng nào trong lịch sử."
      : "Hiện không có đơn hàng nào đang xử lý.";
    container.innerHTML = `<div style="text-align:center; padding:30px; color:#777;">${msg}</div>`;
    return;
  }

  container.innerHTML = "";

  const html = orders
    .map((order) => {
      const statusConfig = getOrderStatusConfig(order.status);
      const isCancel = order.status === 4;

      // Danh sách icon chuẩn
      const steps = ["file-invoice", "utensils", "motorcycle", "house"];

      const timelineHtml = steps
        .map((icon, index) => {
          let className = "";
          if (order.status === 3) className = "completed";
          else if (index + 1 < statusConfig.activeStep) className = "completed";
          else if (index + 1 === statusConfig.activeStep) className = "active";
          return `<div class="timeline-step ${className}"><i class="fas fa-${icon}"></i></div>`;
        })
        .join("");

      let actionBtn = "";
      if (!isHistoryMode && order.status === 0) {
        actionBtn = `<button onclick="cancelOrder('${order.id}')" class="btn-cancel-order"><i class="fas fa-times-circle"></i> Hủy Đơn</button>`;
      }

      const itemsHtml = renderOrderItemsHtml(order.items);
      const dateStr = new Date(order.createdAt).toLocaleString("vi-VN");
      const userAddress = order.customerAddress || "Địa chỉ chưa cập nhật";
      const mapLink = getMapLink(userAddress);

      return `
      <div class="order-card" style="border:1px solid ${isHistoryMode ? "#eee" : "#d8b26e"};">
          <div class="order-header">
              <div>
                  <div class="order-code">#${order.id.slice(-6).toUpperCase()}</div>
                  <div class="order-time">${dateStr}</div>
              </div>
              <div>
                  <span class="status-badge" style="background:${statusConfig.badgeBg}; color:${statusConfig.badgeColor};">
                      ${statusConfig.text}
                  </span>
              </div>
          </div>

          <div class="order-body">
              <div class="order-timeline" ${isCancel ? 'style="opacity:0.5; filter:grayscale(1)"' : ""}>
                  <div class="timeline-progress-bar" style="width:${statusConfig.width}"></div>
                  ${timelineHtml}
              </div>
              <div class="order-items-container">${itemsHtml}</div>
          </div>

          <div class="order-footer">
              <div class="order-total-row">
                  <div style="display:flex; align-items:center; gap:10px;">
                      <span class="total-label">Tổng cộng:</span>
                      <span class="total-price">${formatCurrency(order.totalAmount)}</span>
                  </div>
                  ${actionBtn}
              </div>
              
              <div class="delivery-route-box">
                  <div class="route-row">
                      <div class="route-icon-box"><i class="fas fa-store"></i></div>
                      <div class="route-info">
                          <h4>Cửa hàng</h4>
                          <p>Sakedo Store - 70 Tô Ký, Q.12, TP.HCM</p>
                      </div>
                  </div>
                  <div class="route-row">
                      <div class="route-icon-box"><i class="fas fa-map-marker-alt"></i></div>
                      <div class="route-info">
                          <h4>Nhận hàng</h4>
                          <p>${userAddress}</p>
                          <a href="${mapLink}" target="_blank" style="font-size:0.85rem; color:#d8b26e; text-decoration:none; margin-top:5px; display:inline-flex; align-items:center; gap:5px; font-weight:700;">
                              <i class="fas fa-directions"></i> Chỉ đường từ quán đến đây
                          </a>
                      </div>
                  </div>
              </div>
          </div>
      </div>`;
    })
    .join("");

  container.insertAdjacentHTML("beforeend", html);
}

// ============================================================
// 7. ACTION HANDLERS (ĐÃ SỬA: CẬP NHẬT HEADER NGAY LẬP TỨC)
// ============================================================
function openHistoryModal() {
  const historyModal = document.getElementById("history-modal");
  const historyContainer = document.getElementById("history-list-container");

  const historyOrders = allOrders.filter((o) => [3, 4].includes(o.status));
  renderOrderList(historyOrders, historyContainer, true);
  historyModal.style.display = "flex";
}

async function cancelOrder(orderId) {
  if (!confirm("Bạn có chắc muốn HỦY đơn hàng này?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "PUT",
    });
    if (res.ok) {
      alert("Đã hủy đơn thành công!");
      loadOrderHistory();
    } else {
      alert("Không thể hủy đơn này!");
    }
  } catch (e) {
    alert("Lỗi kết nối!");
  }
}

function setupModalLogic() {
  const passModal = document.getElementById("password-modal");
  const histModal = document.getElementById("history-modal");

  const bindClick = (id, handler) => {
    const el = document.getElementById(id);
    if (el) el.onclick = handler;
  };

  bindClick(
    "btn-open-password-modal",
    () => (passModal.style.display = "flex"),
  );
  bindClick("close-password-modal", () => (passModal.style.display = "none"));
  bindClick("btn-cancel-pass", () => (passModal.style.display = "none"));

  bindClick("btn-view-history", (e) => {
    e.preventDefault();
    openHistoryModal();
  });
  bindClick("close-history-modal", () => (histModal.style.display = "none"));

  window.onclick = (e) => {
    if (e.target == passModal) passModal.style.display = "none";
    if (e.target == histModal) histModal.style.display = "none";
  };
}

function setupAvatarUpload() {
  const trigger = document.getElementById("btn-trigger-upload");
  const input = document.getElementById("file-upload-input");
  const img = document.getElementById("profile-avatar-img");
  if (!trigger || !input) return;

  trigger.onclick = () => input.click();
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target.result;
      tempAvatarBase64 = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
}

function setupActionHandler() {
  const btn = document.getElementById("btn-profile-action");
  const inputs = [
    document.getElementById("profile-name"),
    document.getElementById("profile-phone"),
    document.getElementById("profile-address"),
  ];
  const uploadBtn = document.getElementById("btn-trigger-upload");
  if (!btn) return;

  const localUser = getLocalUser();
  if (localUser && localUser.role === "guest") {
    return;
  }

  btn.onclick = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      isEditing = true;
      inputs.forEach((i) => (i.disabled = false));
      inputs[0].focus();
      if (uploadBtn) uploadBtn.style.display = "flex";
      btn.innerHTML = '<i class="fas fa-save"></i> Lưu lại';
      btn.style.background = "#d8b26e";
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) return;

    const data = {
      name: inputs[0].value,
      phone: inputs[1].value,
      address: inputs[2].value,
    };
    if (tempAvatarBase64) data.avatar = tempAvatarBase64;

    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lưu...';
      const res = await fetch(`${API_BASE_URL}/users/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // --- 🔥 PHẦN SỬA ĐỂ CẬP NHẬT HEADER NGAY LẬP TỨC 🔥 ---

        // 1. Cập nhật LocalStorage
        const currentUser = getLocalUser();
        const updatedUser = {
          ...currentUser,
          name: data.name,
          phone: data.phone,
          address: data.address,
          avatar: tempAvatarBase64 || currentUser.avatar, // Nếu có ảnh mới thì dùng, không thì giữ cũ
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // 2. Tìm ảnh và tên trên HEADER để đổi luôn (Force Update)
        const headerAvatarImg = document.querySelector(
          ".user-dropdown .user-avatar img",
        );
        if (headerAvatarImg) {
          headerAvatarImg.src = updatedUser.avatar;
        }

        const headerNameSpan = document.querySelector(
          ".user-dropdown .user-name",
        );
        if (headerNameSpan) {
          // Lấy tên ngắn gọn
          const shortName = updatedUser.name.trim().split(" ").pop();
          headerNameSpan.textContent = shortName;
        }

        alert("Cập nhật thông tin thành công!");

        // 3. Reset form
        isEditing = false;
        inputs.forEach((i) => (i.disabled = true));
        if (uploadBtn) uploadBtn.style.display = "none";
        btn.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa';
        btn.style.background = "#333";
      } else {
        alert("Lỗi cập nhật!");
        btn.innerHTML = '<i class="fas fa-save"></i> Lưu lại';
      }
    } catch (err) {
      alert("Lỗi kết nối!");
      btn.innerHTML = '<i class="fas fa-save"></i> Lưu lại';
    }
  };
}

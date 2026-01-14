// CẤU HÌNH API
const API_BASE = "http://localhost:8080/api";
// Giả định User ID = 1 (Sau này bạn lấy từ token đăng nhập hoặc localStorage)
const USER_ID = 1;

document.addEventListener("DOMContentLoaded", function () {
  loadUserProfile(); // Chỉ chạy hàm lấy thông tin user
  initProfileEvents(); // Khởi tạo các sự kiện nút bấm
});

// =================================================
// 1. GỌI API LẤY THÔNG TIN USER (GET)
// =================================================
async function loadUserProfile() {
  try {
    // --- CÁCH 1: DÙNG MOCK DATA (Để test giao diện khi chưa có Backend) ---
    // const user = {
    //   fullName: "Huỳnh Lê Khả Như",
    //   email: "khanhu@example.com",
    //   phone: "0909123456",
    //   address: "KTX Khu B, ĐHQG TP.HCM",
    //   avatar: "avata1.png" // Tên file ảnh trong thư mục assets
    // };

    // --- CÁCH 2: GỌI API THẬT (Khi Backend đã chạy) ---
    // Bạn bỏ comment đoạn dưới này để chạy thật nhé:
    const response = await fetch(`${API_BASE}/users/${USER_ID}`);
    if (!response.ok) throw new Error("Không thể lấy thông tin User");
    const user = await response.json();
    // -----------------------------------------------------------

    // Đổ dữ liệu vào các ô Input
    // Lưu ý: Đảm bảo tên biến (user.fullName...) khớp với JSON Backend trả về
    document.getElementById("input-name").value =
      user.fullName || user.name || "";
    document.getElementById("input-email").value = user.email || "";
    document.getElementById("input-phone").value =
      user.phone || user.phoneNumber || "";
    document.getElementById("input-address").value = user.address || "";

    // Xử lý ảnh đại diện
    const avatarImg = document.getElementById("user-avatar");
    if (user.avatar) {
      // Kiểm tra nếu là link online hay ảnh local
      const imgSrc = user.avatar.startsWith("http")
        ? user.avatar
        : `../assets/images/${user.avatar}`;
      avatarImg.src = imgSrc;
    }
  } catch (error) {
    console.error("Lỗi tải thông tin user:", error);
    alert("Không thể tải thông tin cá nhân. Vui lòng kiểm tra kết nối!");
  }
}

// =================================================
// 2. GỌI API CẬP NHẬT USER (PUT)
// =================================================
async function updateUserProfile() {
  // 1. Gom dữ liệu từ các ô input
  const updatedData = {
    fullName: document.getElementById("input-name").value,
    phone: document.getElementById("input-phone").value,
    address: document.getElementById("input-address").value,
    // Email thường là định danh, ít khi cho sửa ở đây, tùy logic Backend của bạn
  };

  try {
    // 2. Gọi API PUT để lưu xuống DB
    const response = await fetch(`${API_BASE}/users/${USER_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Nếu có Token bảo mật thì thêm: 'Authorization': 'Bearer ...'
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Cập nhật thất bại");
    }

    // 3. Thông báo thành công
    const result = await response.json(); // Nhận kết quả mới nhất từ server
    alert("✅ Đã cập nhật thông tin thành công!");
    return true;
  } catch (error) {
    console.error(error);
    alert("❌ Lỗi khi lưu: " + error.message);
    return false;
  }
}

// =================================================
// 3. XỬ LÝ SỰ KIỆN GIAO DIỆN (Nút Sửa/Lưu)
// =================================================
function initProfileEvents() {
  const btnEdit = document.getElementById("btn-edit-profile");
  const inputs = document.querySelectorAll(
    ".form-column input, .form-column textarea"
  );
  const avatarUpload = document.getElementById("avatar-upload");
  const charCounter = document.getElementById("char-counter");

  let isEditing = false; // Trạng thái: Đang xem hay Đang sửa

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      if (!isEditing) {
        // --- CHUYỂN SANG CHẾ ĐỘ SỬA ---
        isEditing = true;

        // Đổi nút thành "Lưu lại"
        btnEdit.innerHTML = '<i class="fas fa-save"></i> <span>Lưu lại</span>';
        btnEdit.classList.add("active"); // Thêm class để đổi màu xanh (trong CSS)

        // Mở khóa các ô input (trừ Email)
        inputs.forEach((input) => {
          if (input.id !== "input-email") input.removeAttribute("readonly");
          input.classList.add("editing"); // Thêm style viền sáng
        });

        // Hiện nút sửa ảnh & đếm ký tự
        if (avatarUpload) avatarUpload.style.display = "flex";
        if (charCounter) charCounter.style.display = "block";

        // Focus vào tên để nhập luôn
        document.getElementById("input-name").focus();
      } else {
        // --- BẤM LƯU (GỌI API) ---
        // Gọi hàm updateUserProfile và đợi kết quả
        const success = await updateUserProfile();

        if (success) {
          // Nếu lưu thành công thì mới quay về chế độ Xem
          isEditing = false;

          // Đổi nút về "Chỉnh sửa"
          btnEdit.innerHTML =
            '<i class="fas fa-edit"></i> <span>Chỉnh sửa</span>';
          btnEdit.classList.remove("active");

          // Khóa lại input
          inputs.forEach((input) => {
            input.setAttribute("readonly", true);
            input.classList.remove("editing");
          });

          if (avatarUpload) avatarUpload.style.display = "none";
          if (charCounter) charCounter.style.display = "none";
        }
      }
    });
  }

  // Tiện ích: Đếm ký tự khi nhập địa chỉ
  const addressInput = document.getElementById("input-address");
  if (addressInput && charCounter) {
    addressInput.addEventListener("input", function () {
      charCounter.textContent = `${this.value.length}/1000 ký tự`;
    });
  }
}

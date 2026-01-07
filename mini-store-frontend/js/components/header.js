document.addEventListener("DOMContentLoaded", function () {
  console.log("--> Header Component đã tải.");

  // 1. Xử lý Active Menu (Tự động bôi đậm link trang hiện tại)
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (
      href &&
      currentPath.includes(href.replace("./", "").replace("../", ""))
    ) {
      document.querySelector(".nav-link.active")?.classList.remove("active");
      link.classList.add("active");
    }
  });

  // 2. Cập nhật số lượng giỏ hàng (Demo)
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.innerText = "0";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const footerContainer = document.getElementById("footer-placeholder");

  if (footerContainer) {
    fetch("../components/footer.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không tìm thấy file footer.html");
        }
        return response.text();
      })
      .then((data) => {
        footerContainer.innerHTML = data;
      })
      .catch((error) => {
        console.error("Lỗi khi tải footer:", error);
      });
  }
});

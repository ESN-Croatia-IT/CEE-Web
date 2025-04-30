document.addEventListener("DOMContentLoaded", () => {
    const bgImages = [
      "images/header_img1.png",
      "images/header_img2.png",
      "images/header_img3.png"
    ];
  
    let index = 0;
  
    const headerBg = document.getElementById("header-bg");
  
    // Check if the element is an HTMLImageElement before accessing `src`
    if (headerBg && headerBg instanceof HTMLImageElement) {
      setInterval(() => {
        index = (index + 1) % bgImages.length;
        headerBg.classList.add("opacity-0");
  
        setTimeout(() => {
          headerBg.src = bgImages[index];
          headerBg.classList.remove("opacity-0");
        }, 300);
      }, 5000);
    }
  });
  
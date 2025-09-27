document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll(".slider");

  sliders.forEach(slider => {
    const images = slider.querySelectorAll("img");
    const prevBtn = slider.querySelector(".prev");
    const nextBtn = slider.querySelector(".next");

    let index = 0;

    function showImage(i) {
      images.forEach(img => img.classList.remove("active"));
      images[i].classList.add("active");
    }

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + images.length) % images.length;
      showImage(index);
    });

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % images.length;
      showImage(index);
    });
  });
});

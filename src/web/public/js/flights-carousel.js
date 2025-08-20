(function () {
  // Simple carousel controller for the flights day slider
  function getSlider(root) {
    return root?.querySelector(".block-flights-days-slider-items");
  }
  function scrollByItems(ul, dir) {
    if (!ul) return;
    const items = Array.from(ul.children);
    if (items.length === 0) return;
    const first = items[0];
    const gap = 10;
    const itemWidth = first.getBoundingClientRect().width + gap; // include gap
    const page = Math.max(1, Math.floor(ul.clientWidth / itemWidth));
    const nextLeft = Math.max(
      0,
      Math.min(
        ul.scrollLeft + dir * itemWidth * page,
        ul.scrollWidth - ul.clientWidth
      )
    );
    ul.scrollTo({ left: nextLeft, behavior: "smooth" });
  }
  function makeFocusable(el) {
    if (el) el.setAttribute("tabindex", "0");
  }
  function init(root) {
    const left = root.querySelector(".icon-arrow-left");
    const right = root.querySelector(".icon-arrow-right");
    const ul = getSlider(root);
    if (!ul) return;
    makeFocusable(left);
    makeFocusable(right);
    left?.addEventListener("click", () => scrollByItems(ul, -1));
    right?.addEventListener("click", () => scrollByItems(ul, 1));
    left?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollByItems(ul, -1);
      }
    });
    right?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollByItems(ul, 1);
      }
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".block-flights-days").forEach(init);
  });
})();

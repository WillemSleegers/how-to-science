// Remove Quarto's built-in citation popover from any citation
// that already has a custom quote popup via .cite-quote-wrapper
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".cite-quote-wrapper .citation").forEach(function (el) {
    var popover = bootstrap.Popover.getInstance(el);
    if (popover) popover.dispose();
    el.removeAttribute("data-bs-toggle");
    el.removeAttribute("data-bs-content");
    el.removeAttribute("data-bs-placement");
  });
});

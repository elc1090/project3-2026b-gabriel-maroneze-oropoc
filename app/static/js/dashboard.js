const menuTrigger = document.querySelector(".company-menu__trigger");
const menuPanel = document.querySelector(".company-menu__panel");
const navigationLinks = document.querySelectorAll(".sidebar-link");

if (menuTrigger && menuPanel) {
  menuTrigger.addEventListener("click", () => {
    const isOpen = menuTrigger.getAttribute("aria-expanded") === "true";

    menuTrigger.setAttribute("aria-expanded", String(!isOpen));
    menuPanel.hidden = isOpen;
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".company-menu")) {
      menuTrigger.setAttribute("aria-expanded", "false");
      menuPanel.hidden = true;
    }
  });
}

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navigationLinks.forEach((item) => {
      item.classList.remove("is-active");
      item.removeAttribute("aria-current");
    });

    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  });
});


const menuTrigger = document.querySelector(
  ".company-menu__menu-trigger",
);

const menuPanel = document.querySelector(
  ".company-menu__panel",
);


function toggleCompanyMenu() {
  if (!menuTrigger || !menuPanel) {
    return;
  }

  const menuIsOpen =
    menuTrigger.getAttribute("aria-expanded") === "true";

  menuTrigger.setAttribute(
    "aria-expanded",
    String(!menuIsOpen),
  );

  menuPanel.hidden = menuIsOpen;
}


function closeCompanyMenu() {
  if (!menuTrigger || !menuPanel) {
    return;
  }

  menuTrigger.setAttribute("aria-expanded", "false");
  menuPanel.hidden = true;
}

menuTrigger?.addEventListener(
  "click",
  toggleCompanyMenu,
);


document.addEventListener("click", (event) => {
  if (!menuTrigger || !menuPanel) {
    return;
  }

  const clickedElement = event.target;

  if (!(clickedElement instanceof Node)) {
    return;
  }

  const clickedInsideMenu =
    menuTrigger.contains(clickedElement) ||
    menuPanel.contains(clickedElement);

  if (!clickedInsideMenu) {
    closeCompanyMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCompanyMenu();
    menuTrigger?.focus();
  }
});
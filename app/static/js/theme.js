const root = document.documentElement;
const theme = localStorage.getItem("ecoavanza-theme");
root.dataset.theme = theme === "light" ? "light" : "dark";

function updateThemeControls() {
  const isDark = root.dataset.theme === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute(
      "aria-label",
      isDark ? "Ativar tema claro" : "Ativar tema escuro",
    );
    button.querySelector("[data-theme-toggle-label]").textContent = isDark
      ? "Tema claro"
      : "Tema escuro";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateThemeControls();
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      localStorage.setItem("ecoavanza-theme", nextTheme);
      updateThemeControls();
    });
  });
});

const passwordInput = document.querySelector("#senha");
const passwordToggle = document.querySelector(".password-toggle");

if (passwordInput && passwordToggle) {
  passwordToggle.addEventListener("click", () => {
    const showingPassword = passwordInput.type === "text";

    passwordInput.type = showingPassword ? "password" : "text";
    passwordToggle.setAttribute("aria-pressed", String(!showingPassword));
    passwordToggle.setAttribute(
      "aria-label",
      showingPassword ? "Mostrar contraseña" : "Ocultar contraseña",
    );
  });
}
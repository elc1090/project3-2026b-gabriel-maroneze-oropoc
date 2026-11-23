const helpContent = {
  es: {
    title: "Ayuda",
    intro: "Aquí tienes una guía rápida de las funciones disponibles.",
    close: "Cerrar ayuda",
    items: [
      ["Mi empresa", "Consulta y actualiza los datos de la empresa. En esta sección también puedes revisar el resumen del perfil y administrar las acciones del plan sostenible."],
      ["Diagnóstico", "Responde todas las preguntas seleccionando cómo se realiza cada práctica. Las respuestas se guardan automáticamente y puedes navegar entre las dimensiones."],
      ["Resultados", "Consulta la puntuación general, los resultados por dimensión, las fortalezas, las oportunidades de mejora y las recomendaciones para la empresa."],
      ["Ruta Sostenible", "En “Elegir acciones”, selecciona iniciativas; en “Organizar agenda”, programa fechas; y en “Resumen”, acompaña el estado de las actividades."],
      ["Puntos de Recogida", "Busca puntos disponibles en el mapa y encuentra lugares adecuados para entregar residuos reciclables y otros materiales."],
    ],
  },
  "pt-BR": {
    title: "Ajuda",
    intro: "Aqui está um guia rápido das funções disponíveis.",
    close: "Fechar ajuda",
    items: [
      ["Minha empresa", "Consulte e atualize os dados da empresa. Nesta seção, também é possível revisar o resumo do perfil e administrar as ações do plano sustentável."],
      ["Diagnóstico", "Responda todas as perguntas indicando como cada prática é realizada. As respostas são salvas automaticamente e você pode navegar entre as dimensões."],
      ["Resultados", "Confira a pontuação geral, os resultados por dimensão, os pontos fortes, as oportunidades de melhoria e as recomendações para a empresa."],
      ["Rota Sustentável", "Em “Escolher ações”, selecione iniciativas; em “Organizar agenda”, programe datas; e em “Resumo”, acompanhe o andamento das atividades."],
      ["Pontos de Coleta", "Procure pontos disponíveis no mapa e encontre locais adequados para entregar resíduos recicláveis e outros materiais."],
    ],
  },
};

function createHelpModal() {
  if (document.querySelector("#help-modal")) {
    return document.querySelector("#help-modal");
  }

  const modal = document.createElement("div");
  modal.id = "help-modal";
  modal.className = "help-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="help-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
      <div class="help-modal__header">
        <div>
          <h2 id="help-modal-title"></h2>
          <p id="help-modal-intro"></p>
        </div>
        <button class="help-modal__close" type="button" data-help-close aria-label="Cerrar ayuda">×</button>
      </div>
      <div class="help-modal__content" data-help-items></div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeHelpModal();
    }
  });

  modal.querySelector("[data-help-close]").addEventListener("click", closeHelpModal);
  return modal;
}

function currentHelpLanguage() {
  return document.documentElement.lang === "pt-BR" ? "pt-BR" : "es";
}

function renderHelpModal() {
  const modal = createHelpModal();
  const content = helpContent[currentHelpLanguage()];

  modal.querySelector("#help-modal-title").textContent = content.title;
  modal.querySelector("#help-modal-intro").textContent = content.intro;
  const closeButton = modal.querySelector("[data-help-close]");
  closeButton.setAttribute("aria-label", content.close);
  closeButton.title = content.close;
  modal.querySelector("[data-help-items]").innerHTML = content.items
    .map(([title, description]) => `
      <section class="help-modal__item">
        <h3>${title}</h3>
        <p>${description}</p>
      </section>
    `)
    .join("");
}

function openHelpModal() {
  const modal = createHelpModal();
  renderHelpModal();
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector("[data-help-close]").focus();
}

function closeHelpModal() {
  const modal = document.querySelector("#help-modal");
  if (!modal) {
    return;
  }

  modal.hidden = true;
  document.body.style.overflow = "";
  document.querySelector("[data-help-open]")?.focus();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector("#help-modal")?.hidden) {
    closeHelpModal();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  createHelpModal();
  renderHelpModal();

  document.querySelectorAll("[data-help-open]").forEach((button) => {
    button.addEventListener("click", openHelpModal);
  });
});

document.addEventListener("ecoavanza:language-change", renderHelpModal);

const elements = {
  loading: document.querySelector("#results-loading"),
  error: document.querySelector("#results-error"),
  errorMessage: document.querySelector("#results-error-message"),
  dashboard: document.querySelector("#results-dashboard"),
  scoreRing: document.querySelector("#score-ring"),
  overallScore: document.querySelector("#overall-score"),
  overallLevel: document.querySelector("#overall-level"),
  overallDescription: document.querySelector("#overall-description"),
  completedAt: document.querySelector("#results-completed-at"),
  dimensionResults: document.querySelector("#dimension-results-list"),
  strengths: document.querySelector("#strengths-list"),
  opportunities: document.querySelector("#opportunities-list"),
};

const dimensionIcons = {
  Ambiental: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4c-7 .2-12 3.3-12 9.2 0 3.6 2.5 5.8 5.6 5.8C19 19 20 12.2 20 4Z" />
      <path d="M4 20c2.3-4.7 5.4-7.6 10.5-10.2" />
    </svg>
  `,
  Social: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M14 20a4 4 0 0 1 7-2.6" />
    </svg>
  `,
  Econômica: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  `,
  Governança: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 9 9-5 9 5" />
      <path d="M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18" />
    </svg>
  `,
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(dateString));
}

function levelDescription(level) {
  const descriptions = {
    Inicial:
      "A empresa está começando sua jornada de sustentabilidade e possui boas oportunidades para evoluir.",
    "Em desenvolvimento":
      "A empresa já apresenta iniciativas positivas, mas ainda pode fortalecer práticas importantes.",
    Intermediário:
      "A empresa apresenta boas práticas, porém existem oportunidades de melhoria em algumas áreas.",
    Avançado:
      "A empresa demonstra práticas sustentáveis consolidadas e integradas à sua gestão.",
  };

  return descriptions[level] ?? "";
}

function renderDimensions(dimensions) {
  elements.dimensionResults.innerHTML = dimensions
    .map((dimension) => {
      const score = Math.max(0, Math.min(100, dimension.pontuacao));
      const icon = dimensionIcons[dimension.nome] ?? dimensionIcons.Ambiental;

      return `
        <div class="dimension-result">
          <span class="dimension-result__icon">${icon}</span>

          <span class="dimension-result__name">
            ${escapeHtml(dimension.nome)}
          </span>

          <div
            class="dimension-result__track"
            role="progressbar"
            aria-label="Pontuação da dimensão ${escapeHtml(dimension.nome)}"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="${score}"
          >
            <span style="width: ${score}%"></span>
          </div>

          <strong>${score}/100</strong>
        </div>
      `;
    })
    .join("");
}

function renderInsightList(listElement, items, emptyMessage) {
  if (items.length === 0) {
    listElement.innerHTML = `
      <li class="results-insight-list__empty">
        ${escapeHtml(emptyMessage)}
      </li>
    `;
    return;
  }

  listElement.innerHTML = items
    .map(
      (item) => `
        <li class="results-insight-item">
          <span class="results-insight-item__dimension">
            ${escapeHtml(item.dimensao)}
          </span>
          <span>${escapeHtml(item.pergunta)}</span>
        </li>
      `,
    )
    .join("");
}

function renderResults(data) {
  const score = Math.max(0, Math.min(100, data.pontuacao_geral));

  elements.scoreRing.style.setProperty("--score", `${score}%`);
  elements.scoreRing.setAttribute(
    "aria-label",
    `Pontuação geral: ${score} de 100`,
  );

  elements.overallScore.textContent = String(score);
  elements.overallLevel.textContent = data.nivel;
  elements.overallDescription.textContent = levelDescription(data.nivel);

  elements.completedAt.textContent = data.finalizado_em
    ? `Diagnóstico concluído em ${formatDate(data.finalizado_em)}.`
    : "";

  renderDimensions(data.dimensoes);

  renderInsightList(
    elements.strengths,
    data.fortalezas,
    "Nenhuma fortaleza foi destacada neste diagnóstico.",
  );

  renderInsightList(
    elements.opportunities,
    data.oportunidades,
    "Nenhuma oportunidade prioritária foi identificada.",
  );
}

function showError(message) {
  elements.loading.hidden = true;
  elements.dashboard.hidden = true;
  elements.error.hidden = false;
  elements.errorMessage.textContent = message;
}

async function loadResults() {
  try {
    const response = await fetch("/api/resultados/atual", {
      credentials: "same-origin",
    });

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.detail ??
          "Não foi possível carregar os resultados do diagnóstico.",
      );
    }

    const data = await response.json();

    renderResults(data);

    elements.loading.hidden = true;
    elements.dashboard.hidden = false;
  } catch (error) {
    showError(
      error.message ??
        "Não foi possível carregar os resultados do diagnóstico.",
    );
  }
}

const menuTrigger = document.querySelector(".company-menu__trigger");
const menuPanel = document.querySelector(".company-menu__panel");

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

loadResults();
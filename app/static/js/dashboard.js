const menuTrigger = document.querySelector(".company-menu__menu-trigger");
const menuPanel = document.querySelector(".company-menu__panel");
const navigationLinks = document.querySelectorAll(".sidebar-link");
const companyHomePage = document.querySelector('[data-view="minha-empresa"]');
const homeCompanyName = document.querySelector("[data-home-company-name]");
const companyDisplayName = document.querySelector("[data-company-display-name]");
const companyProfilePage = document.querySelector('[data-view="perfil-empresa"]');
const companyProfileForm = document.querySelector("[data-company-profile-form]");
const profileMessage = document.querySelector("[data-profile-message]");
const resultsPage = document.querySelector('[data-view="resultados"]');
const helpPage = document.querySelector('[data-view="ajuda"]');
const sustainabilityPage = document.querySelector('[data-view="rota-sustentavel"]');
const planTabs = document.querySelectorAll("[data-plan-tab]");
const planPanels = document.querySelectorAll("[data-plan-panel]");
const actionCatalog = document.querySelector("[data-action-catalog]");
const agendaList = document.querySelector("[data-agenda-list]");
const overviewGroups = document.querySelector("[data-overview-groups]");
const statusSummary = document.querySelector("[data-status-summary]");
const storageMessage = document.querySelector("[data-storage-message]");



const actionCategories = [
  {
    name: "Ambiental",
    actions: [
      {
        id: "environmental-energy-monitoring",
        title: "Monitorar o consumo de energia",
        description:
          "Registrar mensalmente o consumo, identificar equipamentos de maior gasto e definir metas de redução.",
      },
      {
        id: "environmental-waste-management",
        title: "Organizar a gestão de resíduos",
        description:
          "Separar os resíduos, identificar coletores e definir uma destinação adequada para cada material.",
      },
      {
        id: "environmental-water-reduction",
        title: "Reduzir o consumo de água",
        description:
          "Verificar vazamentos, acompanhar contas de água e adotar práticas de uso consciente.",
      },
      {
        id: "environmental-reuse-recycling",
        title: "Promover reutilização e reciclagem",
        description:
          "Priorizar materiais reutilizáveis, reduzir descartáveis e criar rotinas de reciclagem.",
      },
      {
        id: "environmental-impact-reduction",
        title: "Reduzir impactos ambientais",
        description:
          "Mapear fontes de poluição ou desperdício e definir medidas para diminuir seus impactos.",
      },
    ],
  },
  {
    name: "Social",
    actions: [
      {
        id: "social-training",
        title: "Capacitar a equipe",
        description:
          "Planejar treinamentos sobre sustentabilidade, segurança e boas práticas no ambiente de trabalho.",
      },
      {
        id: "social-equality",
        title: "Fortalecer igualdade e não discriminação",
        description:
          "Definir orientações para garantir respeito, oportunidades justas e inclusão na empresa.",
      },
      {
        id: "social-health-safety",
        title: "Melhorar saúde e segurança no trabalho",
        description:
          "Identificar riscos, revisar medidas de proteção e orientar os trabalhadores.",
      },
      {
        id: "social-wellbeing",
        title: "Promover bem-estar dos trabalhadores",
        description:
          "Avaliar condições de trabalho e criar ações para melhorar o clima e a qualidade de vida.",
      },
      {
        id: "social-participation",
        title: "Criar canais de escuta da equipe",
        description:
          "Coletar opiniões dos trabalhadores e considerar suas necessidades nas decisões internas.",
      },
    ],
  },
  {
    name: "Econômica",
    actions: [
      {
        id: "economic-sustainability-budget",
        title: "Destinar recursos à sustentabilidade",
        description:
          "Reservar parte do orçamento para iniciativas ambientais, sociais e de melhoria da gestão.",
      },
      {
        id: "economic-cost-control",
        title: "Controlar custos e uso de recursos",
        description:
          "Acompanhar gastos com energia, água, materiais e resíduos para reduzir desperdícios.",
      },
      {
        id: "economic-benefit-analysis",
        title: "Avaliar benefícios econômicos das iniciativas",
        description:
          "Comparar custos, economia esperada e benefícios de cada ação sustentável planejada.",
      },
      {
        id: "economic-sustainable-suppliers",
        title: "Adotar critérios para fornecedores",
        description:
          "Avaliar fornecedores considerando preço, qualidade e práticas sociais e ambientais.",
      },
      {
        id: "economic-long-term-investments",
        title: "Planejar investimentos sustentáveis",
        description:
          "Priorizar investimentos que reduzam custos e aumentem a eficiência no longo prazo.",
      },
    ],
  },
  {
    name: "Governança",
    actions: [
      {
        id: "governance-code-of-conduct",
        title: "Criar um código de conduta",
        description:
          "Registrar princípios e regras internas sobre ética, respeito e responsabilidade empresarial.",
      },
      {
        id: "governance-transparency",
        title: "Aumentar a transparência nas decisões",
        description:
          "Definir como decisões, recursos e responsabilidades serão comunicados internamente.",
      },
      {
        id: "governance-legal-compliance",
        title: "Revisar obrigações legais",
        description:
          "Criar uma rotina para verificar licenças, documentos e exigências aplicáveis à empresa.",
      },
      {
        id: "governance-responsibilities",
        title: "Definir responsáveis pelas ações sustentáveis",
        description:
          "Indicar pessoas responsáveis por acompanhar e revisar cada iniciativa do plano.",
      },
      {
        id: "governance-conflict-prevention",
        title: "Prevenir conflitos de interesse",
        description:
          "Estabelecer orientações para identificar condutas inadequadas e agir de forma ética.",
      },
    ],
  },
];

const actionById = new Map(
  actionCategories.flatMap((category) =>
    category.actions.map((action) => [action.id, { ...action, category: category.name }]),
  ),
);
const statusLabels = {
  awaiting: "Aguardando agendamento",
  in_progress: "Em processo de aplicação",
  implemented: "Implementada",
};
let planActions = [];
let activeTab = "actions";
let planSaveQueue = Promise.resolve();

function showProfileMessage(message, isError = false) {
  profileMessage.textContent = message;
  profileMessage.classList.toggle("is-error", isError);
  profileMessage.hidden = !message;
}

function getTodayString() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatProfileDate(dateString) {
  if (!dateString) {
    return "Não informado";
  }

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) {
    return "Não informado";
  }
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(year, month - 1, day),
  );
}

function renderCompanyOverview(profile = {}) {
  const defaultName = companyHomePage.dataset.defaultCompanyName;
  const companyName = profile.company_name?.trim() || defaultName;
  homeCompanyName.textContent = companyName;
  companyDisplayName.textContent = companyName;

  const displayValues = {
    company_name: profile.company_name?.trim() || "Não informado",
    owner: profile.owner?.trim() || "Não informado",
    sector: profile.sector?.trim() || "Não informado",
    employees:
      profile.employees !== undefined && profile.employees !== ""
        ? `${Number(profile.employees).toLocaleString("pt-BR")} ${Number(profile.employees) === 1 ? "funcionário" : "funcionários"}`
        : "Não informado",
    founded_year: profile.founded_year || "Não informado",
    profile_created_at: formatProfileDate(profile.profile_created_at),
  };

  Object.entries(displayValues).forEach(([fieldName, value]) => {
    const field = document.querySelector(`[data-overview-field="${fieldName}"]`);
    field.textContent = String(value);
  });
}

async function loadCompanyProfile() {
  const dateInput = companyProfileForm.elements.profile_created_at;
  dateInput.value = getTodayString();
  renderCompanyOverview();

  try {
    const response = await fetch("/api/perfil", { credentials: "same-origin" });
    if (response.status === 401) {
      window.location.assign("/");
      return;
    }
    if (!response.ok) {
      throw new Error("Não foi possível carregar o perfil da empresa.");
    }
    const data = await response.json();
    const profile = data.perfil ?? {};
    for (const fieldName of [
      "profile_created_at",
      "founded_year",
      "company_name",
      "owner",
      "employees",
      "sector",
    ]) {
      if (profile[fieldName] !== undefined && profile[fieldName] !== null) {
        companyProfileForm.elements[fieldName].value = String(profile[fieldName]);
      }
    }
    if (!profile.company_name && data.nome_empresa) {
      companyProfileForm.elements.company_name.value = data.nome_empresa;
    }
    renderCompanyOverview(profile);
  } catch (error) {
    console.error("Não foi possível carregar o perfil da empresa.", error);
    showProfileMessage(
      error.message ?? "Não foi possível carregar os dados do servidor.",
      true,
    );
  }
}

async function saveCompanyProfile(event) {
  event.preventDefault();
  const formData = new FormData(companyProfileForm);
  const profile = Object.fromEntries(formData.entries());
  profile.founded_year = Number(profile.founded_year);
  profile.employees = Number(profile.employees);

  try {
    const response = await fetch("/api/perfil", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (response.status === 401) {
      window.location.assign("/");
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail ?? "Não foi possível salvar o perfil.");
    }
    renderCompanyOverview(data.perfil);
    showProfileMessage("Informações da empresa salvas com sucesso.");
  } catch (error) {
    console.error("Não foi possível salvar o perfil da empresa.", error);
    showProfileMessage(error.message ?? "Não foi possível salvar as informações.", true);
  }
}

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

document.querySelector(".company-menu__profile-link")?.addEventListener("click", () => {
  menuTrigger?.setAttribute("aria-expanded", "false");
  if (menuPanel) {
    menuPanel.hidden = true;
  }
});

function setStorageMessage(message) {
  storageMessage.textContent = message;
  storageMessage.hidden = !message;
}

function normalizeSavedPlan(savedPlan) {
  if (!Array.isArray(savedPlan)) {
    throw new TypeError("O plano salvo não está em um formato válido.");
  }

  const seen = new Set();
  return savedPlan.filter((item) => {
    if (
      !item ||
      !actionById.has(item.id) ||
      seen.has(item.id) ||
      !Object.hasOwn(statusLabels, item.status)
    ) {
      return false;
    }

    seen.add(item.id);
    return true;
  }).map((item) => ({
    id: item.id,
    status: item.status,
    date: typeof item.date === "string" ? item.date : "",
    notes: typeof item.notes === "string" ? item.notes : "",
  }));
}

function savePlan() {
  const actions = planActions.map((action) => ({ ...action }));
  planSaveQueue = planSaveQueue
    .then(async () => {
      const response = await fetch("/api/plano", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions }),
      });
      if (response.status === 401) {
        window.location.assign("/");
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? "Não foi possível salvar o plano.");
      }
      setStorageMessage("");
    })
    .catch((error) => {
      console.error("Não foi possível salvar o plano sustentável.", error);
      setStorageMessage(error.message ?? "Não foi possível salvar as alterações.");
    });
  return planSaveQueue;
}

async function loadPlan() {
  try {
    const response = await fetch("/api/plano", { credentials: "same-origin" });
    if (response.status === 401) {
      window.location.assign("/");
      return;
    }
    if (!response.ok) {
      throw new Error("Não foi possível carregar o plano sustentável.");
    }
    const data = await response.json();
    planActions = normalizeSavedPlan(data.actions);
  } catch (error) {
    console.error("Não foi possível carregar o plano sustentável.", error);
    setStorageMessage(error.message ?? "Não foi possível carregar o plano salvo.");
  }
}

function getPlanAction(actionId) {
  return planActions.find((item) => item.id === actionId);
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function updateCounts() {
  const pendingCount = planActions.filter((item) => item.status === "awaiting").length;
  const scheduledCount = planActions.filter((item) => item.status === "in_progress").length;
  const doneCount = planActions.filter((item) => item.status === "implemented").length;
  const selectedCount = document.querySelector("[data-count-selected]");
  const pendingBadge = document.querySelector("[data-count-pending]");
  const summary = document.querySelector("[data-actions-summary]");

  selectedCount.textContent = String(planActions.length);
  pendingBadge.textContent = String(pendingCount);
  summary.textContent = `${planActions.length} ${planActions.length === 1 ? "ação selecionada" : "ações selecionadas"}`;
  return { pendingCount, scheduledCount, doneCount };
}

function renderActionCatalog() {
  actionCatalog.replaceChildren();

  actionCategories.forEach((category) => {
    const group = createElement("section", "action-category");
    const heading = createElement("h3", "action-category__title", category.name);
    const list = createElement("div", "action-category__list");
    group.append(heading, list);

    category.actions.forEach((action) => {
      const selectedAction = getPlanAction(action.id);
      const card = createElement("label", "action-card");
      const checkbox = document.createElement("input");
      const content = createElement("span", "action-card__content");
      const title = createElement("span", "action-card__title", action.title);
      const description = createElement("span", "action-card__description", action.description);

      checkbox.type = "checkbox";
      checkbox.checked = Boolean(selectedAction);
      checkbox.disabled = Boolean(selectedAction && selectedAction.status !== "awaiting");
      checkbox.setAttribute("aria-label", `Selecionar ação: ${action.title}`);
      if (checkbox.disabled) {
        card.classList.add("is-locked");
        checkbox.title = "Ações agendadas ou implementadas não podem ser removidas do plano.";
      }

      content.append(title, description);
      card.append(checkbox, content);
      list.append(card);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          planActions.push({ id: action.id, status: "awaiting", date: "", notes: "" });
        } else {
          planActions = planActions.filter((item) => item.id !== action.id);
        }
        void savePlan();
        renderPlan();
      });
    });

    actionCatalog.append(group);
  });
}

function renderAgenda() {
  agendaList.replaceChildren();
  const pendingActions = planActions.filter((item) => item.status === "awaiting");
  const scheduledActions = planActions.filter((item) => item.status === "in_progress");

  if (planActions.length === 0) {
    agendaList.append(
      createElement(
        "p",
        "plan-empty",
        "Você ainda não selecionou ações. Volte à etapa 1 para montar seu plano.",
      ),
    );
    return;
  }

  if (pendingActions.length === 0 && scheduledActions.length === 0) {
    agendaList.append(
      createElement(
        "p",
        "plan-empty",
        "Todas as ações do seu plano já foram implementadas. Consulte a visão geral para acompanhar o resultado.",
      ),
    );
    return;
  }

  if (pendingActions.length > 0) {
    agendaList.append(
      createElement("h3", "agenda-section-title", "Aguardando agendamento"),
      createElement(
        "p",
        "agenda-section-description",
        "Escolha uma data para cada ação que deseja colocar na agenda.",
      ),
    );

    pendingActions.forEach((planAction) => {
      const action = actionById.get(planAction.id);
      const card = createElement("article", "agenda-card");
      const details = createElement("div", "agenda-card__details");
      const category = createElement("p", "agenda-card__category", action.category);
      const title = createElement("h4", "agenda-card__title", action.title);
      const description = createElement("p", "agenda-card__description", action.description);
      const form = document.createElement("form");
      const dateLabel = createElement("label", "agenda-field__label", "Data da atividade");
      const dateInput = document.createElement("input");
      const notesLabel = createElement("label", "agenda-field__label", "Observações (opcional)");
      const notesInput = document.createElement("input");
      const submit = createElement("button", "primary-button", "Agendar atividade");

      form.className = "agenda-card__form";
      dateLabel.htmlFor = `date-${planAction.id}`;
      dateInput.id = `date-${planAction.id}`;
      dateInput.name = "date";
      dateInput.type = "date";
      dateInput.required = true;
      dateInput.min = getLocalDateString();
      dateInput.value = planAction.date;
      notesLabel.htmlFor = `notes-${planAction.id}`;
      notesInput.id = `notes-${planAction.id}`;
      notesInput.name = "notes";
      notesInput.type = "text";
      notesInput.maxLength = 160;
      notesInput.placeholder = "Ex.: responsável ou próximos passos";
      notesInput.value = planAction.notes;
      submit.type = "submit";
      form.append(dateLabel, dateInput, notesLabel, notesInput, submit);
      details.append(category, title, description);
      card.append(details, form);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        planAction.status = "in_progress";
        planAction.date = dateInput.value;
        planAction.notes = notesInput.value.trim();
        void savePlan();
        renderPlan();
      });
      agendaList.append(card);
    });
  }

  if (scheduledActions.length > 0) {
    agendaList.append(
      createElement("h3", "agenda-section-title agenda-section-title--spaced", "Atividades na agenda"),
    );

    scheduledActions
      .slice()
      .sort((first, second) => first.date.localeCompare(second.date))
      .forEach((planAction) => {
        const action = actionById.get(planAction.id);
        const card = createElement("article", "agenda-card agenda-card--scheduled");
        const details = createElement("div", "agenda-card__details");
        const category = createElement("p", "agenda-card__category", action.category);
        const title = createElement("h4", "agenda-card__title", action.title);
        const date = createElement("p", "agenda-card__date", formatDate(planAction.date));
        const notes = planAction.notes
          ? createElement("p", "agenda-card__description", planAction.notes)
          : null;
        const completeButton = createElement("button", "secondary-button", "Marcar implementada");

        completeButton.type = "button";
        completeButton.addEventListener("click", () => {
          planAction.status = "implemented";
          void savePlan();
          renderPlan();
        });
        details.append(category, title, date);
        if (notes) {
          details.append(notes);
        }
        card.append(details, completeButton);
        agendaList.append(card);
      });
  }
}

function formatDate(dateString) {
  if (!dateString) {
    return "Data não definida";
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    new Date(year, month - 1, day),
  );
}

function getLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderDiagnosticDimensions(container, dimensions) {
  container.replaceChildren();
  dimensions.forEach((dimension) => {
    const group = createElement("section", "overview-group");
    const heading = createElement("h3", "overview-group__title", dimension.nome);
    const summary = createElement(
      "p",
      "plan-empty",
      `${dimension.resultado}% de aproveitamento · ${dimension.respondidas}/${dimension.total_perguntas} perguntas`,
    );
    group.append(heading, summary);
    container.append(group);
  });
}

async function loadDiagnosticResults() {
  const status = document.querySelector("[data-diagnostic-status]");
  const answered = document.querySelector("[data-diagnostic-answered]");
  const score = document.querySelector("[data-diagnostic-score]");
  const progressBar = document.querySelector("[data-diagnostic-progress-bar]");
  const progressNote = document.querySelector("[data-diagnostic-progress-note]");
  const homeDimensions = document.querySelector("[data-diagnostic-dimensions]");
  const resultsStatus = document.querySelector("[data-results-status]");
  const resultsAnswered = document.querySelector("[data-results-answered]");
  const resultsScore = document.querySelector("[data-results-score]");
  const resultsDimensions = document.querySelector("[data-results-dimensions]");

  try {
    const response = await fetch("/api/diagnostico/resultados", {
      credentials: "same-origin",
    });
    if (response.status === 401) {
      window.location.assign("/");
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail ?? "Não foi possível carregar os resultados.");
    }

    const countText = `${data.respondidas} de ${data.total_perguntas}`;
    answered.textContent = countText;
    resultsAnswered.textContent = countText;
    progressBar.style.width = `${data.progresso}%`;
    progressNote.textContent = data.disponivel
      ? "Diagnóstico concluído"
      : `Progresso atual: ${data.progresso}%. Conclua o diagnóstico para ver a avaliação.`;
    status.textContent = data.disponivel ? "Diagnóstico concluído" : "Diagnóstico em andamento";
    resultsStatus.textContent = data.disponivel ? "Resultado disponível" : "Resultado ainda não disponível";
    score.textContent = data.disponivel ? `${data.resultado_geral}%` : "Pendente";
    resultsScore.textContent = data.disponivel ? `${data.resultado_geral}%` : "Pendente";
    renderDiagnosticDimensions(homeDimensions, data.dimensoes);
    renderDiagnosticDimensions(resultsDimensions, data.dimensoes);
  } catch (error) {
    console.error("Não foi possível carregar os resultados do diagnóstico.", error);
    status.textContent = "Resultados indisponíveis";
    answered.textContent = "—";
    score.textContent = "—";
    resultsStatus.textContent = error.message ?? "Resultados indisponíveis";
    resultsAnswered.textContent = "—";
    resultsScore.textContent = "—";
    progressNote.textContent = "Tente recarregar a página.";
  }
}

function renderOverview() {
  const counts = updateCounts();
  const statuses = [
    { id: "awaiting", title: "Aguardando agendamento", count: counts.pendingCount },
    { id: "in_progress", title: "Em processo de aplicação", count: counts.scheduledCount },
    { id: "implemented", title: "Ações implementadas", count: counts.doneCount },
  ];

  statusSummary.replaceChildren();
  statuses.forEach((status) => {
    const card = createElement("div", `status-card status-card--${status.id}`);
    card.append(
      createElement("span", "status-card__count", String(status.count)),
      createElement("span", "status-card__label", status.title),
    );
    statusSummary.append(card);
  });

  overviewGroups.replaceChildren();
  statuses.forEach((status) => {
    const group = createElement("section", "overview-group");
    const heading = createElement("h3", "overview-group__title", status.title);
    const list = createElement("div", "overview-group__list");
    const matchingActions = planActions.filter((item) => item.status === status.id);

    if (matchingActions.length === 0) {
      list.append(createElement("p", "plan-empty", "Nenhuma ação nesta etapa."));
    } else {
      matchingActions.forEach((planAction) => {
        const action = actionById.get(planAction.id);
        const item = createElement("article", "overview-action");
        const title = createElement("h4", "overview-action__title", action.title);
        const category = createElement("p", "overview-action__category", action.category);
        item.append(title, category);
        if (planAction.status === "in_progress") {
          item.append(createElement("p", "overview-action__date", formatDate(planAction.date)));
        } else if (planAction.status === "implemented") {
          item.append(createElement("span", "overview-action__badge", "Concluída"));
        }
        list.append(item);
      });
    }
    group.append(heading, list);
    overviewGroups.append(group);
  });
}

function renderPlan() {
  updateCounts();
  renderActionCatalog();
  renderAgenda();
  renderOverview();
}

function showTab(tabName) {
  activeTab = tabName;
  planTabs.forEach((tab) => {
    const isActive = tab.dataset.planTab === activeTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });
  planPanels.forEach((panel) => {
    panel.hidden = panel.dataset.planPanel !== activeTab;
  });
}

planTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => showTab(tab.dataset.planTab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = planTabs[(index + offset + planTabs.length) % planTabs.length];
    showTab(nextTab.dataset.planTab);
    nextTab.focus();
  });
});

document.querySelector("[data-go-agenda]")?.addEventListener("click", () => {
  showTab("agenda");
  document.querySelector('[data-plan-tab="agenda"]').focus();
});

function updateActiveNavigation() {
  const currentHash = window.location.hash || "#minha-empresa";
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === currentHash;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (sustainabilityPage) {
    sustainabilityPage.hidden = currentHash !== "#rota-sustentavel";
  }

  if (companyHomePage) {
    companyHomePage.hidden = currentHash !== "#minha-empresa";
  }

  if (companyProfilePage) {
    companyProfilePage.hidden = currentHash !== "#perfil-empresa";
  }

  if (resultsPage) resultsPage.hidden = currentHash !== "#resultados";
  if (helpPage) helpPage.hidden = currentHash !== "#ajuda";
}

if (companyProfileForm) {
  void loadCompanyProfile();
  companyProfileForm.addEventListener("submit", saveCompanyProfile);
}

if (sustainabilityPage && actionCatalog) {
  void loadPlan().then(() => {
    renderPlan();
    showTab(activeTab);
  });
}

void loadDiagnosticResults();
window.addEventListener("hashchange", updateActiveNavigation);
updateActiveNavigation();

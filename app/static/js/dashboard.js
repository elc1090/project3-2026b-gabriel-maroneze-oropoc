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
const wastePage = document.querySelector('[data-view="residuos"]');
const helpPage = document.querySelector('[data-view="ajuda"]');
const wasteForm = document.querySelector("[data-waste-form]");
const wasteMessage = document.querySelector("[data-waste-message]");
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
    name: "Gestão de resíduos",
    actions: [
      {
        id: "waste-separation",
        title: "Implantar coleta seletiva",
        description: "Disponibilizar coletores identificados e orientar a equipe.",
      },
      {
        id: "waste-destination",
        title: "Definir destino para resíduos especiais",
        description: "Mapear pontos ou empresas licenciadas para pilhas, eletrônicos e químicos.",
      },
      {
        id: "reuse-materials",
        title: "Reduzir descartáveis e reutilizar materiais",
        description: "Priorizar itens reutilizáveis e revisar o uso de materiais no dia a dia.",
      },
    ],
  },
  {
    name: "Uso da água",
    actions: [
      {
        id: "water-leaks",
        title: "Inspecionar vazamentos e consumo",
        description: "Criar uma rotina de inspeção e acompanhar as contas de água.",
      },
      {
        id: "water-efficiency",
        title: "Instalar dispositivos economizadores",
        description: "Avaliar torneiras, descargas e equipamentos de baixo consumo.",
      },
      {
        id: "rainwater",
        title: "Avaliar o aproveitamento de água da chuva",
        description: "Verificar viabilidade para usos não potáveis, como irrigação e limpeza.",
      },
    ],
  },
  {
    name: "Eficiência energética",
    actions: [
      {
        id: "led-lighting",
        title: "Substituir lâmpadas por LED",
        description: "Identificar pontos de iluminação e planejar a substituição.",
      },
      {
        id: "energy-routine",
        title: "Criar rotina para desligar equipamentos",
        description: "Orientar a equipe e definir responsáveis pelo fechamento dos espaços.",
      },
      {
        id: "ac-maintenance",
        title: "Revisar manutenção do ar-condicionado",
        description: "Programar limpeza de filtros e avaliar a eficiência dos equipamentos.",
      },
    ],
  },
  {
    name: "Compras sustentáveis",
    actions: [
      {
        id: "supplier-criteria",
        title: "Adotar critérios sustentáveis para fornecedores",
        description: "Incluir práticas ambientais e sociais na avaliação de fornecedores.",
      },
      {
        id: "low-impact-products",
        title: "Priorizar produtos reutilizáveis ou recicláveis",
        description: "Revisar itens comprados e reduzir embalagens e descartáveis.",
      },
      {
        id: "purchase-planning",
        title: "Planejar compras conforme o estoque",
        description: "Definir uma rotina de conferência para evitar excessos e desperdício.",
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

const wasteCategoryLabels = {
  organico: "Orgânico",
  reciclavel: "Reciclável",
  perigoso: "Perigoso",
  rejeito: "Rejeito",
};

async function loadWasteRecords() {
  const list = document.querySelector("[data-waste-list]");
  if (!list) return;
  try {
    const response = await fetch("/api/residuos", { credentials: "same-origin" });
    if (response.status === 401) {
      window.location.assign("/");
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail ?? "Não foi possível carregar os resíduos.");
    }
    list.replaceChildren();
    if (data.residuos.length === 0) {
      list.append(createElement("p", "plan-empty", "Nenhum resíduo registrado ainda."));
      return;
    }
    data.residuos.forEach((item) => {
      const row = createElement("article", "overview-action");
      row.append(
        createElement("h3", "overview-action__title", item.nome),
        createElement(
          "p",
          "overview-action__category",
          `${wasteCategoryLabels[item.categoria] ?? item.categoria} · ${Number(item.quantidade_kg).toLocaleString("pt-BR")} kg`,
        ),
        createElement("p", "overview-action__date", formatDate(item.criado_em.slice(0, 10))),
      );
      list.append(row);
    });
  } catch (error) {
    console.error("Não foi possível carregar os registros de resíduos.", error);
    list.replaceChildren(createElement("p", "plan-empty", error.message));
  }
}

async function submitWasteRecord(event) {
  event.preventDefault();
  const submit = wasteForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  wasteMessage.hidden = true;
  const payload = Object.fromEntries(new FormData(wasteForm).entries());
  payload.quantidade_kg = Number(payload.quantidade_kg);
  try {
    const response = await fetch("/residuos", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 401) {
      window.location.assign("/");
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail ?? "Não foi possível registrar o resíduo.");
    }
    wasteForm.reset();
    wasteMessage.textContent = "Resíduo registrado com sucesso.";
    wasteMessage.classList.remove("is-error");
    wasteMessage.hidden = false;
    await loadWasteRecords();
  } catch (error) {
    console.error("Não foi possível registrar o resíduo.", error);
    wasteMessage.textContent = error.message ?? "Não foi possível registrar o resíduo.";
    wasteMessage.classList.add("is-error");
    wasteMessage.hidden = false;
  } finally {
    submit.disabled = false;
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
  if (wastePage) wastePage.hidden = currentHash !== "#residuos";
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
void loadWasteRecords();
if (wasteForm) wasteForm.addEventListener("submit", submitWasteRecord);
window.addEventListener("hashchange", updateActiveNavigation);
updateActiveNavigation();

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
        title: "Supervisar el consumo de energía",
        description:
          "Registrar el consumo mensualmente, identificar los equipos que más consumen y fijar objetivos de reducción.",
      },
      {
        id: "environmental-waste-management",
        title: "Organizar la gestión de residuos",
        description:
          "Separar los residuos, identificar los contenedores y definir un destino adecuado para cada material.",
      },
      {
        id: "environmental-water-reduction",
        title: "Reducir el consumo de agua",
        description:
          "Revisar si hay fugas, controlar las facturas del agua y adoptar prácticas de consumo responsable.",
      },
      {
        id: "environmental-reuse-recycling",
        title: "Promover la reutilización y el reciclaje",
        description:
          "Priorizar los materiales reutilizables, reducir los productos desechables y establecer rutinas de reciclaje.",
      },
      {
        id: "environmental-impact-reduction",
        title: "Reducir los impactos ambientales",
        description:
          "Identificar las fuentes de contaminación o desperdicio y definir medidas para reducir sus impactos.",
      },
    ],
  },
  {
    name: "Social",
    actions: [
      {
        id: "social-training",
        title: "Capacitar al equipo",
        description:
          "Planificar formaciones sobre sostenibilidad, seguridad y buenas prácticas en el entorno laboral.",
      },
      {
        id: "social-equality",
        title: "Promover la igualdad y la no discriminación",
        description:
          "Establecer pautas para garantizar el respeto, la igualdad de oportunidades y la inclusión en la empresa.",
      },
      {
        id: "social-health-safety",
        title: "Mejorar la salud y la seguridad en el trabajo",
        description:
          "Identificar riesgos, revisar las medidas de protección y orientar a los trabajadores.",
      },
      {
        id: "social-wellbeing",
        title: "Promover el bienestar de los trabajadores",
        description:
          "Evaluar las condiciones laborales y crear acciones para mejorar el ambiente y la calidad de vida.",
      },
      {
        id: "social-participation",
        title: "Crear canales de escucha para el equipo",
        description:
          "Recoger las opiniones de los trabajadores y tener en cuenta sus necesidades en las decisiones internas.",
      },
    ],
  },
  {
    name: "Económica",
    actions: [
      {
        id: "economic-sustainability-budget",
        title: "Destinar recursos a la sostenibilidad",
        description:
          "Reservar parte del presupuesto para iniciativas ambientales, sociales y de mejora de la gestión.",
      },
      {
        id: "economic-cost-control",
        title: "Controlar los costos y el uso de los recursos",
        description:
          "Controlar los gastos de energía, agua, materiales y residuos para reducir el desperdicio.",
      },
      {
        id: "economic-benefit-analysis",
        title: "Evaluar los beneficios económicos de las iniciativas",
        description:
          "Comparar los costos, el ahorro previsto y los beneficios de cada acción sostenible planificada.",
      },
      {
        id: "economic-sustainable-suppliers",
        title: "Adoptar criterios para los proveedores",
        description:
          "Evaluar a los proveedores teniendo en cuenta el precio, la calidad y las prácticas sociales y ambientales.",
      },
      {
        id: "economic-long-term-investments",
        title: "Planificar inversiones sostenibles",
        description:
          "Priorizar inversiones que reduzcan los costos y aumenten la eficiencia a largo plazo.",
      },
    ],
  },
  {
    name: "Gobernanza",
    actions: [
      {
        id: "governance-code-of-conduct",
        title: "Crear un código de conducta",
        description:
          "Registrar los principios y las normas internas sobre ética, respeto y responsabilidad empresarial.",
      },
      {
        id: "governance-transparency",
        title: "Aumentar la transparencia en las decisiones",
        description:
          "Definir cómo se comunicarán internamente las decisiones, los recursos y las responsabilidades.",
      },
      {
        id: "governance-legal-compliance",
        title: "Revisar las obligaciones legales",
        description:
          "Establecer una rutina para revisar las licencias, los documentos y los requisitos aplicables a la empresa.",
      },
      {
        id: "governance-responsibilities",
        title: "Asignar responsables de las acciones sostenibles",
        description:
          "Designar a las personas responsables de supervisar y revisar cada iniciativa del plan.",
      },
      {
        id: "governance-conflict-prevention",
        title: "Prevenir conflictos de intereses",
        description:
          "Establecer pautas para identificar conductas inadecuadas y actuar de forma ética.",
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
  awaiting: "Pendiente de programación",
  in_progress: "En proceso de implementación",
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
    return "No informado";
  }

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) {
    return "No informado";
  }
  return new Intl.DateTimeFormat("es-ES").format(
    new Date(year, month - 1, day),
  );
}

function renderCompanyOverview(profile = {}) {
  const defaultName = companyHomePage.dataset.defaultCompanyName;
  const companyName = profile.company_name?.trim() || defaultName;
  homeCompanyName.textContent = companyName;
  companyDisplayName.textContent = companyName;

  const displayValues = {
    company_name: profile.company_name?.trim() || "No informado",
    owner: profile.owner?.trim() || "No informado",
    sector: profile.sector?.trim() || "No informado",
    employees:
      profile.employees !== undefined && profile.employees !== ""
        ? `${Number(profile.employees).toLocaleString("es-ES")} ${Number(profile.employees) === 1 ? "empleado" : "empleados"}`
        : "No informado",
    founded_year: profile.founded_year || "No informado",
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
      throw new Error("No se pudo cargar el perfil de la empresa.");
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
    console.error("No se pudo cargar el perfil de la empresa.", error);
    showProfileMessage(
      error.message ?? "No se pudieron cargar los datos del servidor.",
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
      throw new Error(data.detail ?? "No se pudo guardar el perfil.");
    }
    renderCompanyOverview(data.perfil);
    showProfileMessage("La información de la empresa se guardó correctamente.");
  } catch (error) {
    console.error("No se pudo guardar el perfil de la empresa.", error);
    showProfileMessage(error.message ?? "No se pudo guardar la información.", true);
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
    throw new TypeError("El plan guardado no tiene un formato válido.");
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
        throw new Error(data.detail ?? "No se pudo guardar el plan.");
      }
      setStorageMessage("");
    })
    .catch((error) => {
      console.error("No se pudo guardar el plan sostenible.", error);
      setStorageMessage(error.message ?? "No se pudieron guardar los cambios.");
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
      throw new Error("No se pudo cargar el plan sostenible.");
    }
    const data = await response.json();
    planActions = normalizeSavedPlan(data.actions);
  } catch (error) {
    console.error("No se pudo cargar el plan sostenible.", error);
    setStorageMessage(error.message ?? "No se pudo cargar el plan guardado.");
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
  summary.textContent = `${planActions.length} ${planActions.length === 1 ? "acción seleccionada" : "acciones seleccionadas"}`;
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
      checkbox.setAttribute("aria-label", `Seleccionar acción: ${action.title}`);
      if (checkbox.disabled) {
        card.classList.add("is-locked");
        checkbox.title = "Las acciones programadas o implementadas no se pueden quitar del plan.";
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
        "Aún no has seleccionado acciones. Vuelve a la etapa 1 para crear tu plan.",
      ),
    );
    return;
  }

  if (pendingActions.length === 0 && scheduledActions.length === 0) {
    agendaList.append(
      createElement(
        "p",
        "plan-empty",
        "Ya se han implementado todas las acciones de tu plan. Consulta el resumen para ver los resultados.",
      ),
    );
    return;
  }

  if (pendingActions.length > 0) {
    agendaList.append(
      createElement("h3", "agenda-section-title", "Pendientes de programación"),
      createElement(
        "p",
        "agenda-section-description",
        "Elige una fecha para cada acción que quieras añadir a la agenda.",
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
      const dateLabel = createElement("label", "agenda-field__label", "Fecha de la actividad");
      const dateInput = document.createElement("input");
      const notesLabel = createElement("label", "agenda-field__label", "Notas (opcional)");
      const notesInput = document.createElement("input");
      const submit = createElement("button", "primary-button", "Programar actividad");

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
      notesInput.placeholder = "Ej.: persona responsable o próximos pasos";
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
      createElement("h3", "agenda-section-title agenda-section-title--spaced", "Actividades programadas"),
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
        const completeButton = createElement("button", "secondary-button", "Marcar como implementada");

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
    return "Fecha no definida";
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(
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
      `${dimension.resultado}% de cumplimiento · ${dimension.respondidas}/${dimension.total_perguntas} preguntas`,
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
      throw new Error(data.detail ?? "No se pudieron cargar los resultados.");
    }

    const countText = `${data.respondidas} de ${data.total_perguntas}`;
    answered.textContent = countText;
    resultsAnswered.textContent = countText;
    progressBar.style.width = `${data.progresso}%`;
    progressNote.textContent = data.disponivel
      ? "Diagnóstico completado"
      : `Progreso actual: ${data.progresso}%. Finaliza el diagnóstico para ver la evaluación.`;
    status.textContent = data.disponivel ? "Diagnóstico completado" : "Diagnóstico en curso";
    resultsStatus.textContent = data.disponivel ? "Resultado disponible" : "Resultado aún no disponible";
    score.textContent = data.disponivel ? `${data.resultado_geral}%` : "Pendiente";
    resultsScore.textContent = data.disponivel ? `${data.resultado_geral}%` : "Pendiente";
    renderDiagnosticDimensions(homeDimensions, data.dimensoes);
    renderDiagnosticDimensions(resultsDimensions, data.dimensoes);
  } catch (error) {
    console.error("No se pudieron cargar los resultados del diagnóstico.", error);
    status.textContent = "Resultados no disponibles";
    answered.textContent = "—";
    score.textContent = "—";
    resultsStatus.textContent = error.message ?? "Resultados no disponibles";
    resultsAnswered.textContent = "—";
    resultsScore.textContent = "—";
    progressNote.textContent = "Intenta volver a cargar la página.";
  }
}

function renderOverview() {
  const counts = updateCounts();
  const statuses = [
    { id: "awaiting", title: "Pendientes de programación", count: counts.pendingCount },
    { id: "in_progress", title: "En proceso de implementación", count: counts.scheduledCount },
    { id: "implemented", title: "Acciones implementadas", count: counts.doneCount },
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
      list.append(createElement("p", "plan-empty", "No hay acciones en esta etapa."));
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
          item.append(createElement("span", "overview-action__badge", "Completada"));
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

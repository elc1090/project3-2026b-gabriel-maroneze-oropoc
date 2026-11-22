const menuTrigger = document.querySelector(
  ".company-menu__menu-trigger",
);

const menuPanel = document.querySelector(
  ".company-menu__panel",
);

const openPointFormButton = document.querySelector(
  "[data-open-point-form]",
);

const pointFormPanel = document.querySelector(
  "[data-point-form-panel]",
);

const pointForm = document.querySelector(
  "[data-point-form]",
);

const cancelPointFormButton = document.querySelector(
  "[data-cancel-point-form]",
);

const pointMaterialsContainer = document.querySelector(
  "[data-point-materials]",
);

const pointFormMessage = document.querySelector(
  "[data-point-form-message]",
);

const mapContainer = document.querySelector(
  "[data-collection-map]",
);

const mapStatus = document.querySelector(
  "[data-collection-map-status]",
);

const collectionPointsContainer = document.querySelector(
  "[data-collection-points]",
);

const collectionPointsStatus = document.querySelector(
  "[data-collection-points-status]",
);

const DEFAULT_MAP_CENTER = [-29.9027, -71.252];
const DEFAULT_MAP_ZOOM = 11;

let collectionMap = null;
let markersLayer = null;
let markersByPointId = new Map();

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

function setPointFormMessage(message, isError = false) {
  if (!pointFormMessage) {
    return;
  }

  pointFormMessage.textContent = message;
  pointFormMessage.hidden = !message;

  pointFormMessage.classList.toggle(
    "profile-form-message--error",
    isError,
  );
}

function setMapStatus(message, isError = false) {
  if (!mapStatus) {
    return;
  }

  mapStatus.textContent = message;

  mapStatus.classList.toggle(
    "collection-map-section__status--error",
    isError,
  );
}

function setCollectionPointsStatus(message, isError = false) {
  if (!collectionPointsStatus) {
    return;
  }

  collectionPointsStatus.textContent = message;

  collectionPointsStatus.classList.toggle(
    "collection-points-list__status--error",
    isError,
  );
}

function openPointForm() {
  if (!pointFormPanel || !openPointFormButton) {
    return;
  }

  pointFormPanel.hidden = false;
  openPointFormButton.setAttribute("aria-expanded", "true");

  pointFormPanel.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  document.querySelector("#point-name")?.focus();
}

function closePointForm() {
  if (!pointFormPanel || !openPointFormButton) {
    return;
  }

  pointFormPanel.hidden = true;
  openPointFormButton.setAttribute("aria-expanded", "false");

  pointForm?.reset();
  setPointFormMessage("");

  openPointFormButton.focus();
}

function createMaterialOption(material) {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  const text = document.createElement("span");

  label.className = "collection-material-option";

  checkbox.type = "checkbox";
  checkbox.name = "materiais_ids";
  checkbox.value = String(material.id);

  text.textContent = material.nome;

  label.append(checkbox, text);

  return label;
}

function initializeMap() {
  if (!mapContainer || typeof L === "undefined") {
    setMapStatus(
      "No se pudo cargar la biblioteca del mapa.",
      true,
    );

    return;
  }

  collectionMap = L.map("collection-points-map").setView(
    DEFAULT_MAP_CENTER,
    DEFAULT_MAP_ZOOM,
  );

  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  ).addTo(collectionMap);

  markersLayer = L.layerGroup().addTo(collectionMap);
}

function getMaterialNames(point) {
  if (!Array.isArray(point.materiais)) {
    return [];
  }

  return point.materiais.map((material) => {
    if (typeof material === "string") {
      return material;
    }

    return material.nome;
  });
}

function formatTime(time) {
  if (!time) {
    return null;
  }

  return String(time).slice(0, 5);
}

function formatSchedule(point) {
  if (point.horario_descripcion) {
    return point.horario_descripcion;
  }

  const openingTime = formatTime(point.horario_abertura);
  const closingTime = formatTime(point.horario_fechamento);

  if (openingTime && closingTime) {
    return `${openingTime} - ${closingTime}`;
  }

  if (openingTime) {
    return `Desde las ${openingTime}`;
  }

  if (closingTime) {
    return `Hasta las ${closingTime}`;
  }

  return "Horario no informado";
}

function createPopupContent(point) {
  const container = document.createElement("div");
  const title = document.createElement("strong");
  const address = document.createElement("p");
  const operator = document.createElement("p");
  const materials = document.createElement("p");

  title.textContent = point.nome;
  address.textContent = point.endereco;

  operator.textContent = point.operador
    ? `Operador: ${point.operador}`
    : "Operador no informado";

  const materialNames = getMaterialNames(point);

  materials.textContent = materialNames.length > 0
    ? `Materiales: ${materialNames.join(", ")}`
    : "Materiales no informados";

  container.append(
    title,
    address,
    operator,
    materials,
  );

  return container;
}

function renderMapPoints(points) {
  if (!collectionMap || !markersLayer) {
    return;
  }

  markersLayer.clearLayers();
  markersByPointId = new Map();

  const coordinates = [];

  points.forEach((point) => {
    const latitude = Number(point.latitude);
    const longitude = Number(point.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    const marker = L.marker([latitude, longitude]);

    marker.bindPopup(createPopupContent(point));
    marker.addTo(markersLayer);

    markersByPointId.set(point.id, marker);
    coordinates.push([latitude, longitude]);
  });

  if (coordinates.length === 0) {
    collectionMap.setView(
      DEFAULT_MAP_CENTER,
      DEFAULT_MAP_ZOOM,
    );

    setMapStatus(
      "No hay puntos de recogida registrados todavía.",
    );

    return;
  }

  if (coordinates.length === 1) {
    collectionMap.setView(coordinates[0], 15);
  } else {
    collectionMap.fitBounds(
      L.latLngBounds(coordinates),
      {
        padding: [40, 40],
        maxZoom: 15,
      },
    );
  }

  setMapStatus(
    `${coordinates.length} ${
      coordinates.length === 1
        ? "punto disponible"
        : "puntos disponibles"
    }`,
  );

  window.setTimeout(() => {
    collectionMap.invalidateSize();
  }, 0);
}

function focusPointOnMap(pointId) {
  const marker = markersByPointId.get(pointId);

  if (!marker || !collectionMap || !mapContainer) {
    return;
  }

  mapContainer.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  collectionMap.setView(
    marker.getLatLng(),
    16,
    {
      animate: true,
    },
  );

  window.setTimeout(() => {
    collectionMap.invalidateSize();
    marker.openPopup();
  }, 450);
}

function createMaterialTags(point) {
  const materialNames = getMaterialNames(point);
  const list = document.createElement("ul");

  list.className = "collection-point-card__materials";

  if (materialNames.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Sin materiales informados";
    list.append(item);

    return list;
  }

  materialNames.forEach((materialName) => {
    const item = document.createElement("li");
    item.textContent = materialName;
    list.append(item);
  });

  return list;
}

function createPointCard(point) {
  const article = document.createElement("article");
  const category = document.createElement("p");
  const title = document.createElement("h3");
  const address = document.createElement("p");
  const scheduleLabel = document.createElement("span");
  const schedule = document.createElement("p");
  const operatorLabel = document.createElement("span");
  const operator = document.createElement("p");
  const description = document.createElement("p");
  const footer = document.createElement("div");
  const locateButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  article.className = "collection-point-card";
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute(
    "aria-label",
    `Mostrar ${point.nome} en el mapa`,
  );

  category.className = "collection-point-card__category";
  category.textContent = "Punto de recogida";

  title.className = "collection-point-card__title";
  title.textContent = point.nome;

  address.className = "collection-point-card__address";
  address.textContent = point.endereco;

  scheduleLabel.className = "collection-point-card__label";
  scheduleLabel.textContent = "Horario";

  schedule.className = "collection-point-card__text";
  schedule.textContent = formatSchedule(point);

  operatorLabel.className = "collection-point-card__label";
  operatorLabel.textContent = "Operador";

  operator.className = "collection-point-card__text";
  operator.textContent = point.operador || "No informado";

  description.className = "collection-point-card__description";

  if (point.descricao) {
    description.textContent = point.descricao;
  }

  footer.className = "collection-point-card__footer";

  locateButton.className = "secondary-button";
  locateButton.type = "button";
  locateButton.textContent = "Ver en el mapa";

  deleteButton.className = "collection-point-card__delete";
  deleteButton.type = "button";
  deleteButton.textContent = "Eliminar punto";

  locateButton.addEventListener("click", (event) => {
    event.stopPropagation();
    focusPointOnMap(point.id);
  });

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    void deletePoint(point, deleteButton);
  });

  article.append(
    category,
    title,
    address,
    createMaterialTags(point),
    scheduleLabel,
    schedule,
    operatorLabel,
    operator,
  );

  if (point.descricao) {
    article.append(description);
  }

  footer.append(locateButton, deleteButton);
  article.append(footer);

  article.addEventListener("click", () => {
    focusPointOnMap(point.id);
  });

  article.addEventListener("keydown", (event) => {
    if (event.target !== article) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      focusPointOnMap(point.id);
    }
  });

  return article;
}

function renderPointCards(points) {
  if (!collectionPointsContainer) {
    return;
  }

  collectionPointsContainer.replaceChildren();

  if (points.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "collection-points-list__empty";
    emptyMessage.textContent =
      "Aún no hay puntos de recogida registrados.";

    collectionPointsContainer.append(emptyMessage);

    setCollectionPointsStatus(
      "No hay puntos disponibles.",
    );

    return;
  }

  collectionPointsContainer.append(
    ...points.map(createPointCard),
  );

  setCollectionPointsStatus(
    `${points.length} ${
      points.length === 1
        ? "punto registrado"
        : "puntos registrados"
    }`,
  );
}

async function loadCollectionPoints() {
  try {
    const response = await fetch("/api/pontos", {
      credentials: "same-origin",
    });

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ??
          "No se pudieron cargar los puntos de recogida.",
      );
    }

    renderMapPoints(data.pontos);
    renderPointCards(data.pontos);
  } catch (error) {
    console.error(
      "No se pudieron cargar los puntos de recogida.",
      error,
    );

    setMapStatus(
      error.message ??
        "No se pudieron cargar los puntos de recogida.",
      true,
    );

    setCollectionPointsStatus(
      error.message ??
        "No se pudieron cargar los puntos de recogida.",
      true,
    );
  }
}

async function loadMaterials() {
  if (!pointMaterialsContainer) {
    return;
  }

  try {
    const response = await fetch("/api/materiais", {
      credentials: "same-origin",
    });

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ?? "No se pudieron cargar los materiales.",
      );
    }

    pointMaterialsContainer.replaceChildren(
      ...data.materiais.map(createMaterialOption),
    );
  } catch (error) {
    console.error("No se pudieron cargar los materiales.", error);

    pointMaterialsContainer.replaceChildren();

    const message = document.createElement("p");
    message.className = "collection-materials__loading";
    message.textContent =
      error.message ??
      "No se pudieron cargar los materiales disponibles.";

    pointMaterialsContainer.append(message);
  }
}

function optionalText(value) {
  const normalizedValue = String(value ?? "").trim();

  return normalizedValue || null;
}

function getErrorMessage(data) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.detail?.mensagem === "string") {
    return data.detail.mensagem;
  }

  return "No se pudo guardar el punto de recogida.";
}

async function savePoint(event) {
  event.preventDefault();

  if (!pointForm) {
    return;
  }

  if (!pointForm.reportValidity()) {
    return;
  }

  const formData = new FormData(pointForm);

  const materiaisIds = [
    ...pointForm.querySelectorAll(
      'input[name="materiais_ids"]:checked',
    ),
  ].map((input) => Number(input.value));

  if (materiaisIds.length === 0) {
    setPointFormMessage(
      "Selecciona al menos un material aceptado.",
      true,
    );

    return;
  }

  const payload = {
    nome: String(formData.get("nome")).trim(),
    endereco: String(formData.get("endereco")).trim(),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    horario_abertura: formData.get("horario_abertura") || null,
    horario_fechamento: formData.get("horario_fechamento") || null,
    horario_descripcion: optionalText(
      formData.get("horario_descripcion"),
    ),
    numero_contato: optionalText(
      formData.get("numero_contato"),
    ),
    operador: optionalText(formData.get("operador")),
    descricao: optionalText(formData.get("descricao")),
    materiais_ids: materiaisIds,
  };

  const submitButton = pointForm.querySelector(
    'button[type="submit"]',
  );

  submitButton.disabled = true;
  submitButton.textContent = "Guardando punto...";

  setPointFormMessage("Guardando la información del punto.");

  try {
    const response = await fetch("/api/pontos", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }

    pointForm.reset();

    setPointFormMessage(
      "Punto registrado correctamente y añadido al mapa.",
    );

    await loadCollectionPoints();
  } catch (error) {
    console.error("No se pudo registrar el punto.", error);

    setPointFormMessage(
      error.message ??
        "No se pudo guardar el punto de recogida.",
      true,
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Guardar punto";
  }
}

async function deletePoint(point, button) {
  const confirmed = window.confirm(
    `¿Deseas eliminar el punto "${point.nome}"?`,
  );

  if (!confirmed) {
    return;
  }

  button.disabled = true;
  button.textContent = "Eliminando...";

  try {
    const response = await fetch(
      `/api/pontos/${point.id}`,
      {
        method: "DELETE",
        credentials: "same-origin",
      },
    );

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ?? "No se pudo eliminar el punto.",
      );
    }

    await loadCollectionPoints();
  } catch (error) {
    console.error("No se pudo eliminar el punto.", error);

    window.alert(
      error.message ??
        "No se pudo eliminar el punto de recogida.",
    );

    button.disabled = false;
    button.textContent = "Eliminar punto";
  }
}

menuTrigger?.addEventListener("click", toggleCompanyMenu);

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

    if (pointFormPanel && !pointFormPanel.hidden) {
      closePointForm();
    }
  }
});

openPointFormButton?.addEventListener("click", openPointForm);

cancelPointFormButton?.addEventListener(
  "click",
  closePointForm,
);

pointForm?.addEventListener("submit", savePoint);

initializeMap();

void Promise.all([
  loadMaterials(),
  loadCollectionPoints(),
]);
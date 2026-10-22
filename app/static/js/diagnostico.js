const answerOptions = [
  {
    value: 0,
    title: "No se realiza",
    description: "Esta práctica aún no forma parte de la rutina de la empresa.",
  },
  {
    value: 1,
    title: "Se realiza ocasionalmente",
    description: "Se lleva a cabo en situaciones puntuales, sin regularidad.",
  },
  {
    value: 2,
    title: "Se realiza con frecuencia",
    description: "La práctica se lleva a cabo con frecuencia, pero puede mejorarse.",
  },
  {
    value: 3,
    title: "Se realiza sistemáticamente",
    description:
      "Es una práctica continua, supervisada e integrada en la gestión.",
  },
];

const importanceByDimension = {
  Ambiental:
    "Ayuda a identificar cómo utiliza la empresa los recursos naturales y reduce los impactos ambientales.",
  Social:
    "Evalúa cómo las prácticas de la empresa afectan a las personas que trabajan y se relacionan con ella.",
  Económica:
    "Muestra cómo se incorpora la sostenibilidad a la planificación y al uso de los recursos económicos.",
  Gobernanza:
    "Ayuda a comprobar cómo organiza la empresa las responsabilidades, políticas y decisiones sostenibles.",
};

let diagnosticDimensions = [];
let currentDimension = 0;
let currentQuestion = 0;
let diagnosticStatus = "em_andamento";
let isConcluding = false;
let isRestarting = false;

const answers = new Map();
const savingQuestions = new Set();

const elements = {
  dimensionList: document.querySelector("#dimension-list"),
  currentDimension: document.querySelector("#current-dimension"),
  questionCounter: document.querySelector("#question-counter"),
  questionText: document.querySelector("#question-text"),
  questionGuidance: document.querySelector("#question-guidance"),
  answerOptions: document.querySelector("#answer-options"),
  overallProgressText: document.querySelector("#overall-progress-text"),
  previousButton: document.querySelector("#previous-button"),
  restartButton: document.querySelector("#restart-button"),
  nextButton: document.querySelector("#next-button"),
  supportImportance: document.querySelector("#support-importance"),
};

function totalQuestions() {
  return diagnosticDimensions.reduce(
    (total, dimension) => total + dimension.questions.length,
    0,
  );
}

function currentQuestionData() {
  return diagnosticDimensions[currentDimension].questions[currentQuestion];
}

function countAnswersInDimension(dimensionIndex) {
  return diagnosticDimensions[dimensionIndex].questions.filter((question) =>
    answers.has(question.id),
  ).length;
}

function totalAnswers() {
  return answers.size;
}

function buildDimensions(questions) {
  const dimensionsById = new Map();

  [...questions]
    .sort((firstQuestion, secondQuestion) => {
      if (firstQuestion.ordem_dimensao !== secondQuestion.ordem_dimensao) {
        return firstQuestion.ordem_dimensao - secondQuestion.ordem_dimensao;
      }

      return firstQuestion.ordem_pergunta - secondQuestion.ordem_pergunta;
    })
    .forEach((question) => {
      if (!dimensionsById.has(question.dimensao_id)) {
        dimensionsById.set(question.dimensao_id, {
          id: question.dimensao_id,
          name: question.dimensao,
          order: question.ordem_dimensao,
          questions: [],
        });
      }

      dimensionsById.get(question.dimensao_id).questions.push({
        id: question.id,
        text: question.texto,
        order: question.ordem_pergunta,
      });
    });

  return [...dimensionsById.values()].sort(
    (firstDimension, secondDimension) =>
      firstDimension.order - secondDimension.order,
  );
}

function renderProgress() {
  const answeredQuestions = totalAnswers();
  const questionCount = totalQuestions();

  elements.overallProgressText.textContent =
    `${answeredQuestions} de ${questionCount}`;

  elements.dimensionList.innerHTML = diagnosticDimensions
    .map((dimension, index) => {
      const completed = countAnswersInDimension(index);
      const isCurrent = index === currentDimension;
      const questionTotal = dimension.questions.length;
      const isBusy = isConcluding || isRestarting;

      return `
        <li>
          <button
            class="dimension-item ${isCurrent ? "is-current" : ""}"
            type="button"
            data-dimension-index="${index}"
            aria-label="${dimension.name}: ${completed} de ${questionTotal} preguntas respondidas."
            ${isCurrent ? 'aria-current="step"' : ""}
            ${isBusy ? "disabled" : ""}
          >
            <span class="dimension-item__dot" aria-hidden="true"></span>
            <span class="dimension-item__name">${dimension.name}</span>
            <span class="dimension-item__count">${completed}/${questionTotal}</span>
          </button>
        </li>
      `;
    })
    .join("");
}

function renderQuestion() {
  const dimension = diagnosticDimensions[currentDimension];
  const question = currentQuestionData();
  const selectedAnswer = answers.get(question.id);
  const isSaving = savingQuestions.has(question.id);
  const isConcluded = diagnosticStatus === "concluido";
  const isBusy = isSaving || isConcluding || isRestarting;

  elements.currentDimension.textContent = dimension.name;
  elements.questionCounter.textContent =
    `Pregunta ${currentQuestion + 1} de ${dimension.questions.length}`;

  elements.questionText.textContent = question.text;

  elements.questionGuidance.textContent = isConcluded
    ? "Este diagnóstico ha finalizado. Las respuestas están disponibles solo para consulta."
    : "Selecciona la opción que mejor represente la situación actual de la empresa.";

  elements.supportImportance.textContent =
    importanceByDimension[dimension.name] ??
    "Ayuda a identificar oportunidades de mejora para una gestión más sostenible.";

  elements.answerOptions.innerHTML = `
    <legend>Elige una opción</legend>

    ${answerOptions
      .map((option) => {
        const isSelected = selectedAnswer === option.value;

        return `
          <label class="answer-option ${isSelected ? "is-selected" : ""}">
            <input
              type="radio"
              name="diagnostic-answer-${question.id}"
              value="${option.value}"
              ${isSelected ? "checked" : ""}
              ${isBusy || isConcluded ? "disabled" : ""}
            />

            <span class="answer-option__radio" aria-hidden="true"></span>

            <span>
              <strong>${option.title}</strong>
              <small>${option.description}</small>
            </span>
          </label>
        `;
      })
      .join("")}
  `;

  const isFirstQuestion =
    currentDimension === 0 && currentQuestion === 0;

  const isLastQuestion =
    currentDimension === diagnosticDimensions.length - 1 &&
    currentQuestion === dimension.questions.length - 1;

  elements.previousButton.disabled = isFirstQuestion || isBusy;

  elements.restartButton.hidden = !isConcluded;
  elements.restartButton.disabled = isBusy;
  elements.restartButton.textContent = isRestarting
    ? "Iniciando..."
    : "Realizar un nuevo diagnóstico";

  elements.nextButton.disabled =
    isBusy || (isConcluded && isLastQuestion);

  if (isRestarting) {
    elements.nextButton.textContent = "Iniciando...";
  } else if (isConcluding) {
    elements.nextButton.textContent = "Finalizando...";
  } else if (isConcluded && isLastQuestion) {
    elements.nextButton.textContent = "Diagnóstico completado";
  } else if (isLastQuestion) {
    elements.nextButton.textContent = "Finalizar";
  } else {
    elements.nextButton.textContent = "Siguiente pregunta";
  }
}

function render() {
  if (diagnosticDimensions.length === 0) {
    return;
  }

  renderProgress();
  renderQuestion();
}

function moveQuestion(direction) {
  const dimension = diagnosticDimensions[currentDimension];
  const nextQuestion = currentQuestion + direction;

  if (nextQuestion >= 0 && nextQuestion < dimension.questions.length) {
    currentQuestion = nextQuestion;
  } else if (
    nextQuestion === dimension.questions.length &&
    currentDimension < diagnosticDimensions.length - 1
  ) {
    currentDimension += 1;
    currentQuestion = 0;
  } else if (nextQuestion === -1 && currentDimension > 0) {
    currentDimension -= 1;
    currentQuestion =
      diagnosticDimensions[currentDimension].questions.length - 1;
  }

  render();
}

function navigateToDimension(index) {
  if (isConcluding || isRestarting) {
    return;
  }

  currentDimension = index;
  currentQuestion = 0;
  render();
}

function goToFirstUnansweredQuestion() {
  for (
    let dimensionIndex = 0;
    dimensionIndex < diagnosticDimensions.length;
    dimensionIndex += 1
  ) {
    const questionIndex = diagnosticDimensions[
      dimensionIndex
    ].questions.findIndex((question) => !answers.has(question.id));

    if (questionIndex !== -1) {
      currentDimension = dimensionIndex;
      currentQuestion = questionIndex;
      render();
      return true;
    }
  }

  return false;
}

async function responseErrorMessage(response) {
  try {
    const data = await response.json();

    if (data.detail) {
      return data.detail;
    }
  } catch {
    // La respuesta no contiene JSON.
  }

  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

async function saveAnswer(questionId, value) {
  if (
    savingQuestions.has(questionId) ||
    diagnosticStatus === "concluido" ||
    isConcluding ||
    isRestarting
  ) {
    return;
  }

  const hadPreviousAnswer = answers.has(questionId);
  const previousAnswer = answers.get(questionId);

  answers.set(questionId, value);
  savingQuestions.add(questionId);
  render();

  try {
    const response = await fetch(
      `/api/diagnostico/respostas/${questionId}`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ valor: value }),
      },
    );

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }
  } catch (error) {
    if (hadPreviousAnswer) {
      answers.set(questionId, previousAnswer);
    } else {
      answers.delete(questionId);
    }

    window.alert(
      error.message ??
        "No se pudo guardar la respuesta. Comprueba tu conexión e inténtalo de nuevo.",
    );
  } finally {
    savingQuestions.delete(questionId);
    render();
  }
}

async function concludeDiagnostic() {
  if (isConcluding || diagnosticStatus === "concluido") {
    return;
  }

  if (totalAnswers() !== totalQuestions()) {
    goToFirstUnansweredQuestion();

    window.alert(
      "Aún hay preguntas sin responder. Te hemos llevado a la siguiente pregunta pendiente.",
    );

    return;
  }

  isConcluding = true;
  render();

  try {
    const response = await fetch("/api/diagnostico/concluir", {
      method: "POST",
      credentials: "same-origin",
    });

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }

    const data = await response.json();

    diagnosticStatus = data.diagnostico.status;

    window.alert(
      "El diagnóstico ha finalizado correctamente. Las respuestas se guardaron y ya no se podrán modificar.",
    );
  } catch (error) {
    window.alert(
      error.message ??
        "No se pudo finalizar el diagnóstico. Inténtalo de nuevo.",
    );
  } finally {
    isConcluding = false;
    render();
  }
}

async function restartDiagnostic() {
  const shouldRestart = window.confirm(
    "¿Quieres iniciar un nuevo diagnóstico? El diagnóstico completado y todas las respuestas anteriores se eliminarán permanentemente.",
  );

  if (!shouldRestart) {
    return;
  }

  isRestarting = true;
  render();

  try {
    const response = await fetch("/api/diagnostico/reiniciar", {
      method: "POST",
      credentials: "same-origin",
    });

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    if (!response.ok) {
      throw new Error(await responseErrorMessage(response));
    }

    const data = await response.json();

    answers.clear();
    diagnosticStatus = data.diagnostico.status;
    currentDimension = 0;
    currentQuestion = 0;

    window.alert(
      "Se ha iniciado un nuevo diagnóstico. Se eliminaron las respuestas anteriores.",
    );
  } catch (error) {
    window.alert(
      error.message ??
        "No se pudo iniciar un nuevo diagnóstico. Inténtalo de nuevo.",
    );
  } finally {
    isRestarting = false;
    render();
  }
}

async function loadDiagnostic() {
  elements.questionText.textContent = "Cargando preguntas...";
  elements.questionGuidance.textContent =
    "Espera mientras preparamos el diagnóstico de la empresa.";
  elements.previousButton.disabled = true;
  elements.restartButton.disabled = true;
  elements.nextButton.disabled = true;

  try {
    const response = await fetch("/api/diagnostico/atual", {
      credentials: "same-origin",
    });

    if (response.status === 401) {
      window.location.assign("/");
      return;
    }

    if (!response.ok) {
      throw new Error("No se pudo cargar el diagnóstico.");
    }

    const data = await response.json();

    diagnosticDimensions = buildDimensions(data.perguntas);
    diagnosticStatus = data.diagnostico.status;

    answers.clear();

    data.respostas.forEach((answer) => {
      answers.set(answer.pergunta_id, answer.valor);
    });

    if (diagnosticDimensions.length === 0) {
      throw new Error(
        "No se encontraron preguntas activas en la base de datos.",
      );
    }

    render();
  } catch (error) {
    elements.currentDimension.textContent = "No disponible";
    elements.questionCounter.textContent = "";
    elements.questionText.textContent =
      "No se pudo cargar el diagnóstico.";
    elements.questionGuidance.textContent =
      error.message ??
      "Comprueba que la base de datos esté funcionando y vuelve a cargar la página.";

    elements.answerOptions.innerHTML = "";
    elements.previousButton.disabled = true;
    elements.restartButton.disabled = true;
    elements.nextButton.disabled = true;
  }
}

elements.answerOptions.addEventListener("change", (event) => {
  const selectedValue = Number(event.target.value);
  const question = currentQuestionData();

  saveAnswer(question.id, selectedValue);
});

elements.dimensionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dimension-index]");

  if (!button || button.disabled) {
    return;
  }

  navigateToDimension(Number(button.dataset.dimensionIndex));
});

elements.previousButton.addEventListener("click", () => {
  moveQuestion(-1);
});

elements.restartButton.addEventListener("click", () => {
  restartDiagnostic();
});

elements.nextButton.addEventListener("click", () => {
  const isLastDimension =
    currentDimension === diagnosticDimensions.length - 1;

  const isLastQuestion =
    currentQuestion ===
    diagnosticDimensions[currentDimension].questions.length - 1;

  if (!isLastDimension || !isLastQuestion) {
    moveQuestion(1);
    return;
  }

  concludeDiagnostic();
});

const menuTrigger = document.querySelector(".company-menu__trigger");
const menuPanel = document.querySelector(".company-menu__panel");

if (menuTrigger && menuPanel) {
  menuTrigger.addEventListener("click", () => {
    const isOpen = menuTrigger.getAttribute("aria-expanded") === "true";

    menuTrigger.setAttribute("aria-expanded", String(!isOpen));
    menuPanel.hidden = isOpen;
  });
}

loadDiagnostic();
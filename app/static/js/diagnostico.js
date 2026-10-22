const answerOptions = [
  {
    value: 0,
    title: "Não é realizado",
    description: "A prática ainda não faz parte da rotina da empresa.",
  },
  {
    value: 1,
    title: "É realizado ocasionalmente",
    description: "Acontece em situações pontuais, sem regularidade.",
  },
  {
    value: 2,
    title: "É realizado frequentemente",
    description: "A prática ocorre com frequência, mas pode ser aprimorada.",
  },
  {
    value: 3,
    title: "É realizado sistematicamente",
    description:
      "É uma prática contínua, acompanhada e integrada à gestão.",
  },
];

const importanceByDimension = {
  Ambiental:
    "Ajuda a identificar como a empresa utiliza recursos naturais e reduz impactos ambientais.",
  Social:
    "Avalia como as práticas da empresa impactam as pessoas que trabalham e se relacionam com ela.",
  Econômica:
    "Mostra como a sustentabilidade é incorporada ao planejamento e ao uso dos recursos econômicos.",
  Governança:
    "Ajuda a verificar como a empresa organiza responsabilidades, políticas e decisões sustentáveis.",
};

let diagnosticDimensions = [];
let currentDimension = 0;
let currentQuestion = 0;
let diagnosticStatus = "em_andamento";
let isConcluding = false;

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

      return `
        <li>
          <button
            class="dimension-item ${isCurrent ? "is-current" : ""}"
            type="button"
            data-dimension-index="${index}"
            aria-label="${dimension.name}: ${completed} de ${questionTotal} perguntas respondidas."
            ${isCurrent ? 'aria-current="step"' : ""}
            ${isConcluding ? "disabled" : ""}
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

  elements.currentDimension.textContent = dimension.name;
  elements.questionCounter.textContent =
    `Pergunta ${currentQuestion + 1} de ${dimension.questions.length}`;

  elements.questionText.textContent = question.text;

  elements.questionGuidance.textContent = isConcluded
    ? "Este diagnóstico foi concluído. As respostas estão disponíveis apenas para consulta."
    : "Selecione a alternativa que representa melhor a realidade atual da empresa.";

  elements.supportImportance.textContent =
    importanceByDimension[dimension.name] ??
    "Ajuda a identificar oportunidades de melhoria para uma gestão mais sustentável.";

  elements.answerOptions.innerHTML = `
    <legend>Escolha uma alternativa</legend>

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
              ${isSaving || isConcluded || isConcluding ? "disabled" : ""}
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

  elements.previousButton.disabled =
    isFirstQuestion || isSaving || isConcluding;

  elements.nextButton.disabled =
    isSaving || isConcluding || (isConcluded && isLastQuestion);

  if (isConcluding) {
    elements.nextButton.textContent = "Concluindo...";
  } else if (isConcluded && isLastQuestion) {
    elements.nextButton.textContent = "Diagnóstico concluído";
  } else if (isLastQuestion) {
    elements.nextButton.textContent = "Concluir";
  } else {
    elements.nextButton.textContent = "Próxima pergunta";
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
  if (isConcluding) {
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
    // A resposta não possui JSON.
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}

async function saveAnswer(questionId, value) {
  if (
    savingQuestions.has(questionId) ||
    diagnosticStatus === "concluido" ||
    isConcluding
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
        "Não foi possível salvar a resposta. Verifique sua conexão e tente novamente.",
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
      "Ainda há perguntas sem resposta. Você foi direcionado à próxima pergunta pendente.",
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
      "Diagnóstico concluído com sucesso. As respostas foram salvas e não poderão mais ser alteradas.",
    );
  } catch (error) {
    window.alert(
      error.message ??
        "Não foi possível concluir o diagnóstico. Tente novamente.",
    );
  } finally {
    isConcluding = false;
    render();
  }
}

async function loadDiagnostic() {
  elements.questionText.textContent = "Carregando perguntas...";
  elements.questionGuidance.textContent =
    "Aguarde enquanto preparamos o diagnóstico da empresa.";
  elements.previousButton.disabled = true;
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
      throw new Error("Não foi possível carregar o diagnóstico.");
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
        "Nenhuma pergunta ativa foi encontrada no banco de dados.",
      );
    }

    render();
  } catch (error) {
    elements.currentDimension.textContent = "Indisponível";
    elements.questionCounter.textContent = "";
    elements.questionText.textContent =
      "Não foi possível carregar o diagnóstico.";
    elements.questionGuidance.textContent =
      error.message ??
      "Verifique se o banco de dados está em funcionamento e recarregue a página.";

    elements.answerOptions.innerHTML = "";
    elements.previousButton.disabled = true;
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
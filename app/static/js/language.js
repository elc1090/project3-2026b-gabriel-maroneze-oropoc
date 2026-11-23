const languageRoot = document.documentElement;
const languageTranslations = {
  "Accede a tu cuenta": "Acesse sua conta",
  "Acceso al sistema": "Acessar o sistema",
  "Acceso con Google": "Acesso com o Google",
  "Acciones implementadas": "Ações implementadas",
  "Acceder al sistema": "Acessar o sistema",
  "Activar tema claro": "Ativar tema claro",
  "Activar tema oscuro": "Ativar tema escuro",
  "Actividades programadas": "Atividades agendadas",
  "Añadida al plan": "Adicionada ao plano",
  "Añadir al plan": "Adicionar ao plano",
  "Aún no has seleccionado acciones. Vuelve a la etapa 1 para crear tu plan.":
    "Você ainda não selecionou ações. Volte à etapa 1 para criar seu plano.",
  "Aún hay preguntas sin responder. Te hemos llevado a la siguiente pregunta pendiente.":
    "Ainda há perguntas sem resposta. Levamos você à próxima pergunta pendente.",
  "Aumentar la transparencia en las decisiones":
    "Aumentar a transparência nas decisões",
  "Año de creación de la empresa": "Ano de criação da empresa",
  "Año de creación de la empresa *": "Ano de criação da empresa *",
  "Cargando...": "Carregando...",
  "Cargando resultados...": "Carregando resultados...",
  "Continuar a la agenda": "Continuar para a agenda",
  "Consulta cuántas preguntas se han respondido y revisa el resultado general del diagnóstico.":
    "Consulte quantas perguntas foram respondidas e confira o resultado geral do diagnóstico.",
  "Define una fecha para cada acción seleccionada. Al programarla, aparecerá como en proceso de implementación.":
    "Defina uma data para cada ação selecionada. Ao agendá-la, ela aparecerá como em processo de implementação.",
  "Elegir acciones": "Escolher ações",
  "Encuentra lugares adecuados para entregar residuos reciclables y otros materiales.":
    "Encontre locais adequados para entregar resíduos recicláveis e outros materiais.",
  "Genera tareas prácticas según las respuestas de tu empresa.":
    "Gere tarefas práticas de acordo com as respostas da sua empresa.",
  "Generar tareas personalizadas": "Gerar tarefas personalizadas",
  "Guarda los datos del perfil y consulta las acciones elegidas, programadas e implementadas. La información queda vinculada a tu empresa.":
    "Salve os dados do perfil e consulte as ações escolhidas, agendadas e implementadas. As informações ficam vinculadas à sua empresa.",
  "Instrucciones para usar EcoAvanza.": "Instruções para usar o EcoAvanza.",
  "Los campos marcados con * son obligatorios.":
    "Os campos marcados com * são obrigatórios.",
  "Organizar agenda": "Organizar agenda",
  "Perfil y plan sostenible": "Perfil e plano sustentável",
  "Prácticas que ya contribuyen a la sostenibilidad de la empresa.":
    "Práticas que já contribuem para a sustentabilidade da empresa.",
  "Recomendaciones basadas en tu diagnóstico":
    "Recomendações baseadas no seu diagnóstico",
  "Responde las preguntas para conocer la situación actual de tu empresa.":
    "Responda às perguntas para conhecer a situação atual da sua empresa.",
  "Responde las preguntas por dimensión. Cada respuesta se guarda automáticamente; al finalizar, podrás consultarlas.":
    "Responda às perguntas por dimensão. Cada resposta é salva automaticamente; ao concluir, você poderá consultá-las.",
  "Resumen del plan": "Resumo do plano",
  "Usa al menos 8 caracteres.": "Use pelo menos 8 caracteres.",
  "Usa el correo electrónico y la contraseña de la empresa para iniciar sesión. El menú del encabezado permite cerrar la sesión.":
    "Use o e-mail e a senha da empresa para entrar. O menu do cabeçalho permite sair.",
  "Ir al diagnóstico": "Ir para o diagnóstico",
  "Oportunidades de mejora": "Oportunidades de melhoria",
  "Puntuación general": "Pontuação geral",
  "Mi empresa | EcoAvanza": "Minha empresa | EcoAvanza",
  "Diagnóstico | EcoAvanza": "Diagnóstico | EcoAvanza",
  "Iniciar sesión | EcoAvanza": "Entrar | EcoAvanza",
  "Crear cuenta | EcoAvanza": "Criar conta | EcoAvanza",
  "Puntos de Recogida | EcoAvanza": "Pontos de coleta | EcoAvanza",
  "Resultados | EcoAvanza": "Resultados | EcoAvanza",
  "Asignar responsables de las acciones sostenibles":
    "Designar responsáveis pelas ações sustentáveis",
  Ambiental: "Ambiental",
  Anterior: "Anterior",
  "Aspectos que merecen atención en la planificación sostenible.":
    "Aspectos que merecem atenção no planejamento sustentável.",
  "Avanzado": "Avançado",
  "Capacitar al equipo": "Capacitar a equipe",
  "Crear canales de escucha para el equipo":
    "Criar canais de escuta para a equipe",
  "Controlar los costos y el uso de los recursos":
    "Controlar os custos e o uso dos recursos",
  "Crear un código de conducta": "Criar um código de conduta",
  "Elige una fecha para cada acción que quieras añadir a la agenda.":
    "Escolha uma data para cada ação que deseja adicionar à agenda.",
  "Evaluar los beneficios económicos de las iniciativas":
    "Avaliar os benefícios econômicos das iniciativas",
  "Mejorar la salud y la seguridad en el trabajo":
    "Melhorar a saúde e a segurança no trabalho",
  "Planificar inversiones sostenibles": "Planejar investimentos sustentáveis",
  "Prevenir conflictos de intereses": "Prevenir conflitos de interesse",
  "Promover el bienestar de los trabajadores":
    "Promover o bem-estar dos funcionários",
  "Reducir el consumo de agua": "Reduzir o consumo de água",
  "Reducir los impactos ambientales": "Reduzir os impactos ambientais",
  "Supervisar el consumo de energía": "Monitorar o consumo de energia",
  "Organizar la gestión de residuos": "Organizar a gestão de resíduos",
  "Promover la transparencia": "Promover a transparência",
  "Promover la igualdad y la no discriminación":
    "Promover a igualdade e a não discriminação",
  "Promover la reutilización y el reciclaje":
    "Promover a reutilização e a reciclagem",
  "Destinar recursos a la sostenibilidad":
    "Destinar recursos à sustentabilidade",
  "Adoptar criterios para los proveedores":
    "Adotar critérios para fornecedores",
  "Revisar las obligaciones legales": "Revisar as obrigações legais",
  "Registrar el consumo mensualmente, identificar los equipos que más consumen y fijar objetivos de reducción.":
    "Registre o consumo mensalmente, identifique os equipamentos que mais consomem e defina metas de redução.",
  "Separar los residuos, identificar los contenedores y definir un destino adecuado para cada material.":
    "Separe os resíduos, identifique os coletores e defina um destino adequado para cada material.",
  "Revisar si hay fugas, controlar las facturas del agua y adoptar prácticas de consumo responsable.":
    "Verifique se há vazamentos, controle as contas de água e adote práticas de consumo responsável.",
  "Priorizar los materiales reutilizables, reducir los productos desechables y establecer rutinas de reciclaje.":
    "Priorize materiais reutilizáveis, reduza produtos descartáveis e estabeleça rotinas de reciclagem.",
  "Identificar las fuentes de contaminación o desperdicio y definir medidas para reducir sus impactos.":
    "Identifique as fontes de poluição ou desperdício e defina medidas para reduzir seus impactos.",
  "Planificar formaciones sobre sostenibilidad, seguridad y buenas prácticas en el entorno laboral.":
    "Planeje treinamentos sobre sustentabilidade, segurança e boas práticas no ambiente de trabalho.",
  "Establecer pautas para garantizar el respeto, la igualdad de oportunidades y la inclusión en la empresa.":
    "Estabeleça diretrizes para garantir o respeito, a igualdade de oportunidades e a inclusão na empresa.",
  "Identificar riesgos, revisar las medidas de protección y orientar a los trabajadores.":
    "Identifique riscos, revise as medidas de proteção e oriente os funcionários.",
  "Evaluar las condiciones laborales y crear acciones para mejorar el ambiente y la calidad de vida.":
    "Avalie as condições de trabalho e crie ações para melhorar o ambiente e a qualidade de vida.",
  "Recoger las opiniones de los trabajadores y tener en cuenta sus necesidades en las decisiones internas.":
    "Recolha as opiniões dos funcionários e considere suas necessidades nas decisões internas.",
  "Reservar parte del presupuesto para iniciativas ambientales, sociales y de mejora de la gestión.":
    "Reserve parte do orçamento para iniciativas ambientais, sociais e de melhoria da gestão.",
  "Controlar los gastos de energía, agua, materiales y residuos para reducir el desperdicio.":
    "Controle os gastos com energia, água, materiais e resíduos para reduzir o desperdício.",
  "Comparar los costos, el ahorro previsto y los beneficios de cada acción sostenible planificada.":
    "Compare os custos, a economia prevista e os benefícios de cada ação sustentável planejada.",
  "Evaluar a los proveedores teniendo en cuenta el precio, la calidad y las prácticas sociales y ambientales.":
    "Avalie os fornecedores considerando preço, qualidade e práticas sociais e ambientais.",
  "Priorizar inversiones que reduzcan los costos y aumenten la eficiencia a largo plazo.":
    "Priorize investimentos que reduzam custos e aumentem a eficiência a longo prazo.",
  "Registrar los principios y las normas internas sobre ética, respeto y responsabilidad empresarial.":
    "Registre os princípios e as normas internas sobre ética, respeito e responsabilidade empresarial.",
  "Definir cómo se comunicarán internamente las decisiones, los recursos y las responsabilidades.":
    "Defina como decisões, recursos e responsabilidades serão comunicados internamente.",
  "Establecer una rutina para revisar las licencias, los documentos y los requisitos aplicables a la empresa.":
    "Estabeleça uma rotina para revisar licenças, documentos e requisitos aplicáveis à empresa.",
  "Designar a las personas responsables de supervisar y revisar cada iniciativa del plan.":
    "Designe as pessoas responsáveis por acompanhar e revisar cada iniciativa do plano.",
  "Establecer pautas para identificar conductas inadecuadas y actuar de forma ética.":
    "Estabeleça diretrizes para identificar condutas inadequadas e agir de forma ética.",
  "Ayuda a comprobar cómo organiza la empresa las responsabilidades, políticas y decisiones sostenibles.":
    "Ajuda a verificar como a empresa organiza responsabilidades, políticas e decisões sustentáveis.",
  "Ayuda a identificar cómo utiliza la empresa los recursos naturales y reduce los impactos ambientales.":
    "Ajuda a identificar como a empresa utiliza os recursos naturais e reduz os impactos ambientais.",
  "Ayuda a identificar oportunidades de mejora para una gestión más sostenible.":
    "Ajuda a identificar oportunidades de melhoria para uma gestão mais sustentável.",
  "Ayuda": "Ajuda",
  "Aún no tienes una cuenta?": "Ainda não tem uma conta?",
  "Cancelar": "Cancelar",
  "Centro de ayuda": "Central de ajuda",
  "Cerrar sesión": "Sair",
  "Completa el diagnóstico antes de generar tareas personalizadas.":
    "Conclua o diagnóstico antes de gerar tarefas personalizadas.",
  "Completa el diagnóstico primero": "Conclua o diagnóstico primeiro",
  "Completa el diagnóstico para ver tu evaluación":
    "Conclua o diagnóstico para ver sua avaliação",
  "Conoce el nivel de sostenibilidad de tu empresa y las principales oportunidades de mejora.":
    "Conheça o nível de sustentabilidade da sua empresa e as principais oportunidades de melhoria.",
  "Consulta el estado de cada acción de tu empresa.":
    "Consulte o status de cada ação da sua empresa.",
  "Consulta la evaluación por dimensión y el progreso de tu empresa.":
    "Consulte a avaliação por dimensão e o progresso da sua empresa.",
  "Contacta con el equipo responsable de implementar el sistema en tu organización.":
    "Entre em contato com a equipe responsável pela implementação do sistema na sua organização.",
  "Contraseña": "Senha",
  "Correo electrónico": "E-mail",
  "Crear cuenta": "Criar conta",
  "Datos de registro": "Dados cadastrais",
  "Editar perfil de la empresa": "Editar perfil da empresa",
  "Editar información de la empresa": "Editar informações da empresa",
  "EcoAvanza — Pequeñas acciones, grandes cambios":
    "EcoAvanza — Pequenas ações, grandes mudanças",
  "Ilustración de naturaleza y sostenibilidad":
    "Ilustração de natureza e sustentabilidade",
  "DIAGNÓSTICO DE SOSTENIBILIDAD": "DIAGNÓSTICO DE SUSTENTABILIDADE",
  "RESULTADOS DEL DIAGNÓSTICO": "RESULTADOS DO DIAGNÓSTICO",
  "Área de puntos de recogida": "Área de pontos de coleta",
  "Área principal de la aplicación": "Área principal do aplicativo",
  "Navegación principal": "Navegação principal",
  "Secciones de la aplicación": "Seções do aplicativo",
  "Abrir menú de la cuenta": "Abrir menu da conta",
  "Ocultar contraseña": "Ocultar senha",
  "Ej.: persona responsable o próximos pasos":
    "Ex.: pessoa responsável ou próximos passos",
  "Ej.: Comercio, tecnología, agricultura":
    "Ex.: Comércio, tecnologia, agricultura",
  "Describe tus respuestas sobre la situación de tu empresa.":
    "Descreva suas respostas sobre a situação da sua empresa.",
  "Diagnóstico": "Diagnóstico",
  "Diagnóstico aún no realizado": "Diagnóstico ainda não realizado",
  "Diagnóstico completado": "Diagnóstico concluído",
  "Diagnóstico de la empresa": "Diagnóstico da empresa",
  "Diagnóstico de sostenibilidad": "Diagnóstico de sustentabilidade",
  "Diagnóstico en curso": "Diagnóstico em andamento",
  "Diagnóstico completado el": "Diagnóstico concluído em",
  "El diagnóstico ha finalizado correctamente. Las respuestas se guardaron y ya no se podrán modificar.":
    "O diagnóstico foi concluído. As respostas foram salvas e não poderão mais ser alteradas.",
  "El diagnóstico se ha finalizado correctamente.":
    "O diagnóstico foi concluído com sucesso.",
  "Elige acciones, organiza las actividades en la agenda y consulta la evolución de tu plan de sostenibilidad.":
    "Escolha ações, organize as atividades na agenda e acompanhe a evolução do seu plano de sustentabilidade.",
  "Elige la opción que mejor represente la práctica actual de la empresa. No hay respuestas correctas: el objetivo es reconocer oportunidades de mejora.":
    "Escolha a opção que melhor representa a prática atual da empresa. Não há respostas certas: o objetivo é reconhecer oportunidades de melhoria.",
  "Elige una fecha para cada acción seleccionada. Al programarla, aparecerá como en proceso de implementación.":
    "Defina uma data para cada ação selecionada. Ao agendá-la, ela aparecerá como em processo de implementação.",
  "Elige una opción": "Escolha uma opção",
  "En desarrollo": "Em desenvolvimento",
  "Económica": "Econômica",
  "Empresa": "Empresa",
  "Espera mientras preparamos el diagnóstico de la empresa.":
    "Aguarde enquanto preparamos o diagnóstico da empresa.",
  "Esta práctica aún no forma parte de la rutina de la empresa.":
    "Esta prática ainda não faz parte da rotina da empresa.",
  "Esta tarea ya estaba añadida al plan.": "Esta tarefa já foi adicionada ao plano.",
  "Esta tarea se añadió al plan. Ahora puedes programarla en la agenda.":
    "Esta tarefa foi adicionada ao plano. Agora você pode agendá-la.",
  "Etapa": "Etapa",
  "Etapa 1": "Etapa 1",
  "Etapa 2": "Etapa 2",
  "Etapa 3": "Etapa 3",
  "Fecha de creación del perfil": "Data de criação do perfil",
  "Fecha de creación del perfil *": "Data de criação do perfil *",
  "Fecha de la actividad": "Data da atividade",
  "Fecha no definida": "Data não definida",
  "Fortalezas": "Pontos fortes",
  "Guardar información": "Salvar informações",
  "Gobernanza": "Governança",
  "Gestión de residuos": "Gestão de resíduos",
  "Inicia sesión para continuar en el panel de control.":
    "Faça login para continuar no painel de controle.",
  "Iniciar sesión": "Entrar",
  "Iniciando...": "Iniciando...",
  "Información de la empresa": "Informações da empresa",
  "La empresa demuestra prácticas sostenibles consolidadas e integradas en su gestión.":
    "A empresa demonstra práticas sustentáveis consolidadas e integradas à sua gestão.",
  "La empresa está comenzando su camino hacia la sostenibilidad y tiene buenas oportunidades para avanzar.":
    "A empresa está começando sua jornada rumo à sustentabilidade e tem boas oportunidades para avançar.",
  "La empresa cuenta con buenas prácticas, pero existen oportunidades de mejora en algunas áreas.":
    "A empresa tem boas práticas, mas há oportunidades de melhoria em algumas áreas.",
  "La empresa ya cuenta con iniciativas positivas, pero aún puede fortalecer prácticas importantes.":
    "A empresa já conta com iniciativas positivas, mas ainda pode fortalecer práticas importantes.",
  "La información de la empresa se guardó correctamente.":
    "As informações da empresa foram salvas.",
  "Las acciones programadas o implementadas no se pueden quitar del plan.":
    "Ações agendadas ou implementadas não podem ser removidas do plano.",
  "Las tareas personalizadas se generaron y se guardaron correctamente.":
    "As tarefas personalizadas foram geradas e salvas.",
  "Localización": "Localização",
  "Mantén actualizados los datos de la empresa para hacer un mejor seguimiento de tu planificación sostenible.":
    "Mantenha os dados da empresa atualizados para acompanhar melhor seu planejamento sustentável.",
  "Mi empresa": "Minha empresa",
  "Mostrar contraseña": "Mostrar senha",
  "No disponible": "Indisponível",
  "No disponible temporalmente": "Indisponível temporariamente",
  "No hay acciones en esta etapa.": "Não há ações nesta etapa.",
  "No hay datos disponibles": "Não há dados disponíveis",
  "No informado": "Não informado",
  "No se han destacado fortalezas en este diagnóstico.":
    "Nenhum ponto forte foi destacado neste diagnóstico.",
  "No se han identificado oportunidades prioritarias.":
    "Nenhuma oportunidade prioritária foi identificada.",
  "No se pudo completar la operación. Inténtalo de nuevo.":
    "Não foi possível concluir a operação. Tente novamente.",
  "No se pudo guardar la información.": "Não foi possível salvar as informações.",
  "No se pudo guardar la respuesta. Comprueba tu conexión e inténtalo de nuevo.":
    "Não foi possível salvar a resposta. Verifique sua conexão e tente novamente.",
  "No se pudo cargar el diagnóstico.": "Não foi possível carregar o diagnóstico.",
  "No se pudo cargar el diagnóstico. Comprueba tu conexión e inténtalo de nuevo.":
    "Não foi possível carregar o diagnóstico. Verifique sua conexão e tente novamente.",
  "No se pudo cargar el perfil de la empresa.":
    "Não foi possível carregar o perfil da empresa.",
  "No se pudo cargar el plan sostenible.": "Não foi possível carregar o plano sustentável.",
  "No se pudieron cargar los resultados del diagnóstico.":
    "Não foi possível carregar os resultados do diagnóstico.",
  "No se pudo finalizar el diagnóstico. Inténtalo de nuevo.":
    "Não foi possível concluir o diagnóstico. Tente novamente.",
  "No se pudo iniciar un nuevo diagnóstico. Inténtalo de nuevo.":
    "Não foi possível iniciar um novo diagnóstico. Tente novamente.",
  "Nombre de la empresa": "Nome da empresa",
  "Nombre de la empresa *": "Nome da empresa *",
  "Nombre de la persona responsable": "Nome da pessoa responsável",
  "Notas (opcional)": "Observações (opcional)",
  "Número de empleados": "Número de funcionários",
  "Número de empleados *": "Número de funcionários *",
  "Organiza las actividades": "Organize as atividades",
  "Organiza las actividades en la agenda y consulta la evolución de tu plan de sostenibilidad.":
    "Organize as atividades na agenda e acompanhe a evolução do seu plano de sustentabilidade.",
  "Organiza las actividades en tu plan sostenible.":
    "Organize as atividades no seu plano sustentável.",
  "Pendiente": "Pendente",
  "Pendiente de programación": "Pendente de agendamento",
  "Pendientes de programación": "Pendentes de agendamento",
  "Perfil de la empresa": "Perfil da empresa",
  "Planificación de la empresa": "Planejamento da empresa",
  "Por qué es importante?": "Por que isso é importante?",
  "Puntos de Recogida": "Pontos de coleta",
  "Puntos disponibles": "Pontos disponíveis",
  "Preguntas respondidas": "Perguntas respondidas",
  "Propietario/a o responsable": "Proprietário(a) ou responsável",
  "Propietario/a o responsable *": "Proprietário(a) ou responsável *",
  "Progreso del diagnóstico": "Progresso do diagnóstico",
  "Programar actividad": "Agendar atividade",
  "Realizar un nuevo diagnóstico": "Fazer um novo diagnóstico",
  "Registra tu correo electrónico y una contraseña para acceder a EcoAvanza.":
    "Cadastre seu e-mail e uma senha para acessar o EcoAvanza.",
  "Resumen": "Resumo",
  "Resumen del perfil y del diagnóstico de sostenibilidad de la empresa.":
    "Resumo do perfil e do diagnóstico de sustentabilidade da empresa.",
  "Resultado general": "Resultado geral",
  "Resultados": "Resultados",
  "Resultados del diagnóstico": "Resultados do diagnóstico",
  "Resultados por dimensión": "Resultados por dimensão",
  "Resultados no disponibles": "Resultados indisponíveis",
  "Ruta Sostenible": "Rota Sustentável",
  "Se ha iniciado un nuevo diagnóstico. Se eliminaron las respuestas anteriores.":
    "Um novo diagnóstico foi iniciado. As respostas anteriores foram excluídas.",
  "Se realiza con frecuencia": "Realizada com frequência",
  "Se realiza ocasionalmente": "Realizada ocasionalmente",
  "Se realiza sistemáticamente": "Realizada sistematicamente",
  "Sector": "Setor",
  "Sector de la empresa": "Setor da empresa",
  "Sector de la empresa *": "Setor da empresa *",
  "Selecciona las iniciativas que quieres incluir en tu plan.":
    "Selecione as iniciativas que deseja incluir no seu plano.",
  "Selecciona la opción que mejor represente la situación actual de la empresa.":
    "Selecione a opção que melhor representa a situação atual da empresa.",
  "Selecciona la opción que mejor represente la práctica actual de la empresa.":
    "Selecione a opção que melhor representa a prática atual da empresa.",
  "Siguiente pregunta": "Próxima pergunta",
  "Tareas personalizadas": "Tarefas personalizadas",
  "Social": "Social",
  "Sostenibilidad": "Sustentabilidade",
  "Tema claro": "Tema claro",
  "Tema oscuro": "Tema escuro",
  "Todos los derechos reservados": "Todos os direitos reservados",
  "Volver al panel": "Voltar ao painel",
  "¿Aún no tienes una cuenta?": "Ainda não tem uma conta?",
  "¿Cómo interpretarlo?": "Como interpretar?",
  "¿Por qué es importante?": "Por que isso é importante?",
  "¿Necesitas ayuda?": "Precisa de ajuda?",
  "¿Ya tienes una cuenta?": "Já tem uma conta?",
  "¿Qué acciones son adecuadas para tu empresa?":
    "Quais ações são adequadas para sua empresa?",
  "¿Por qué esta tarea?": "Por que esta tarefa?",
  "¿Quieres iniciar un nuevo diagnóstico? El diagnóstico completado y todas las respuestas anteriores se eliminarán permanentemente.":
    "Deseja iniciar um novo diagnóstico? O diagnóstico concluído e todas as respostas anteriores serão excluídos permanentemente.",
  "o": "ou",
  "acciones seleccionadas": "ações selecionadas",
  "acción seleccionada": "ação selecionada",
  "de 100": "de 100",
  "días sugeridos": "dias sugeridos",
  "empleado": "funcionário",
  "empleados": "funcionários",
  "preguntas": "perguntas",
  "respuesta": "resposta",
};

const languageTextNodes = new WeakMap();
const languageAttributeValues = new WeakMap();
const languageAttributeNames = [
  "aria-label",
  "placeholder",
  "title",
  "alt",
  "content",
];

function normalizeLanguageText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getPortugueseText(source) {
  const exactTranslation = languageTranslations[normalizeLanguageText(source)];
  if (exactTranslation) {
    return exactTranslation;
  }

  const questionMatch = normalizeLanguageText(source).match(
    /^Pregunta (\d+) de (\d+)$/,
  );
  if (questionMatch) {
    return `Pergunta ${questionMatch[1]} de ${questionMatch[2]}`;
  }

  const completedMatch = normalizeLanguageText(source).match(
    /^(\d+) de (\d+) preguntas respondidas\.$/,
  );
  if (completedMatch) {
    return `${completedMatch[1]} de ${completedMatch[2]} perguntas respondidas.`;
  }

  const actionCountMatch = normalizeLanguageText(source).match(
    /^(\d+) acciones seleccionadas?$/,
  );
  if (actionCountMatch) {
    const noun =
      actionCountMatch[1] === "1" ? "ação selecionada" : "ações selecionadas";
    return `${actionCountMatch[1]} ${noun}`;
  }

  const daysMatch = normalizeLanguageText(source).match(/^(\d+) días sugeridos$/);
  if (daysMatch) {
    return `${daysMatch[1]} dias sugeridos`;
  }

  const progressMatch = normalizeLanguageText(source).match(
    /^Progreso actual: (\d+)%. Finaliza el diagnóstico para ver la evaluación\.$/,
  );
  if (progressMatch) {
    return `Progresso atual: ${progressMatch[1]}%. Conclua o diagnóstico para ver a avaliação.`;
  }

  const dimensionProgressMatch = normalizeLanguageText(source).match(
    /^(.+): (\d+) de (\d+) preguntas respondidas\.$/,
  );
  if (dimensionProgressMatch) {
    return `${getPortugueseText(dimensionProgressMatch[1]) ?? dimensionProgressMatch[1]}: ${dimensionProgressMatch[2]} de ${dimensionProgressMatch[3]} perguntas respondidas.`;
  }

  const scoreMatch = normalizeLanguageText(source).match(
    /^Puntuación general: (\d+) de 100$/,
  );
  if (scoreMatch) {
    return `Pontuação geral: ${scoreMatch[1]} de 100`;
  }

  return null;
}

function translateTextNode(node) {
  let state = languageTextNodes.get(node);
  if (!state) {
    state = { original: node.data };
    languageTextNodes.set(node, state);
  }

  if (languageRoot.lang === "pt-BR") {
    const translation = getPortugueseText(state.original);
    if (translation !== null) {
      node.data = translation;
    }
  } else if (node.data !== state.original) {
    node.data = state.original;
  }
}

function translateAttributes(element, restore = false) {
  languageAttributeNames.forEach((attributeName) => {
    if (!element.hasAttribute(attributeName)) {
      return;
    }

    let values = languageAttributeValues.get(element);
    if (!values) {
      values = new Map();
      languageAttributeValues.set(element, values);
    }

    if (!values.has(attributeName)) {
      values.set(attributeName, {
        original: element.getAttribute(attributeName),
        translated: null,
      });
    }

    const state = values.get(attributeName);
    const currentValue = element.getAttribute(attributeName);
    if (restore) {
      if (currentValue !== state.original) {
        element.setAttribute(attributeName, state.original);
      }
      state.translated = null;
      return;
    }

    if (languageRoot.lang === "pt-BR") {
      if (
        state.translated !== null &&
        currentValue !== state.translated &&
        currentValue !== state.original
      ) {
        state.original = currentValue;
      }

      const translation = getPortugueseText(state.original);
      if (translation !== null) {
        state.translated = translation;
        element.setAttribute(attributeName, translation);
      }
    } else {
      state.original = currentValue;
      state.translated = null;
    }
  });
}

function translateNode(node, restoreAttributes = false) {
  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  translateAttributes(node, restoreAttributes);
  node.childNodes.forEach((child) => translateNode(child, restoreAttributes));
}

function updateLanguageToggle() {
  const isPortuguese = languageRoot.lang === "pt-BR";
  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.querySelector("[data-language-toggle-label]").textContent =
      isPortuguese ? "ES" : "PT";
    button.setAttribute(
      "aria-label",
      isPortuguese ? "Cambiar a español" : "Mudar para português",
    );
    button.setAttribute(
      "title",
      isPortuguese ? "Cambiar a español" : "Mudar para português",
    );
  });
}

function setLanguage(language) {
  if (language === "es") {
    translateNode(document.body, true);
  }

  languageRoot.lang = language;
  localStorage.setItem("ecoavanza-language", language);
  translateNode(document.body);
  updateLanguageToggle();
  document.dispatchEvent(
    new CustomEvent("ecoavanza:language-change", {
      detail: { language },
    }),
  );
}

const savedLanguage = localStorage.getItem("ecoavanza-language");
languageRoot.lang = savedLanguage === "pt-BR" ? "pt-BR" : "es";

document.addEventListener("DOMContentLoaded", () => {
  translateNode(document.body);
  updateLanguageToggle();

  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(languageRoot.lang === "pt-BR" ? "es" : "pt-BR");
    });
  });

  const languageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(translateNode);
      } else if (mutation.type === "characterData") {
        translateTextNode(mutation.target);
      } else if (mutation.type === "attributes") {
        translateAttributes(mutation.target);
      }
    });
  });

  languageObserver.observe(document.body, {
    attributes: true,
    attributeFilter: languageAttributeNames,
    characterData: true,
    childList: true,
    subtree: true,
  });
});

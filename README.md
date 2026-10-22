
# Projeto: Aplicação com cadastro e autenticação de usuários integrando frontend, backend e persistência






## Acesso

https://project3-2026b-gabriel-maroneze-oropoc.onrender.com


## Desenvolvedor(a) / Desenvolvedor(es/as)
- Gabriel Maroneze Ramos - Sistemas de Informacao UFSM
- Joao Daniel Wurdig Lucas - Sistemas de Informacao UFSM


## Proposta
Tema sugerido: Sistema de informações em colaboração com turma de Administração (Chile).

__Gabriel Maroneze:__ Pensando e ouvindo mais sobre a proposta sugerida, gostei da ideia e da oportunidade única de colaboração com alunos de outra universidade. Pretendo mantê-la se possível. Também gostaria de seguir utilizando as mesmas tecnologias de antes (PostgreSQL, Python e FastAPI) para tentar aumentar meu nível de compreensão nelas e possivelmente passar a utilizá-las como fonte de trabalho no futuro. Não tenho sugestão de dupla, mas gostaria de seguir trabalhando com o João Daniel também, se possível. Tenho flexibilidade de horários quinta-feira pelo final das tardes, sextas-feiras a tarde/final de tarde e aos domingos para reuniões síncronas.

__Joao Daniel:__ Sobre a proposta sugerida, gostei da ideia e da oportunidade única de colaboração com alunos de outra universidade. Acredito que agora com uma dupla o trabalho vai ser mais bem aproveitado e, olhando para o trabalho anterior, pensamos que seria melhor mantermos com as ferramentas utilizadas pelo Gabriel (PostgreSQL, Python e FastAPI) para tentar aumentar o nível de compreensão nelas e possivelmente passar a utilizá-las como fonte de trabalho no futuro.



## Desenvolvimento

### Processo

 Primeiramente, estavamos na duvida de como iamos organizar os materias enviados pelas outras alunas do Chile, o que elas queriam e as nossas possibilidaades de execucao. Essa primeira fase demorou muito pois ainda nao tinhamos a total dimensao do que elas queriam, foi quando elas nos enviaram um pdf com todas as telas que queriam e varias abas aberta e cheias de informacoes (umas redundantes, outras desnecessarias, layouts muito carregados), isso nos assustou num primeiro momento mas o Joao lembrou das atividades de engenharia de software e IHC para criar um mini projeto para nos situarmos onde estavamos, onde queriamos ir e o que deveriamos ajustar do pdf enviado.
 Feita essa interpretacao do caso, mandamos as nossas observacoes para elas, que aceitaram e comecamos a pensar sobre como iriamos fazer cada tela, cada informacao e a autentificacao. A parte mais ligada a API e a integracao dos materiais entregues pelas alunas ao banco de dados e a forma que esse material iria estar no aplicativo foi mais a parte do Gabriel, a parte de modelagem, requisicoes, depuracoes e o deploy ficou mais para o Joao.
 Uma parte muito impactante no trabalho foi que, muitas coisas que sempre dao errado nos nossos trabalhos tambem deram nesse como: dificuldades com deploy, bugs com o vscode e github, dificuldades com o banco de dados; porem, dessa vez a gente resolveu muito mais rapidamente, e nao foi por causa da IA (por que nas outras tambem tinhamos usado e demorou horrores) mas sim por que sabiamos qual era o erro e aonde tinhamos que ir para consertar.
 O codigo em si nao tinha muito misterio, a unica coisa mais complexo que tinhamos que trabalhar era a autentificacao e a relacao entre as respostas dos perfis com os diagnosticos do sistema.

### Trechos de código

## primeiro trecho

<img width="848" height="632" alt="Captura de tela 2026-10-22 090414" src="https://github.com/user-attachments/assets/44511fb6-b738-4afd-8375-d918ac6b871c" />


## segundo trecho 

<img width="811" height="287" alt="Captura de tela 2026-10-22 090541" src="https://github.com/user-attachments/assets/5ccad83a-5c55-48b5-8727-23f7fb96ea4c" />


## terceiro trecho

<img width="390" height="243" alt="Captura de tela 2026-10-22 090613" src="https://github.com/user-attachments/assets/7954d8f2-9067-4536-86a6-2d372908c283" />


## Tecnologias

### Linguagens e afins

- Docker
- PostgreSQL
- pgAdmin
- Psycopg 
- FastAPI
- Pytantic
- Pwdlib 
- Javascript
- Python
- HTML
- CSS
- SQL

### Autenticação e autorização

 Foi implementado usando uma sessão baseada em cookie, controlada pelo backend. O SessionMiddleware da Starlette cria o cookie ecoavanza_session, esse cookie é assinado com a chave SESSION_SECRET. Isso significa que o navegador consegue armazená-lo, mas não deve conseguir alterar o conteúdo sem invalidar a assinatura.

### Ambiente de desenvolvimento


- VSCODE:
- GITHUB
- RENDER
- DOCKER DESKTOP
- pgAdmin Web Service

## Referências e créditos

- Materiais de IHC e Engenharia de Software
- Gemini (Geração de Imagens)
- Copilot VSCode
- ChatGPT (Configurações do Docker)
- Materiais de Segurança e Defesa em Ambientes Digitais (hash)




---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b

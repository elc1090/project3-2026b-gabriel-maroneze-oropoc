# EcoAvanza

Aplicação web para diagnóstico e acompanhamento de práticas de sustentabilidade empresarial. O sistema usa FastAPI, PostgreSQL e Docker Compose.

## Executar localmente

Requisitos: Docker Desktop com Docker Compose habilitado.

1. Na primeira execução, crie o arquivo `.env` a partir de `.envexample` e troque os valores de senha e `SESSION_SECRET` por valores próprios. O `.env` local já existente deve ser mantido.
2. No PowerShell, entre nesta pasta do projeto e execute:

   ```powershell
   docker compose up --build -d
   ```

3. Abra <http://localhost:8000>.
4. Entre com os valores configurados em `INITIAL_ADMIN_USER` e `INITIAL_ADMIN_PASSWORD` no `.env`.

Na primeira inicialização, a API cria as tabelas necessárias, cadastra as perguntas do diagnóstico e cria o acesso inicial. As respostas do diagnóstico, perfil, plano sustentável e registros enviados pela API ficam no PostgreSQL.

Para acompanhar o estado dos serviços:

```powershell
docker compose ps
docker compose logs -f api
```

O pgAdmin é opcional. Para iniciá-lo, configure `PGADMIN_DEFAULT_EMAIL` e `PGADMIN_DEFAULT_PASSWORD` no `.env` e execute:

```powershell
docker compose --profile admin up -d
```

Ele fica disponível em <http://localhost:5050>.

## Fluxos disponíveis

- Login e sessão da empresa.
- Tema escuro em todas as telas, com alternância para o tema claro e preferência salva no navegador.
- Cadastro de novas contas com validação de e-mail e senha de pelo menos 8 caracteres.
- Diagnóstico com 20 perguntas, respostas salvas automaticamente e conclusão.
- Resultados por dimensão, calculados a partir das respostas.
- Perfil da empresa persistido no banco.
- Rota Sustentável com seleção, agendamento e acompanhamento de ações persistidos no banco.
- Área de ajuda com orientações do sistema.

O endpoint `/health` verifica a conexão da API com o banco. A documentação interativa da API está em <http://localhost:8000/docs>.

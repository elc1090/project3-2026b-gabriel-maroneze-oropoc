import os
from contextlib import asynccontextmanager
from datetime import date
from typing import Annotated, Literal

import psycopg
from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr, Field, TypeAdapter, ValidationError
from starlette.middleware.sessions import SessionMiddleware


password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("senha-invalida-para-comparacao")


class ResiduoCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    categoria: Literal[
        "organico",
        "reciclavel",
        "perigoso",
        "rejeito",
    ]
    quantidade_kg: float = Field(gt=0)


class PerfilEmpresaUpdate(BaseModel):
    profile_created_at: date
    founded_year: int = Field(ge=1800, le=2100)
    company_name: str = Field(min_length=2, max_length=120)
    owner: str = Field(min_length=2, max_length=120)
    employees: int = Field(ge=0, le=1_000_000)
    sector: str = Field(min_length=2, max_length=100)


class PlanoAcao(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    status: Literal["awaiting", "in_progress", "implemented"]
    date: str = Field(default="", max_length=10)
    notes: str = Field(default="", max_length=160)


class PlanoSustentavelUpdate(BaseModel):
    actions: list[PlanoAcao] = Field(max_length=100)


PLANO_ACTION_IDS = frozenset(
    {
        "waste-separation",
        "waste-destination",
        "reuse-materials",
        "water-leaks",
        "water-efficiency",
        "rainwater",
        "led-lighting",
        "energy-routine",
        "ac-maintenance",
        "supplier-criteria",
        "low-impact-products",
        "purchase-planning",
    }
)


class RespostaDiagnosticoUpdate(BaseModel):
    """
    0 = Não é realizado
    1 = É realizado ocasionalmente
    2 = É realizado frequentemente
    3 = É realizado sistematicamente
    """

    valor: int = Field(ge=0, le=3)


def abrir_conexao():
    return psycopg.connect(
        host=os.getenv("DB_HOST", "db"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )


def inicializar_banco() -> None:
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            for statement in (
                """
                CREATE TABLE IF NOT EXISTS empresas (
                    id BIGSERIAL PRIMARY KEY,
                    nome VARCHAR(120) NOT NULL,
                    email_acesso VARCHAR(254) NOT NULL UNIQUE,
                    senha_hash TEXT NOT NULL
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS dimensoes (
                    id BIGSERIAL PRIMARY KEY,
                    nome VARCHAR(80) NOT NULL UNIQUE,
                    ordem INTEGER NOT NULL UNIQUE
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS perguntas (
                    id BIGSERIAL PRIMARY KEY,
                    dimensao_id BIGINT NOT NULL REFERENCES dimensoes(id),
                    texto TEXT NOT NULL,
                    ordem INTEGER NOT NULL,
                    ativa BOOLEAN NOT NULL DEFAULT TRUE,
                    UNIQUE (dimensao_id, ordem)
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS diagnosticos (
                    id BIGSERIAL PRIMARY KEY,
                    empresa_id BIGINT NOT NULL REFERENCES empresas(id),
                    status VARCHAR(20) NOT NULL DEFAULT 'em_andamento',
                    iniciado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    finalizado_em TIMESTAMPTZ
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS respostas_diagnostico (
                    diagnostico_id BIGINT NOT NULL REFERENCES diagnosticos(id),
                    pergunta_id BIGINT NOT NULL REFERENCES perguntas(id),
                    valor SMALLINT NOT NULL CHECK (valor BETWEEN 0 AND 3),
                    respondida_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (diagnostico_id, pergunta_id)
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS perfis_empresa (
                    empresa_id BIGINT PRIMARY KEY REFERENCES empresas(id) ON DELETE CASCADE,
                    dados JSONB NOT NULL
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS planos_sustentaveis (
                    empresa_id BIGINT PRIMARY KEY REFERENCES empresas(id) ON DELETE CASCADE,
                    acoes JSONB NOT NULL DEFAULT '[]'::jsonb,
                    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS residuos (
                    id BIGSERIAL PRIMARY KEY,
                    empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
                    nome VARCHAR(120) NOT NULL,
                    categoria VARCHAR(20) NOT NULL,
                    quantidade_kg DOUBLE PRECISION NOT NULL CHECK (quantidade_kg > 0),
                    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """,
            ):
                cursor.execute(statement)

            cursor.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS empresas_email_acesso_lower_unique
                ON empresas (LOWER(email_acesso))
                """
            )

            dimensoes = [
                ("Ambiental", 1, [
                    "A empresa monitora o consumo de água?",
                    "A empresa acompanha o consumo de energia?",
                    "Os resíduos são separados para reciclagem?",
                    "A empresa reduz o uso de materiais descartáveis?",
                    "Há ações para prevenir impactos ambientais?",
                ]),
                ("Social", 2, [
                    "A empresa promove saúde e segurança no trabalho?",
                    "A equipe recebe orientação sobre sustentabilidade?",
                    "A empresa combate discriminação e assédio?",
                    "Há diálogo com clientes e comunidade?",
                    "A empresa incentiva condições de trabalho justas?",
                ]),
                ("Econômica", 3, [
                    "A empresa planeja o uso eficiente de recursos?",
                    "As compras consideram durabilidade e desperdício?",
                    "A empresa acompanha custos relacionados a recursos?",
                    "Há planejamento para manter as ações sustentáveis?",
                    "A empresa avalia oportunidades de eficiência?",
                ]),
                ("Governança", 4, [
                    "Há responsáveis definidos pelas ações sustentáveis?",
                    "A empresa registra suas políticas e práticas?",
                    "As decisões consideram impactos de longo prazo?",
                    "A empresa acompanha metas e resultados?",
                    "A comunicação sobre práticas é transparente?",
                ]),
            ]
            cursor.execute("SELECT COUNT(*) FROM perguntas")
            if cursor.fetchone()[0] == 0:
                for nome_dimensao, ordem, perguntas in dimensoes:
                    cursor.execute(
                        """
                        INSERT INTO dimensoes (nome, ordem)
                        VALUES (%s, %s)
                        RETURNING id
                        """,
                        (nome_dimensao, ordem),
                    )
                    dimensao_id = cursor.fetchone()[0]
                    cursor.executemany(
                        """
                        INSERT INTO perguntas (dimensao_id, texto, ordem)
                        VALUES (%s, %s, %s)
                        """,
                        [
                            (dimensao_id, texto, ordem_pergunta)
                            for ordem_pergunta, texto in enumerate(perguntas, 1)
                        ],
                    )

    nome_empresa = (
        os.getenv("INITIAL_COMPANY_NAME")
        or "Minha Empresa"
    ).strip()
    email_empresa = (
        os.getenv("INITIAL_COMPANY_EMAIL")
        or os.getenv("INITIAL_ADMIN_USER")
        or ""
    ).strip().lower()
    senha_empresa = (
        os.getenv("INITIAL_COMPANY_PASSWORD")
        or os.getenv("INITIAL_ADMIN_PASSWORD")
        or ""
    )

    if not email_empresa and not senha_empresa:
        return
    if not email_empresa or not senha_empresa:
        raise RuntimeError(
            "Defina usuário/e-mail e senha inicial juntos para criar o acesso."
        )

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id
                FROM empresas
                WHERE LOWER(email_acesso) = %s
                """,
                (email_empresa,),
            )

            empresa_existente = cursor.fetchone()

            if empresa_existente is None:
                cursor.execute(
                    """
                    INSERT INTO empresas (
                        nome,
                        email_acesso,
                        senha_hash
                    )
                    VALUES (%s, %s, %s)
                    """,
                    (
                        nome_empresa,
                        email_empresa,
                        password_hash.hash(senha_empresa),
                    ),
                )

            cursor.execute(
                """
                SELECT id
                FROM empresas
                WHERE LOWER(email_acesso) = %s
                """,
                (email_empresa,),
            )
            empresa_id = cursor.fetchone()[0]
            cursor.execute(
                """
                INSERT INTO planos_sustentaveis (empresa_id, acoes)
                VALUES (%s, '[]'::jsonb)
                ON CONFLICT (empresa_id) DO NOTHING
                """,
                (empresa_id,),
            )


def autenticar_empresa(email: str, senha: str) -> tuple[int, str] | None:
    email_normalizado = email.strip().lower()

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, nome, senha_hash
                FROM empresas
                WHERE LOWER(email_acesso) = %s
                """,
                (email_normalizado,),
            )

            registro = cursor.fetchone()

    if registro is None:
        password_hash.verify(senha, DUMMY_HASH)
        return None

    empresa_id, nome_empresa, senha_armazenada = registro

    if not password_hash.verify(senha, senha_armazenada):
        return None

    return empresa_id, nome_empresa


def validar_email(email: str) -> str:
    email_validado = TypeAdapter(EmailStr).validate_python(email.strip())
    return str(email_validado).lower()


def buscar_diagnostico_em_andamento(
    empresa_id: int,
) -> tuple[int, str] | None:
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, status
                FROM diagnosticos
                WHERE empresa_id = %s
                  AND status = 'em_andamento'
                ORDER BY iniciado_em DESC
                LIMIT 1
                """,
                (empresa_id,),
            )

            return cursor.fetchone()


def buscar_ultimo_diagnostico_concluido(
    empresa_id: int,
) -> tuple[int, str] | None:
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, status
                FROM diagnosticos
                WHERE empresa_id = %s
                  AND status = 'concluido'
                ORDER BY finalizado_em DESC
                LIMIT 1
                """,
                (empresa_id,),
            )

            return cursor.fetchone()


def criar_diagnostico(empresa_id: int) -> tuple[int, str]:
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO diagnosticos (empresa_id)
                VALUES (%s)
                RETURNING id, status
                """,
                (empresa_id,),
            )

            return cursor.fetchone()


def obter_diagnostico_para_exibicao(
    empresa_id: int,
) -> tuple[int, str]:
    diagnostico_em_andamento = buscar_diagnostico_em_andamento(empresa_id)

    if diagnostico_em_andamento is not None:
        return diagnostico_em_andamento

    diagnostico_concluido = buscar_ultimo_diagnostico_concluido(empresa_id)

    if diagnostico_concluido is not None:
        return diagnostico_concluido

    return criar_diagnostico(empresa_id)


def carregar_dados_diagnostico(
    diagnostico_id: int,
) -> tuple[list[dict], list[dict]]:
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    p.id,
                    d.id,
                    d.nome,
                    d.ordem,
                    p.ordem,
                    p.texto
                FROM perguntas p
                JOIN dimensoes d ON d.id = p.dimensao_id
                WHERE p.ativa = TRUE
                ORDER BY d.ordem, p.ordem
                """
            )

            perguntas = [
                {
                    "id": linha[0],
                    "dimensao_id": linha[1],
                    "dimensao": linha[2],
                    "ordem_dimensao": linha[3],
                    "ordem_pergunta": linha[4],
                    "texto": linha[5],
                }
                for linha in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT pergunta_id, valor
                FROM respostas_diagnostico
                WHERE diagnostico_id = %s
                """,
                (diagnostico_id,),
            )

            respostas = [
                {
                    "pergunta_id": linha[0],
                    "valor": linha[1],
                }
                for linha in cursor.fetchall()
            ]

    return perguntas, respostas


def pergunta_ativa_existe(pergunta_id: int) -> bool:
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id
                FROM perguntas
                WHERE id = %s
                  AND ativa = TRUE
                """,
                (pergunta_id,),
            )

            return cursor.fetchone() is not None


def calcular_pontuacao(valor_total: int, quantidade_perguntas: int) -> int:
    """
    Converte a soma das respostas, de 0 a 3, para uma escala de 0 a 100.
    """

    if quantidade_perguntas == 0:
        return 0

    pontuacao = (valor_total / (quantidade_perguntas * 3)) * 100

    return int(pontuacao + 0.5)


def definir_nivel(pontuacao: int) -> str:
    if pontuacao <= 24:
        return "Inicial"

    if pontuacao <= 49:
        return "Em desenvolvimento"

    if pontuacao <= 74:
        return "Intermediário"

    return "Avançado"


def carregar_resultados_diagnostico(diagnostico_id: int) -> dict:
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT finalizado_em
                FROM diagnosticos
                WHERE id = %s
                """,
                (diagnostico_id,),
            )

            finalizado_em = cursor.fetchone()[0]

            cursor.execute(
                """
                SELECT
                    d.id,
                    d.nome,
                    d.ordem,
                    COUNT(p.id) AS quantidade_perguntas,
                    COALESCE(SUM(r.valor), 0) AS valor_total
                FROM dimensoes d
                JOIN perguntas p ON p.dimensao_id = d.id
                LEFT JOIN respostas_diagnostico r
                    ON r.pergunta_id = p.id
                    AND r.diagnostico_id = %s
                WHERE p.ativa = TRUE
                GROUP BY d.id, d.nome, d.ordem
                ORDER BY d.ordem
                """,
                (diagnostico_id,),
            )

            dimensoes = [
                {
                    "id": linha[0],
                    "nome": linha[1],
                    "ordem": linha[2],
                    "quantidade_perguntas": linha[3],
                    "pontuacao": calcular_pontuacao(linha[4], linha[3]),
                }
                for linha in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT
                    p.id,
                    p.texto,
                    d.nome,
                    r.valor
                FROM respostas_diagnostico r
                JOIN perguntas p ON p.id = r.pergunta_id
                JOIN dimensoes d ON d.id = p.dimensao_id
                WHERE r.diagnostico_id = %s
                  AND p.ativa = TRUE
                ORDER BY r.valor DESC, d.ordem, p.ordem
                """,
                (diagnostico_id,),
            )

            respostas = [
                {
                    "pergunta_id": linha[0],
                    "pergunta": linha[1],
                    "dimensao": linha[2],
                    "valor": linha[3],
                }
                for linha in cursor.fetchall()
            ]

    pontuacao_geral = int(
        (sum(dimensao["pontuacao"] for dimensao in dimensoes) / len(dimensoes))
        + 0.5
    )

    fortalezas = [
        resposta
        for resposta in respostas
        if resposta["valor"] >= 2
    ][:3]

    oportunidades = [
        resposta
        for resposta in sorted(respostas, key=lambda resposta: resposta["valor"])
        if resposta["valor"] <= 1
    ][:3]

    return {
        "diagnostico_id": diagnostico_id,
        "finalizado_em": finalizado_em,
        "pontuacao_geral": pontuacao_geral,
        "nivel": definir_nivel(pontuacao_geral),
        "dimensoes": dimensoes,
        "fortalezas": fortalezas,
        "oportunidades": oportunidades,
    }


@asynccontextmanager
async def lifespan(_: FastAPI):
    inicializar_banco()
    yield


app = FastAPI(
    title="ECOAVANZA",
    version="0.7.0",
    lifespan=lifespan,
)

session_secret = os.getenv("SESSION_SECRET")
if not session_secret:
    raise RuntimeError("Defina SESSION_SECRET no arquivo .env.")

app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret,
    session_cookie="ecoavanza_session",
    max_age=8 * 60 * 60,
    same_site="lax",
    https_only=os.getenv("COOKIE_HTTPS_ONLY", "false").lower() == "true",
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def pagina_login(request: Request):
    if request.session.get("empresa_id"):
        return RedirectResponse(url="/painel", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={"erro": None, "email": ""},
    )


@app.get("/cadastro", response_class=HTMLResponse, include_in_schema=False)
def pagina_cadastro(request: Request):
    if request.session.get("empresa_id"):
        return RedirectResponse(url="/painel", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="cadastro.html",
        context={"erro": None, "email": ""},
    )


@app.post("/cadastro", response_class=HTMLResponse, include_in_schema=False)
def cadastrar_empresa(
    request: Request,
    email: Annotated[str, Form()],
    senha: Annotated[str, Form()],
):
    email_original = email.strip()
    try:
        email_validado = validar_email(email_original)
    except ValidationError:
        return templates.TemplateResponse(
            request=request,
            name="cadastro.html",
            context={"erro": "Informe um endereço de e-mail válido.", "email": email_original},
            status_code=422,
        )

    if len(senha) < 8:
        return templates.TemplateResponse(
            request=request,
            name="cadastro.html",
            context={
                "erro": "A senha precisa ter pelo menos 8 caracteres.",
                "email": email_original,
            },
            status_code=422,
        )

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO empresas (nome, email_acesso, senha_hash)
                VALUES (%s, %s, %s)
                ON CONFLICT (LOWER(email_acesso)) DO NOTHING
                RETURNING id, nome
                """,
                ("Minha Empresa", email_validado, password_hash.hash(senha)),
            )
            empresa = cursor.fetchone()

            if empresa is not None:
                cursor.execute(
                    """
                    INSERT INTO planos_sustentaveis (empresa_id, acoes)
                    VALUES (%s, '[]'::jsonb)
                    """,
                    (empresa[0],),
                )

    if empresa is None:
        return templates.TemplateResponse(
            request=request,
            name="cadastro.html",
            context={
                "erro": "Já existe uma conta cadastrada com esse e-mail.",
                "email": email_original,
            },
            status_code=409,
        )

    request.session.clear()
    request.session["empresa_id"] = empresa[0]
    request.session["empresa_nome"] = empresa[1]
    return RedirectResponse(url="/painel", status_code=303)


@app.post("/login", response_class=HTMLResponse, include_in_schema=False)
def realizar_login(
    request: Request,
    email: Annotated[str, Form()],
    senha: Annotated[str, Form()],
):
    autenticado = autenticar_empresa(email, senha)

    if autenticado is None:
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={
                "erro": "E-mail ou senha inválidos.",
                "email": email.strip(),
            },
            status_code=401,
        )

    empresa_id, nome_empresa = autenticado

    request.session.clear()
    request.session["empresa_id"] = empresa_id
    request.session["empresa_nome"] = nome_empresa

    return RedirectResponse(url="/painel", status_code=303)


@app.get("/painel", response_class=HTMLResponse, include_in_schema=False)
def painel(request: Request):
    if not request.session.get("empresa_id"):
        return RedirectResponse(url="/", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={"empresa": request.session.get("empresa_nome")},
    )


@app.post("/logout", include_in_schema=False)
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)


@app.get("/health")
def verificar_saude():
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

    return {"api": "online", "banco": "online"}


@app.post("/residuos", status_code=201)
def cadastrar_residuo(residuo: ResiduoCreate, request: Request):
    empresa_id = request.session.get("empresa_id")
    if not empresa_id:
        raise HTTPException(status_code=401, detail="Inicie uma sessão para registrar resíduos.")

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO residuos (empresa_id, nome, categoria, quantidade_kg)
                VALUES (%s, %s, %s, %s)
                RETURNING id, criado_em
                """,
                (empresa_id, residuo.nome.strip(), residuo.categoria, residuo.quantidade_kg),
            )
            registro = cursor.fetchone()

    return {
        "mensagem": "Resíduo registrado com sucesso.",
        "id": registro[0],
        "criado_em": registro[1],
        "residuo": residuo.model_dump(),
    }


@app.get("/api/residuos", include_in_schema=False)
def listar_residuos(request: Request):
    empresa_id = request.session.get("empresa_id")
    if not empresa_id:
        raise HTTPException(status_code=401, detail="Inicie uma sessão para consultar resíduos.")

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, nome, categoria, quantidade_kg, criado_em
                FROM residuos
                WHERE empresa_id = %s
                ORDER BY criado_em DESC, id DESC
                """,
                (empresa_id,),
            )
            residuos_empresa = cursor.fetchall()

    return {
        "residuos": [
            {
                "id": item[0],
                "nome": item[1],
                "categoria": item[2],
                "quantidade_kg": item[3],
                "criado_em": item[4],
            }
            for item in residuos_empresa
        ]
    }


@app.get("/api/perfil", include_in_schema=False)
def obter_perfil(request: Request):
    empresa_id = request.session.get("empresa_id")
    if not empresa_id:
        raise HTTPException(status_code=401, detail="Inicie uma sessão para acessar o perfil.")

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                "SELECT dados FROM perfis_empresa WHERE empresa_id = %s",
                (empresa_id,),
            )
            registro = cursor.fetchone()
            cursor.execute("SELECT nome FROM empresas WHERE id = %s", (empresa_id,))
            nome_empresa = cursor.fetchone()[0]

    return {"perfil": registro[0] if registro else {}, "nome_empresa": nome_empresa}


@app.put("/api/perfil", include_in_schema=False)
def salvar_perfil(perfil: PerfilEmpresaUpdate, request: Request):
    empresa_id = request.session.get("empresa_id")
    if not empresa_id:
        raise HTTPException(status_code=401, detail="Inicie uma sessão para salvar o perfil.")

    dados = perfil.model_dump(mode="json")
    dados["company_name"] = dados["company_name"].strip()
    dados["owner"] = dados["owner"].strip()
    dados["sector"] = dados["sector"].strip()

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO perfis_empresa (empresa_id, dados)
                VALUES (%s, %s)
                ON CONFLICT (empresa_id)
                DO UPDATE SET dados = EXCLUDED.dados
                """,
                (empresa_id, psycopg.types.json.Jsonb(dados)),
            )
            cursor.execute(
                "UPDATE empresas SET nome = %s WHERE id = %s",
                (dados["company_name"], empresa_id),
            )
    request.session["empresa_nome"] = dados["company_name"]
    return {"mensagem": "Perfil salvo com sucesso.", "perfil": dados}


@app.get("/api/plano", include_in_schema=False)
def obter_plano(request: Request):
    empresa_id = request.session.get("empresa_id")
    if not empresa_id:
        raise HTTPException(status_code=401, detail="Inicie uma sessão para acessar o plano.")

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                "SELECT acoes FROM planos_sustentaveis WHERE empresa_id = %s",
                (empresa_id,),
            )
            registro = cursor.fetchone()
            if registro is None:
                cursor.execute(
                    """
                    INSERT INTO planos_sustentaveis (empresa_id)
                    VALUES (%s)
                    RETURNING acoes
                    """,
                    (empresa_id,),
                )
                registro = cursor.fetchone()

    return {"actions": registro[0]}


@app.put("/api/plano", include_in_schema=False)
def salvar_plano(plano: PlanoSustentavelUpdate, request: Request):
    empresa_id = request.session.get("empresa_id")
    if not empresa_id:
        raise HTTPException(status_code=401, detail="Inicie uma sessão para salvar o plano.")

    acoes = [acao.model_dump() for acao in plano.actions]
    if len({acao["id"] for acao in acoes}) != len(acoes):
        raise HTTPException(status_code=422, detail="O plano contém ações duplicadas.")
    for acao in acoes:
        if acao["id"] not in PLANO_ACTION_IDS:
            raise HTTPException(status_code=422, detail="O plano contém uma ação desconhecida.")
        if acao["status"] == "in_progress" and not acao["date"]:
            raise HTTPException(status_code=422, detail="Agende uma data para cada ação em andamento.")
        if acao["date"]:
            try:
                date.fromisoformat(acao["date"])
            except ValueError as error:
                raise HTTPException(status_code=422, detail="Use uma data válida no formato AAAA-MM-DD.") from error

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO planos_sustentaveis (empresa_id, acoes)
                VALUES (%s, %s)
                ON CONFLICT (empresa_id)
                DO UPDATE SET
                    acoes = EXCLUDED.acoes,
                    atualizado_em = CURRENT_TIMESTAMP
                """,
                (empresa_id, psycopg.types.json.Jsonb(acoes)),
            )

    return {"mensagem": "Plano salvo com sucesso.", "actions": acoes}


@app.get("/api/diagnostico/resultados", include_in_schema=False)
def obter_resultados_diagnostico(request: Request):
    empresa_id = request.session.get("empresa_id")
    if not empresa_id:
        raise HTTPException(status_code=401, detail="Inicie uma sessão para consultar os resultados.")

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, status, finalizado_em
                FROM diagnosticos
                WHERE empresa_id = %s AND status = 'concluido'
                ORDER BY finalizado_em DESC
                LIMIT 1
                """,
                (empresa_id,),
            )
            diagnostico = cursor.fetchone()
            if diagnostico is None:
                cursor.execute("SELECT COUNT(*) FROM perguntas WHERE ativa = TRUE")
                total_perguntas = cursor.fetchone()[0]
                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM respostas_diagnostico r
                    JOIN diagnosticos d ON d.id = r.diagnostico_id
                    WHERE d.empresa_id = %s AND d.status = 'em_andamento'
                    """,
                    (empresa_id,),
                )
                respondidas = cursor.fetchone()[0]
                return {
                    "disponivel": False,
                    "respondidas": respondidas,
                    "total_perguntas": total_perguntas,
                    "progresso": round(respondidas * 100 / total_perguntas) if total_perguntas else 0,
                    "dimensoes": [],
                }

            cursor.execute(
                """
                SELECT d.nome, COUNT(r.pergunta_id), AVG(r.valor)
                FROM dimensoes d
                JOIN perguntas p ON p.dimensao_id = d.id AND p.ativa = TRUE
                LEFT JOIN respostas_diagnostico r
                  ON r.pergunta_id = p.id AND r.diagnostico_id = %s
                GROUP BY d.id, d.nome, d.ordem
                ORDER BY d.ordem
                """,
                (diagnostico[0],),
            )
            dimensoes = cursor.fetchall()

    answered = sum(item[1] for item in dimensoes)
    total = sum(item[1] for item in dimensoes)
    weighted_sum = sum((item[2] or 0) * item[1] for item in dimensoes)
    return {
        "disponivel": True,
        "status": diagnostico[1],
        "finalizado_em": diagnostico[2],
        "respondidas": answered,
        "total_perguntas": total,
        "progresso": 100 if total else 0,
        "resultado_geral": round(weighted_sum * 100 / (answered * 3)) if answered else 0,
        "dimensoes": [
            {
                "nome": item[0],
                "respondidas": item[1],
                "total_perguntas": item[1],
                "resultado": round(item[2] * 100 / 3) if item[2] is not None else 0,
            }
            for item in dimensoes
        ],
    }


@app.get("/diagnostico", response_class=HTMLResponse, include_in_schema=False)
def diagnostico(request: Request):
    if not request.session.get("empresa_id"):
        return RedirectResponse(url="/", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="diagnostico.html",
        context={
            "empresa": request.session.get("empresa_nome"),
            "usuario": request.session.get("empresa_nome"),
        },
    )
    
@app.get("/resultados", response_class=HTMLResponse, include_in_schema=False)
def resultados(request: Request):
    if not request.session.get("empresa_id"):
        return RedirectResponse(url="/", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="resultados.html",
        context={
            "empresa": request.session.get("empresa_nome"),
        },
    )

@app.get("/api/diagnostico/atual", include_in_schema=False)
def obter_diagnostico_atual(request: Request):
    empresa_id = request.session.get("empresa_id")

    if not empresa_id:
        raise HTTPException(
            status_code=401,
            detail="É necessário iniciar uma sessão para acessar o diagnóstico.",
        )

    diagnostico_id, status_diagnostico = obter_diagnostico_para_exibicao(
        empresa_id,
    )

    perguntas, respostas = carregar_dados_diagnostico(diagnostico_id)

    return {
        "diagnostico": {
            "id": diagnostico_id,
            "status": status_diagnostico,
        },
        "perguntas": perguntas,
        "respostas": respostas,
    }


@app.put(
    "/api/diagnostico/respostas/{pergunta_id}",
    include_in_schema=False,
)
def salvar_resposta_diagnostico(
    pergunta_id: int,
    resposta: RespostaDiagnosticoUpdate,
    request: Request,
):
    empresa_id = request.session.get("empresa_id")

    if not empresa_id:
        raise HTTPException(
            status_code=401,
            detail="É necessário iniciar uma sessão para salvar respostas.",
        )

    if not pergunta_ativa_existe(pergunta_id):
        raise HTTPException(
            status_code=404,
            detail="Pergunta não encontrada ou inativa.",
        )

    diagnostico = buscar_diagnostico_em_andamento(empresa_id)

    if diagnostico is None:
        raise HTTPException(
            status_code=409,
            detail=(
                "Este diagnóstico já foi concluído e não pode mais "
                "receber alterações."
            ),
        )

    diagnostico_id, _ = diagnostico

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO respostas_diagnostico (
                    diagnostico_id,
                    pergunta_id,
                    valor
                )
                VALUES (%s, %s, %s)
                ON CONFLICT (diagnostico_id, pergunta_id)
                DO UPDATE SET
                    valor = EXCLUDED.valor,
                    respondida_em = CURRENT_TIMESTAMP
                """,
                (
                    diagnostico_id,
                    pergunta_id,
                    resposta.valor,
                ),
            )

    return {
        "mensagem": "Resposta salva com sucesso.",
        "diagnostico_id": diagnostico_id,
        "pergunta_id": pergunta_id,
        "valor": resposta.valor,
    }


@app.post("/api/diagnostico/concluir", include_in_schema=False)
def concluir_diagnostico(request: Request):
    empresa_id = request.session.get("empresa_id")

    if not empresa_id:
        raise HTTPException(
            status_code=401,
            detail="É necessário iniciar uma sessão para concluir o diagnóstico.",
        )

    diagnostico = buscar_diagnostico_em_andamento(empresa_id)

    if diagnostico is None:
        raise HTTPException(
            status_code=409,
            detail="Não existe um diagnóstico em andamento para concluir.",
        )

    diagnostico_id, _ = diagnostico

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM perguntas
                WHERE ativa = TRUE
                """
            )

            quantidade_perguntas = cursor.fetchone()[0]

            cursor.execute(
                """
                SELECT COUNT(DISTINCT r.pergunta_id)
                FROM respostas_diagnostico r
                JOIN perguntas p ON p.id = r.pergunta_id
                WHERE r.diagnostico_id = %s
                  AND p.ativa = TRUE
                """,
                (diagnostico_id,),
            )

            quantidade_respostas = cursor.fetchone()[0]

            if quantidade_respostas < quantidade_perguntas:
                faltantes = quantidade_perguntas - quantidade_respostas

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Ainda existem "
                        f"{faltantes} pergunta(s) sem resposta."
                    ),
                )

            cursor.execute(
                """
                UPDATE diagnosticos
                SET
                    status = 'concluido',
                    finalizado_em = CURRENT_TIMESTAMP
                WHERE id = %s
                  AND empresa_id = %s
                  AND status = 'em_andamento'
                RETURNING id, status, finalizado_em
                """,
                (diagnostico_id, empresa_id),
            )

            diagnostico_concluido = cursor.fetchone()

    if diagnostico_concluido is None:
        raise HTTPException(
            status_code=409,
            detail="O diagnóstico não pôde ser concluído.",
        )

    return {
        "mensagem": "Diagnóstico concluído com sucesso.",
        "diagnostico": {
            "id": diagnostico_concluido[0],
            "status": diagnostico_concluido[1],
            "finalizado_em": diagnostico_concluido[2],
        },
    }


@app.get("/api/resultados/atual", include_in_schema=False)
def obter_resultados_atuais(request: Request):
    empresa_id = request.session.get("empresa_id")

    if not empresa_id:
        raise HTTPException(
            status_code=401,
            detail="É necessário iniciar uma sessão para acessar os resultados.",
        )

    diagnostico = buscar_ultimo_diagnostico_concluido(empresa_id)

    if diagnostico is None:
        raise HTTPException(
            status_code=404,
            detail="Ainda não existe um diagnóstico concluído para esta empresa.",
        )

    diagnostico_id, _ = diagnostico

    return carregar_resultados_diagnostico(diagnostico_id)

@app.post("/api/diagnostico/reiniciar", include_in_schema=False)
def reiniciar_diagnostico(request: Request):
    empresa_id = request.session.get("empresa_id")

    if not empresa_id:
        raise HTTPException(
            status_code=401,
            detail="É necessário iniciar uma sessão para reiniciar o diagnóstico.",
        )

    diagnostico_em_andamento = buscar_diagnostico_em_andamento(empresa_id)

    if diagnostico_em_andamento is not None:
        raise HTTPException(
            status_code=409,
            detail="Já existe um diagnóstico em andamento para esta empresa.",
        )

    diagnostico_concluido = buscar_ultimo_diagnostico_concluido(empresa_id)

    if diagnostico_concluido is None:
        raise HTTPException(
            status_code=404,
            detail="Não existe um diagnóstico concluído para reiniciar.",
        )

    diagnostico_anterior_id, _ = diagnostico_concluido

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM respostas_diagnostico
                WHERE diagnostico_id = %s
                """,
                (diagnostico_anterior_id,),
            )

            cursor.execute(
                """
                DELETE FROM diagnosticos
                WHERE id = %s
                  AND empresa_id = %s
                  AND status = 'concluido'
                """,
                (diagnostico_anterior_id, empresa_id),
            )

            cursor.execute(
                """
                INSERT INTO diagnosticos (empresa_id)
                VALUES (%s)
                RETURNING id, status
                """,
                (empresa_id,),
            )

            novo_diagnostico = cursor.fetchone()

    return {
        "mensagem": "Novo diagnóstico iniciado com sucesso.",
        "diagnostico": {
            "id": novo_diagnostico[0],
            "status": novo_diagnostico[1],
        },
    }
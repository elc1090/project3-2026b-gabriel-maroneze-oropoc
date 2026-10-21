import os
from contextlib import asynccontextmanager
from typing import Annotated, Literal

import psycopg
from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pwdlib import PasswordHash
from pydantic import BaseModel, Field
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
    nome_empresa = (os.getenv("INITIAL_COMPANY_NAME") or "").strip()
    email_empresa = (os.getenv("INITIAL_COMPANY_EMAIL") or "").strip().lower()
    senha_empresa = os.getenv("INITIAL_COMPANY_PASSWORD") or ""

    valores = [
        nome_empresa,
        email_empresa,
        senha_empresa,
    ]

    if any(valores) and not all(valores):
        raise RuntimeError(
            "Defina INITIAL_COMPANY_NAME, INITIAL_COMPANY_EMAIL "
            "e INITIAL_COMPANY_PASSWORD juntos."
        )

    if not all(valores):
        return

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
def cadastrar_residuo(residuo: ResiduoCreate):
    return {
        "mensagem": "Dados validados com sucesso",
        "residuo": residuo.model_dump(),
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
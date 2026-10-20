import os
from contextlib import asynccontextmanager
from typing import Annotated, Literal

import psycopg
from fastapi import FastAPI, Form, Request
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


def abrir_conexao():
    return psycopg.connect(
        host=os.getenv("DB_HOST", "db"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )


def inicializar_banco() -> None:
    usuario_inicial = os.getenv("INITIAL_ADMIN_USER")
    senha_inicial = os.getenv("INITIAL_ADMIN_PASSWORD")

    if bool(usuario_inicial) != bool(senha_inicial):
        raise RuntimeError(
            "INITIAL_ADMIN_USER e INITIAL_ADMIN_PASSWORD devem ser definidos juntos."
        )

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS usuarios (
                    id BIGSERIAL PRIMARY KEY,
                    usuario VARCHAR(80) UNIQUE NOT NULL,
                    senha_hash TEXT NOT NULL,
                    ativo BOOLEAN NOT NULL DEFAULT TRUE,
                    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            if usuario_inicial and senha_inicial:
                usuario_normalizado = usuario_inicial.strip().lower()
                cursor.execute(
                    "SELECT id FROM usuarios WHERE usuario = %s",
                    (usuario_normalizado,),
                )

                if cursor.fetchone() is None:
                    cursor.execute(
                        """
                        INSERT INTO usuarios (usuario, senha_hash)
                        VALUES (%s, %s)
                        """,
                        (usuario_normalizado, password_hash.hash(senha_inicial)),
                    )


def autenticar_usuario(usuario: str, senha: str) -> tuple[int, str] | None:
    usuario_normalizado = usuario.strip().lower()

    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, usuario, senha_hash, ativo
                FROM usuarios
                WHERE usuario = %s
                """,
                (usuario_normalizado,),
            )
            registro = cursor.fetchone()

    if registro is None:
        password_hash.verify(senha, DUMMY_HASH)
        return None

    usuario_id, nome_usuario, senha_armazenada, ativo = registro

    if not ativo or not password_hash.verify(senha, senha_armazenada):
        return None

    return usuario_id, nome_usuario


@asynccontextmanager
async def lifespan(_: FastAPI):
    inicializar_banco()
    yield


app = FastAPI(
    title="ECOAVANZA",
    version="0.2.0",
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
    if request.session.get("usuario_id"):
        return RedirectResponse(url="/painel", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={"erro": None, "usuario": ""},
    )


@app.post("/login", response_class=HTMLResponse, include_in_schema=False)
def realizar_login(
    request: Request,
    usuario: Annotated[str, Form()],
    senha: Annotated[str, Form()],
):
    autenticado = autenticar_usuario(usuario, senha)

    if autenticado is None:
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={
                "erro": "Usuário ou senha inválidos.",
                "usuario": usuario.strip(),
            },
            status_code=401,
        )

    usuario_id, nome_usuario = autenticado
    request.session.clear()
    request.session["usuario_id"] = usuario_id
    request.session["usuario"] = nome_usuario

    return RedirectResponse(url="/painel", status_code=303)


@app.get("/painel", response_class=HTMLResponse, include_in_schema=False)
def painel(request: Request):
    if not request.session.get("usuario_id"):
        return RedirectResponse(url="/", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={"usuario": request.session.get("usuario")},
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

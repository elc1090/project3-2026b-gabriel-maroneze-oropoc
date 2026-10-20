import os
from typing import Literal

import psycopg
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="API de Gestão Ambiental",
    version="0.1.0",
)


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


@app.get("/")
def inicio():
    return {"mensagem": "API de Gestão Ambiental funcionando"}


@app.get("/health")
def verificar_saude():
    with abrir_conexao() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

    return {
        "api": "online",
        "banco": "online",
    }


@app.post("/residuos", status_code=201)
def cadastrar_residuo(residuo: ResiduoCreate):
    return {
        "mensagem": "Dados validados com sucesso",
        "residuo": residuo.model_dump(),
    }
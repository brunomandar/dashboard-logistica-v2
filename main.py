from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
from dotenv import load_dotenv


load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


MONGO_URL = os.getenv("MONGO_URL")


if not MONGO_URL:
    raise ValueError("Variável MONGO_URL não encontrada.")


client = MongoClient(MONGO_URL)

db = client["dashboard_logistica"]
collection = db["projetos"]

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "dashboard-logistica-api"
    }

@app.get("/")
def home():
    return {
        "status": "ok",
        "database": "mongodb"
}

@app.get("/dashboard")
def dashboard(
    gerente: str = None,
    forum: str = None,
    status: str = None
):

    query = {}

    if gerente:
        query["Gerente"] = gerente

    if forum:
        query["Forum"] = forum

    if status:
        query["Status Geral"] = status

    dados = list(
        collection.find(
            query,
            {"_id": 0}
        )
    )

    total = len(dados)

    atrasado = len(
        [x for x in dados if x.get("Status") == "ATRASADO"]
    )

    atencao = len(
        [x for x in dados if x.get("Status") == "ATENÇÃO"]
    )

    prazo = len(
        [x for x in dados if x.get("Status") == "NO PRAZO"]
    )

    planejado = len(
        [x for x in dados if x.get("Status Geral") == "PLANEJADO"]
    )

    em_execucao = len(
        [x for x in dados if x.get("Status Geral") == "EXECUÇÃO"]
    )

    backlog = len(
        [x for x in dados if x.get("Status Geral") == "BACKLOG"]
    )

    prioridade_alta = len(
        [x for x in dados if x.get("Prioridade") == "Alta"]
    )

    prioridade_media = len(
        [x for x in dados if x.get("Prioridade") == "Média"]
    )

    prioridade_baixa = len(
        [x for x in dados if x.get("Prioridade") == "Baixa"]
    )

    return {
        "total": total,
        "atrasado": atrasado,
        "atencao": atencao,
        "prazo": prazo,
        "planejado": planejado,
        "em_execucao": em_execucao,
        "backlog": backlog,
        "prioridade_alta": prioridade_alta,
        "prioridade_media": prioridade_media,
        "prioridade_baixa": prioridade_baixa
    }


@app.get("/projetos")
def projetos(
    gerente: str = None,
    forum: str = None,
    status: str = None
):

    query = {}

    if gerente:
        query["Gerente"] = gerente

    if forum:
        query["Forum"] = forum

    if status:
        query["Status Geral"] = status

    dados = list(
        collection.find(
            query,
            {"_id": 0}
        )
    )

    return dados

@app.get("/acoes")
def acoes(
    gerente: str = "",
    forum: str = ""
):

    query = {}

    if gerente:
        query["Gerente"] = gerente

    if forum:
        query["Forum"] = forum

    dados = list(
        collection.find(
            query,
            {"_id": 0}
        )
    )

    total = len(dados)

    atrasadas = len(
        [x for x in dados
        if x.get("Status Ação") == "ATRASADO"]
    )

    no_prazo = len(
        [x for x in dados
        if x.get("Status Ação") == "NO PRAZO"]
    )

    return {
        "total_acoes": total,
        "acoes_atrasadas": atrasadas,
        "acoes_no_prazo": no_prazo,
        "dados": dados
    }
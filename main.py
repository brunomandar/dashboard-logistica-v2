from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Response
from fastapi.responses import PlainTextResponse
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime


load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# CONEXÃO MONGODB
# =========================

MONGO_URL = os.getenv("MONGO_URL") or os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB", "dashboard_logistica")

if not MONGO_URL:
    raise ValueError("Variável MONGO_URL ou MONGO_URI não encontrada.")

client = MongoClient(MONGO_URL)
db = client[MONGO_DB]

projetos_collection = db["projetos"]
financeiro_collection = db["financeiro"]


# =========================
# FUNÇÕES AUXILIARES
# =========================

def obter_host_mongo(uri):
    try:
        return uri.split("@")[-1].split("/")[0]
    except Exception:
        return "Host nao identificado"

def normalizar_id(valor):
    if valor is None:
        return ""

    return str(valor).strip().upper()


def obter_pmo_responsavel(item):
    return (
        item.get("PMO Responsável")
        or item.get("PMO Responsavel")
        or item.get("PMO responsável")
        or item.get("PMO responsavel")
        or ""
    )


def obter_coordenador(item):
    return (
        item.get("Coordenador")
        or item.get("coordenador")
        or item.get("COORDENADOR")
        or ""
    )


def montar_financeiro_enriquecido():
    financeiros = list(
        financeiro_collection.find(
            {},
            {"_id": 0}
        )
    )

    ids_financeiros = [
        normalizar_id(item.get("ID FIN"))
        for item in financeiros
        if normalizar_id(item.get("ID FIN"))
    ]

    projetos = list(
        projetos_collection.find(
            {"ID": {"$in": ids_financeiros}},
            {"_id": 0}
        )
    )

    projetos_por_id = {
        normalizar_id(projeto.get("ID")): projeto
        for projeto in projetos
    }

    dados_enriquecidos = []

    for item_financeiro in financeiros:
        id_fin = normalizar_id(item_financeiro.get("ID FIN"))
        projeto = projetos_por_id.get(id_fin, {})

        item_final = {
            # Chaves principais
            "ID": projeto.get("ID", item_financeiro.get("ID FIN", "")),
            "ID FIN": item_financeiro.get("ID FIN", ""),

            # Dados vindos da collection projetos
            "Projeto": projeto.get("Projeto", ""),
            "Gerente": projeto.get("Gerente", ""),
            "Coordenador": obter_coordenador(projeto),
            "PMO Responsável": obter_pmo_responsavel(projeto),
            "Forum": projeto.get("Forum", ""),
            "Status Geral": projeto.get("Status Geral", ""),
            "Status": projeto.get("Status", ""),
            "Prioridade": projeto.get("Prioridade", ""),
            "Tipo": projeto.get("Tipo", ""),

            # Dados financeiros
            "Stage": item_financeiro.get("Stage", ""),
            "Forum Fin": item_financeiro.get("Forum Fin", ""),
            "Tipo Orçamento": item_financeiro.get("Tipo Orçamento", ""),
            "Gestor": item_financeiro.get("Gestor", ""),
            "Area": item_financeiro.get("Area", ""),
            "Dt Inicio Captura": item_financeiro.get("Dt Inicio Captura", ""),
            "Dt Fim Captura": item_financeiro.get("Dt Fim Captura", ""),
            "Meta 2026": item_financeiro.get("Meta 2026", None),
            "FCST 2026": item_financeiro.get("FCST 2026", None),
            "Realizado + FCST 2026": item_financeiro.get("Realizado + FCST 2026", None),
            "Saldo contra FCST": item_financeiro.get("Saldo contra FCST", None),
            "Meta 2026 mensalizada": item_financeiro.get("Meta 2026 mensalizada", None),
            "Plano de Ação/Recuperação": item_financeiro.get("Plano de Ação/Recuperação", ""),
            "Atualizado em": item_financeiro.get("Atualizado em", "")
        }

        dados_enriquecidos.append(item_final)

    return dados_enriquecidos


def aplicar_filtros_financeiro(
    dados,
    gerente=None,
    forum=None,
    status=None,
    tipo=None,
    stage=None,
    gestor=None
):
    resultado = dados

    if gerente:
        resultado = [
            item for item in resultado
            if item.get("Gerente") == gerente
        ]

    if forum:
        resultado = [
            item for item in resultado
            if item.get("Forum") == forum
            or item.get("Forum Fin") == forum
        ]

    if status:
        resultado = [
            item for item in resultado
            if item.get("Status Geral") == status
            or item.get("Status") == status
        ]

    if tipo:
        resultado = [
            item for item in resultado
            if item.get("Tipo") == tipo
            or item.get("Tipo Orçamento") == tipo
        ]

    if stage:
        resultado = [
            item for item in resultado
            if item.get("Stage") == stage
        ]

    if gestor:
        resultado = [
            item for item in resultado
            if item.get("Gestor") == gestor
        ]

    return resultado


@app.get("/debug/mongo")
def debug_mongo():
    projeto_mais_recente = db["projetos"].find_one(
        {},
        {"_id": 0, "ID": 1, "Projeto": 1, "ultima_atualizacao_mongo": 1},
        sort=[("ultima_atualizacao_mongo", -1)]
    )

    financeiro_mais_recente = db["financeiro"].find_one(
        {},
        {"_id": 0, "ID FIN": 1, "Stage": 1, "ultima_atualizacao_mongo": 1},
        sort=[("ultima_atualizacao_mongo", -1)]
    )

    def converter_datas(doc):
        if not doc:
            return None

        doc_convertido = {}

        for chave, valor in doc.items():
            if isinstance(valor, datetime):
                doc_convertido[chave] = valor.strftime("%Y-%m-%d %H:%M:%S")
            else:
                doc_convertido[chave] = valor

        return doc_convertido

    return {
        "mongo_host": obter_host_mongo(MONGO_URL),
        "database": db.name,
        "total_projetos": db["projetos"].count_documents({}),
        "total_financeiro": db["financeiro"].count_documents({}),
        "projeto_mais_recente": converter_datas(projeto_mais_recente),
        "financeiro_mais_recente": converter_datas(financeiro_mais_recente)
    }


# =========================
# ROTAS BÁSICAS
# =========================

@app.get("/health", response_class=PlainTextResponse)
def health():
    return "OK"


@app.head("/health")
def health_head():
    return Response(status_code=200)


@app.get("/")
def home():
    return {
        "status": "ok",
        "database": "mongodb",
        "collections": [
            "projetos",
            "financeiro"
        ]
    }


# =========================
# DASHBOARD RESUMO PROJETOS
# =========================

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
        projetos_collection.find(
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


# =========================
# PROJETOS
# =========================

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
        projetos_collection.find(
            query,
            {"_id": 0}
        )
    )

    return dados


# =========================
# AÇÕES
# =========================

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
        projetos_collection.find(
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


# =========================
# FINANCEIRO
# =========================

@app.get("/financeiro")
def financeiro(
    gerente: str = None,
    forum: str = None,
    status: str = None,
    tipo: str = None,
    stage: str = None,
    gestor: str = None
):

    dados = montar_financeiro_enriquecido()

    dados = aplicar_filtros_financeiro(
        dados=dados,
        gerente=gerente,
        forum=forum,
        status=status,
        tipo=tipo,
        stage=stage,
        gestor=gestor
    )

    total = len(dados)

    meta_total = sum(
        item.get("Meta 2026") or 0
        for item in dados
        if isinstance(item.get("Meta 2026"), (int, float))
    )

    fcst_total = sum(
        item.get("FCST 2026") or 0
        for item in dados
        if isinstance(item.get("FCST 2026"), (int, float))
    )

    realizado_fcst_total = sum(
        item.get("Realizado + FCST 2026") or 0
        for item in dados
        if isinstance(item.get("Realizado + FCST 2026"), (int, float))
    )

    saldo_fcst_total = sum(
        item.get("Saldo contra FCST") or 0
        for item in dados
        if isinstance(item.get("Saldo contra FCST"), (int, float))
    )

    return {
        "total": total,
        "meta_total": meta_total,
        "fcst_total": fcst_total,
        "realizado_fcst_total": realizado_fcst_total,
        "saldo_fcst_total": saldo_fcst_total,
        "dados": dados
    }


@app.get("/financeiro/raw")
def financeiro_raw():
    dados = list(
        financeiro_collection.find(
            {},
            {"_id": 0}
        )
    )

    return {
        "total": len(dados),
        "dados": dados
    }
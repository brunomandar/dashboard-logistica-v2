let filtroCardProjeto = "";
let filtroCard = "";
let projetosCache = [];

const COLUNAS_TABELA_DEMANDAS = [
    {
        id: "id",
        titulo: "ID",
        ordenacao: "ID",
        peso: 0.7,
        minimo: 60,
        valorTexto: item => item.ID ?? "",
        valorHtml: item => item.ID ?? ""
    },
    {
        id: "demanda",
        titulo: "Demanda",
        ordenacao: "Projeto",
        peso: 2.8,
        minimo: 230,
        valorTexto: item => item.Projeto ?? "",
        valorHtml: item => item.Projeto ?? ""
    },
    {
        id: "problema",
        titulo: "Ações em execução",
        ordenacao: "Problema / Oportunidade",
        peso: 2.2,
        minimo: 210,
        classe: "celula-texto-longo-demanda",
        valorTexto: item => obterProblemaOportunidade(item),
        valorHtml: item =>
            formatarTextoTabelaDemanda(
                obterProblemaOportunidade(item)
            )
    },
    {
        id: "beneficioQualitativo",
        titulo: "Benef. Qual.",
        ordenacao: "Benefício Qualitativo",
        peso: 2.4,
        minimo: 230,
        classe: "celula-texto-longo-demanda",
        valorTexto: item => obterBeneficioQualitativo(item),
        valorHtml: item =>
            formatarTextoTabelaDemanda(
                obterBeneficioQualitativo(item)
            )
    },
    {
        id: "beneficioQuantitativo",
        titulo: "Benef. 12 Meses",
        ordenacao: "Benefício Quantitativo",
        peso: 1.3,
        minimo: 135,
        classe: "celula-texto-longo-demanda",
        valorTexto: item => obterBeneficioQuantitativo(item),
        valorHtml: item =>
            formatarNumeroDemanda(
                obterBeneficioQuantitativo(item)
            )
    },
    {
        id: "beneficio2026",
        titulo: "Benefício 2026",
        ordenacao: "Benefício 2026",
        peso: 1.3,
        minimo: 135,
        classe: "celula-texto-longo-demanda",
        valorTexto: item => obterBeneficio2026(item),
        valorHtml: item =>
            formatarNumeroDemanda(
                obterBeneficio2026(item)
            )
    },
    {
        id: "realizadoFcstDemanda",
        titulo: "Realizado + FCST",
        ordenacao: "Realizado + FCST",
        peso: 1.4,
    	minimo: 145,
    	classe: "celula-texto-longo-demanda",
    	valorTexto: item => obterRealizadoFcstDemanda(item),
    	valorHtml: item =>
            formatarNumeroDemanda(
                obterRealizadoFcstDemanda(item)
            )
    },
    {
    	id: "eficienciaDemanda",
    	titulo: "Eficiência",
    	ordenacao: "Eficiência",
    	peso: 1.0,
    	minimo: 105,
    	classe: "celula-texto-longo-demanda",
    	valorTexto: item => obterEficienciaDemanda(item),
    	valorHtml: item =>
            formatarNumeroDemanda(
                 obterEficienciaDemanda(item)
            )
    },
    {
    	id: "periodoCapturaDemanda",
    	titulo: "Período Captura",
    	ordenacao: "Período Captura",
    	peso: 1.3,
    	minimo: 135,
    	classe: "celula-texto-longo-demanda",
    	valorTexto: item => obterPeriodoCapturaDemanda(item),
    	valorHtml: item =>
            formatarTextoTabelaDemanda(
                 obterPeriodoCapturaDemanda(item)
            )
    },
    {
        id: "gerente",
        titulo: "Gerente",
        ordenacao: "Gerente",
        peso: 1.1,
        minimo: 115,
        valorTexto: item => item.Gerente ?? "",
        valorHtml: item => item.Gerente ?? ""
    },
    {
        id: "coordenador",
        titulo: "Coordenador",
        ordenacao: "Coordenador",
        peso: 1.35,
        minimo: 145,
        valorTexto: item => obterCoordenador(item),
        valorHtml: item => obterCoordenador(item)
    },
    {
        id: "pmo",
        titulo: "PMO Respons.",
        ordenacao: "PMO Responsável",
        peso: 1.4,
        minimo: 150,
        valorTexto: item => obterPMOResponsavel(item),
        valorHtml: item => obterPMOResponsavel(item)
    },
    {
        id: "forum",
        titulo: "Fórum",
        ordenacao: "Forum",
        peso: 1.2,
        minimo: 130,
        valorTexto: item => item.Forum ?? "",
        valorHtml: item => item.Forum ?? ""
    },
    {
        id: "status",
        titulo: "Status",
        ordenacao: "Status",
        peso: 0.9,
        minimo: 95,
        valorTexto: item => item.Status ?? "",
        valorHtml: item => item.Status ?? ""
    },
    {
        id: "dataFim",
        titulo: "Data Fim",
        ordenacao: "Data Fim",
        peso: 0.9,
        minimo: 90,
        valorTexto: item => formatarDataBR(item["Data Fim"]),
        valorHtml: item => formatarDataBR(item["Data Fim"])
    },
    {
        id: "prioridade",
        titulo: "Prioridade",
        ordenacao: "Prioridade",
        peso: 0.9,
        minimo: 95,
        valorTexto: item => item.Prioridade ?? "",
        valorHtml: item => `
            <span class="prioridade-com-bolinha">
                <span class="bolinha-prioridade ${classePrioridadeGlobal(item.Prioridade)}"></span>
                ${item.Prioridade ?? ""}
            </span>
        `
    }
];

let ordenacaoTabelaProjetos = {
    coluna: "ID",
    direcao: "asc"
};

let ordenacaoTabelaAcoes = {
    coluna: "ID",
    direcao: "asc"
};

let ordenacaoTabelaFinanceiro = {
    coluna: "ID",
    direcao: "asc"
};

function extrairNumeroLog(id) {
    const texto = (id || "").toString().toUpperCase().trim();

    const match = texto.match(/LOG-?\s*(\d+)/);

    if (!match) return 9999;

    return parseInt(match[1], 10);
}

function obterProblemaOportunidade(item) {
    return (
        item["Problema (Oportunidade)"] ??
        item["Problema/Oportunidade"] ??
        item["Problema Oportunidade"] ??
        item["Problema"] ??
        item["Oportunidade"] ??
        ""
    );
}

function obterBeneficioQuantitativo(item) {
    return (
        item["Benefício Quantitativo"] ??
        item["Beneficio Quantitativo"] ??
        item["Benef. Quantitativo"] ??
        item["Benef Quantitativo"] ??
        ""
    );
}

function obterBeneficioQualitativo(item) {
    return (
        item["Benefício Qualitativo"] ??
        item["Beneficio Qualitativo"] ??
        item["Benef. Qualitativo"] ??
        item["Benef Qualitativo"] ??
        ""
    );
}

function obterBeneficio2026(item) {
    return (
        item["Benefício 2026"] ??
        item["Beneficio 2026"] ??
        item["Benef. 2026"] ??
        item["Benef 2026"] ??
        ""
    );
}

function obterRealizadoFcstDemanda(item) {
    return (
        item["Realizado + FCST"] ??
        item["Realizado+FCST"] ??
        item["Realizado+ FCST"] ??
        item["Realizado FCST"] ??
        ""
    );
}

function obterEficienciaDemanda(item) {
    return (
        item["Eficiência"] ??
        item["Eficiencia"] ??
        ""
    );
}

function obterPeriodoCapturaDemanda(item) {
    return (
        item["Período Captura"] ??
        item["Periodo Captura"] ??
        item["Período de Captura"] ??
        item["Periodo de Captura"] ??
        ""
    );
}

function formatarTextoTabelaDemanda(valor) {
    if (valor === null || valor === undefined) return "";

    return valor
        .toString()
        .replace(/_x000D_/g, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "'")
        .replace(/\n+/g, "<br>");
}

function formatarNumeroDemanda(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "";
    }

    /*
      Mantém textos que não são números:
      N/A, (N/A), -, #VALOR!, entre outros.
    */
    if (typeof valor === "string") {
        const texto = valor.trim();

        if (
            texto === "" ||
            texto === "-" ||
            texto.toUpperCase() === "N/A" ||
            texto.toUpperCase() === "(N/A)" ||
            texto.startsWith("#")
        ) {
            return texto;
        }

        /*
          Aceita tanto:
          2.39
          quanto:
          2,39
        */
        const textoNumerico = texto
            .replace(/\s/g, "")
            .replace(",", ".");

        const numeroConvertido = Number(textoNumerico);

        if (isNaN(numeroConvertido)) {
            return texto;
        }

        return numeroConvertido.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    const numero = Number(valor);

    if (isNaN(numero)) {
        return valor.toString();
    }

    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function obterPMOResponsavel(item) {
    return (
        item["PMO Responsável"] ??
        item["PMO Responsavel"] ??
        item["PMO responsável"] ??
        item["PMO responsavel"] ??
        ""
    );
}

/* Plugin próprio para mostrar valores nos gráficos */
const pluginValoresGraficos = {
    id: "valoresGraficos",

    afterDatasetsDraw(chart, args, options) {
        if (!options || options.display === false) return;

        const { ctx } = chart;

        ctx.save();
        ctx.font = `${options.fontWeight || "bold"} ${options.fontSize || 10}px Arial`;
        ctx.fillStyle = options.color || "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (chart.config.type === "bar") {
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);

                if (meta.hidden) return;

                meta.data.forEach((bar, index) => {
                    const value = dataset.data[index];

                    if (!value || value === 0) return;

                    const pos = bar.tooltipPosition();

                    ctx.fillText(value, pos.x, pos.y - 8);
                });
            });
        }

        if (chart.config.type === "doughnut") {
            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

            meta.data.forEach((arc, index) => {
                const value = dataset.data[index];

                if (!value || value === 0) return;

                const pos = arc.tooltipPosition();

                const dx = pos.x - centerX;
                const dy = pos.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                const offset = options.offset || 18;

                const x = pos.x + (dx / distance) * offset;
                const y = pos.y + (dy / distance) * offset;

                ctx.fillText(value, x, y);
            });
        }

        ctx.restore();
    }
};

const pluginTextoCentroRosca = {
    id: "textoCentroRosca",

    afterDatasetsDraw(chart, args, options) {
        if (!options || options.display === false) return;
        if (chart.config.type !== "doughnut") return;

        const { ctx, chartArea } = chart;

        if (!chartArea) return;

        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        ctx.save();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = options.color || "#333";
        ctx.font = `bold ${options.fontSize || 22}px Arial`;
        ctx.fillText(options.textoPrincipal || "100%", centerX, centerY - 6);

        ctx.font = `bold ${options.fontSizeSub || 10}px Arial`;
        ctx.fillStyle = options.colorSub || "#666";
        ctx.fillText(options.textoSecundario || "Total", centerX, centerY + 16);

        ctx.restore();
    }
};

const pluginTotalPorGerente = {
    id: "totalPorGerente",

    afterDraw(chart, args, options) {
        if (!options || options.display !== true) return;
        if (chart.config.type !== "bar") return;

        const { ctx, scales } = chart;
        const xScale = scales.x;

        if (!xScale) return;

        ctx.save();

        ctx.fillStyle = options.color || "#000";
        ctx.font = `bold ${options.fontSize || 14}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        chart.data.labels.forEach((label, index) => {
            let total = 0;

            chart.data.datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);

                if (!meta.hidden) {
                    total += Number(dataset.data[index] || 0);
                }
            });

            if (total === 0) return;

            const x = xScale.getPixelForValue(index);

            /*
              Posição do total:
              - xScale.top é a linha do eixo X.
              - +12 coloca o número acima do nome do gerente.
            */
            const y = xScale.top + (options.offsetY || 13);

            ctx.fillText(total, x, y);
        });

        ctx.restore();
    }
};

if (typeof Chart !== "undefined") {
    Chart.register(pluginValoresGraficos, pluginTextoCentroRosca, pluginTotalPorGerente);
}

function obterCoordenador(item) {
    return (
        item["Coordenador"] ??
        item["coordenador"] ??
        item["COORDENADOR"] ??
        ""
    );
}

function filtrarCardProjeto(tipo) {

    // ✅ toggle (melhor UX-)
    if (filtroCardProjeto === tipo) {
        filtroCardProjeto = "";
    } else {
        filtroCardProjeto = tipo;
    }

    carregarDashboard();
}

function formatarDataBR(valor) {
    if (!valor || valor === "-") return "-";

    const data = new Date(valor);

    if (isNaN(data)) {
        return valor;
    }

    return data.toLocaleDateString("pt-BR", {
        timeZone: "UTC"
    });
}

function ordenarTabelaProjetos(coluna) {
    if (ordenacaoTabelaProjetos.coluna === coluna) {
        ordenacaoTabelaProjetos.direcao =
            ordenacaoTabelaProjetos.direcao === "asc" ? "desc" : "asc";
    } else {
        ordenacaoTabelaProjetos.coluna = coluna;
        ordenacaoTabelaProjetos.direcao = "asc";
    }

    carregarDashboard();
}

function aplicarOrdenacaoTabelaProjetos(lista) {
    const coluna = ordenacaoTabelaProjetos.coluna;
    const direcao = ordenacaoTabelaProjetos.direcao;
    const multiplicador = direcao === "asc" ? 1 : -1;

    return [...lista].sort((a, b) => {
        if (coluna === "ID") {
            return (extrairNumeroLog(a.ID) - extrairNumeroLog(b.ID)) * multiplicador;
        }

        if (coluna === "Data Fim") {
    const dataA = new Date(a["Data Fim"]);
    const dataB = new Date(b["Data Fim"]);

    const timeA = isNaN(dataA) ? 9999999999999 : dataA.getTime();
    const timeB = isNaN(dataB) ? 9999999999999 : dataB.getTime();

    if (timeA !== timeB) {
        return (timeA - timeB) * multiplicador;
    }

        return extrairNumeroLog(a.ID) - extrairNumeroLog(b.ID);
}

        let valorA = "";
        let valorB = "";

        if (coluna === "Projeto") {
            valorA = a.Projeto || "";
            valorB = b.Projeto || "";
        }

        else if (coluna === "Problema (Oportunidade)") {
            valorA = obterProblemaOportunidade(a);
            valorB = obterProblemaOportunidade(b);
        }

        else if (coluna === "Benefício Quantitativo") {
            valorA = obterBeneficioQuantitativo(a);
            valorB = obterBeneficioQuantitativo(b);
        }

        else if (coluna === "Benefício 2026") {
            valorA = obterBeneficio2026(a);
            valorB = obterBeneficio2026(b);
        }

        else if (coluna === "Realizado + FCST") {
            valorA = obterRealizadoFcstDemanda(a);
            valorB = obterRealizadoFcstDemanda(b);
        }

        else if (coluna === "Eficiência") {
            valorA = obterEficienciaDemanda(a);
            valorB = obterEficienciaDemanda(b);
        }

        else if (coluna === "Período Captura") {
            valorA = obterPeriodoCapturaDemanda(a);
            valorB = obterPeriodoCapturaDemanda(b);
        }

        else if (coluna === "Benefício Qualitativo") {
            valorA = obterBeneficioQualitativo(a);
            valorB = obterBeneficioQualitativo(b);
        }

        else if (coluna === "Gerente") {
            valorA = a.Gerente || "";
            valorB = b.Gerente || "";
        }

        else if (coluna === "Coordenador") {
            valorA = obterCoordenador(a);
            valorB = obterCoordenador(b);
        }

        else if (coluna === "PMO Responsável") {
            valorA = obterPMOResponsavel(a);
            valorB = obterPMOResponsavel(b);
        }

        else if (coluna === "Forum") {
            valorA = a.Forum || "";
            valorB = b.Forum || "";
        }

        else if (coluna === "Status Geral") {
            valorA = a["Status Geral"] || "";
            valorB = b["Status Geral"] || "";
        }

        else if (coluna === "Status") {
            valorA = a.Status || "";
            valorB = b.Status || "";
        }

        else if (coluna === "Prioridade") {
            valorA = a.Prioridade || "";
            valorB = b.Prioridade || "";
        }

        const comparacao = valorA
            .toString()
            .localeCompare(
                valorB.toString(),
                "pt-BR",
                {
                    sensitivity: "base",
                    numeric: true
                }
            );

        if (comparacao !== 0) {
            return comparacao * multiplicador;
        }

        // Critério secundário para manter LOG em ordem dentro de grupos iguais
        return extrairNumeroLog(a.ID) - extrairNumeroLog(b.ID);
    });
}

function ordenarTabelaAcoes(coluna) {
    if (ordenacaoTabelaAcoes.coluna === coluna) {
        ordenacaoTabelaAcoes.direcao =
            ordenacaoTabelaAcoes.direcao === "asc" ? "desc" : "asc";
    } else {
        ordenacaoTabelaAcoes.coluna = coluna;
        ordenacaoTabelaAcoes.direcao = "asc";
    }

    carregarAcoes();
}

function aplicarOrdenacaoTabelaAcoes(lista) {
    const coluna = ordenacaoTabelaAcoes.coluna;
    const direcao = ordenacaoTabelaAcoes.direcao;
    const multiplicador = direcao === "asc" ? 1 : -1;

    const normalizarTexto = (valor) => {
        return (valor || "")
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase();
    };

    const converterData = (valor) => {
        if (!valor || valor === "-") return null;

        const data = new Date(valor);

        if (!isNaN(data)) {
            return data.getTime();
        }

        return null;
    };

    return [...lista].sort((a, b) => {
        if (coluna === "ID") {
            return (extrairNumeroLog(a.ID) - extrairNumeroLog(b.ID)) * multiplicador;
        }

        if (coluna === "Prazo da Ação") {
            const dataA = converterData(a["Prazo da Ação"]);
            const dataB = converterData(b["Prazo da Ação"]);

            if (dataA === null && dataB === null) {
                return extrairNumeroLog(a.ID) - extrairNumeroLog(b.ID);
            }

            if (dataA === null) return 1;
            if (dataB === null) return -1;

            return (dataA - dataB) * multiplicador;
        }

        let valorA = "";
        let valorB = "";

        if (coluna === "Projeto") {
            valorA = a.Projeto || "";
            valorB = b.Projeto || "";
        }

        else if (coluna === "Status Ação") {
            valorA = a["Status Ação"] || "";
            valorB = b["Status Ação"] || "";
        }

        else if (coluna === "Ações") {
            valorA = a["Ações"] || "";
            valorB = b["Ações"] || "";
        }

        else if (coluna === "Coordenador") {
            valorA = obterCoordenador(a);
            valorB = obterCoordenador(b);
        }

        else if (coluna === "PMO Responsável") {
            valorA = obterPMOResponsavel(a);
            valorB = obterPMOResponsavel(b);
        }

        const comparacao = normalizarTexto(valorA).localeCompare(
            normalizarTexto(valorB),
            "pt-BR",
            {
                sensitivity: "base",
                numeric: true
            }
        );

        if (comparacao !== 0) {
            return comparacao * multiplicador;
        }

        return extrairNumeroLog(a.ID) - extrairNumeroLog(b.ID);
    });
}

// =============================
// ✅ 1. FILTROS PROJETOS
// =============================
function carregarFiltrosProjetos() {
    fetch("https://dashboard-logistica-v2.onrender.com/projetos")
        .then(response => response.json())
        .then(lista => {
            projetosCache = Array.isArray(lista) ? lista : (lista.dados || []);

            const selGerente = document.getElementById("filtroGerente");
            const selForum = document.getElementById("filtroForum");
            const selStatus = document.getElementById("filtroStatus");

            if (!selGerente) return;

            const gerentes = [...new Set(projetosCache.map(p => p.Gerente).filter(Boolean))];
            const foruns = [...new Set(projetosCache.map(p => p.Forum).filter(Boolean))];
            const status = [
    ...new Set(
        projetosCache
            .map(p => p["Status Geral"])
            .filter(Boolean)
            .filter(s => {
                const valor = s
                    .toString()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .trim()
                    .toUpperCase();

                return valor !== "DUPLICADO";
            })
    )
];

            selGerente.innerHTML = '<option value="">Todos</option>';
            selForum.innerHTML = '<option value="">Todos</option>';
            selStatus.innerHTML = '<option value="">Todos</option>';

            gerentes.forEach(g => selGerente.add(new Option(g, g)));
            foruns.forEach(f => selForum.add(new Option(f, f)));
            status.forEach(s => selStatus.add(new Option(s, s)));

            carregarDashboard();
        })
        .catch(err => console.error("Erro ao carregar projetos:", err));
}

function obterSituacoesSelecionadas() {
    const todas = document.getElementById("situacaoTodas");
    const checks = document.querySelectorAll(".check-situacao");

    if (!todas) {
        return ["TODAS"];
    }

    if (todas.checked) {
        return ["TODAS"];
    }

    const selecionadas = [...checks]
        .filter(check => check.checked)
        .map(check => check.value);

    if (selecionadas.length === 0) {
        todas.checked = true;
        return ["TODAS"];
    }

    return selecionadas;
}

function atualizarTextoBotaoSituacao() {
    const btn = document.getElementById("btnSituacao");
    const todas = document.getElementById("situacaoTodas");
    const checks = document.querySelectorAll(".check-situacao");

    if (!btn || !todas) return;

    if (todas.checked) {
        btn.innerText = "Todas";
        return;
    }

    const selecionadas = [...checks]
        .filter(check => check.checked)
        .map(check => {
            if (check.value === "ATIVAS") return "Ativas";
            if (check.value === "NAO_ATIVAS") return "Não Ativas";
            if (check.value === "BACKLOG") return "Backlog";
            return check.value;
        });

    if (selecionadas.length === 0) {
        todas.checked = true;
        btn.innerText = "Todas";
        return;
    }

    if (selecionadas.length === 1) {
        btn.innerText = selecionadas[0];
        return;
    }

    btn.innerText = `${selecionadas.length} selecionadas`;
}

function configurarFiltroSituacao() {
    const dropdown = document.getElementById("dropdownSituacao");
    const btn = document.getElementById("btnSituacao");
    const todas = document.getElementById("situacaoTodas");
    const checks = document.querySelectorAll(".check-situacao");

    if (!dropdown || !btn || !todas) return;

    btn.addEventListener("click", function (event) {
        event.stopPropagation();
        dropdown.classList.toggle("aberto");
    });

    todas.addEventListener("change", function () {
        if (todas.checked) {
            checks.forEach(check => {
                check.checked = false;
            });
        } else {
            const algumSelecionado = [...checks].some(check => check.checked);

            if (!algumSelecionado) {
                todas.checked = true;
            }
        }

        atualizarTextoBotaoSituacao();
        carregarDashboard();
    });

    checks.forEach(check => {
        check.addEventListener("change", function () {
            const algumSelecionado = [...checks].some(c => c.checked);

            if (algumSelecionado) {
                todas.checked = false;
            } else {
                todas.checked = true;
            }

            atualizarTextoBotaoSituacao();
            carregarDashboard();
        });
    });

    document.addEventListener("click", function (event) {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("aberto");
        }
    });

    atualizarTextoBotaoSituacao();
}

// =============================
// ✅ 2. DASHBOARD PROJETOS (CORRIGIDO)
// =============================
function carregarDashboard() {
    const gerente = document.getElementById("filtroGerente")?.value || "";
    const forum = document.getElementById("filtroForum")?.value || "";
    const status = document.getElementById("filtroStatus")?.value || "";
    const pesquisa = document.getElementById("pesquisaProjetos")?.value || "";
    const somenteRE = document.getElementById("filtroRE")?.checked || false;
    const situacoesSelecionadas = obterSituacoesSelecionadas();

    const normalizar = (valor) => {
    return (valor || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();
};

const classePrioridade = (prioridade) => {
    const valor = normalizar(prioridade);

    if (valor === "P0") return "p0";
    if (valor === "P1") return "p1";
    if (valor === "P2") return "p2";

    return "";
};

   const obterCampoPesquisaProjetos = (item, campo) => {
    const campoNormalizado = normalizar(campo);

    if (campoNormalizado === "ID") {
        return item.ID;
    }

    if (
        campoNormalizado === "PROJETO" ||
        campoNormalizado === "DEMANDA" ||
        campoNormalizado === "DEMANDAS"
    ) {
        return item.Projeto;
    }

    if (
    campoNormalizado === "PROBLEMA" ||
    campoNormalizado === "OPORTUNIDADE" ||
    campoNormalizado === "PROBLEMA OPORTUNIDADE" ||
    campoNormalizado === "PROBLEMA (OPORTUNIDADE)"
    ) {
        return obterProblemaOportunidade(item);
    }

    if (
    campoNormalizado === "BENEFICIO QUANTITATIVO" ||
    campoNormalizado === "BENEFÍCIO QUANTITATIVO" ||
    campoNormalizado === "BENEF QUANT" ||
    campoNormalizado === "BENEF. QUANT"
    ) {
        return obterBeneficioQuantitativo(item);
    }

    if (
    campoNormalizado === "BENEFICIO 2026" ||
    campoNormalizado === "BENEFÍCIO 2026" ||
    campoNormalizado === "BENEF 2026" ||
    campoNormalizado === "BENEF. 2026"
    ) {
        return obterBeneficio2026(item);
    }

    if (
    campoNormalizado === "REALIZADO" ||
    campoNormalizado === "REALIZADO FCST" ||
    campoNormalizado === "REALIZADO + FCST"
    ) {
        return obterRealizadoFcstDemanda(item);
    }

    if (
    campoNormalizado === "EFICIENCIA" ||
    campoNormalizado === "EFICIÊNCIA"
    ) {
        return obterEficienciaDemanda(item);
    }

    if (
    campoNormalizado === "PERIODO CAPTURA" ||
    campoNormalizado === "PERÍODO CAPTURA" ||
    campoNormalizado === "PERIODO DE CAPTURA" ||
    campoNormalizado === "PERÍODO DE CAPTURA"
    ) {
        return obterPeriodoCapturaDemanda(item);
    }

    if (
    campoNormalizado === "BENEFICIO QUALITATIVO" ||
    campoNormalizado === "BENEFÍCIO QUALITATIVO" ||
    campoNormalizado === "BENEF QUAL" ||
    campoNormalizado === "BENEF. QUAL"
    ) {
        return obterBeneficioQualitativo(item);
    }

    if (campoNormalizado === "GERENTE") {
        return item.Gerente;
    }

    if (campoNormalizado === "COORDENADOR") {
        return obterCoordenador(item);
    }

    if (
        campoNormalizado === "PMO" ||
        campoNormalizado === "PMO RESPONSAVEL" ||
        campoNormalizado === "PMO RESPONSÁVEL"
    ) {
        return obterPMOResponsavel(item);
    }

    if (
        campoNormalizado === "FORUM" ||
        campoNormalizado === "FÓRUM"
    ) {
        return item.Forum;
    }

    if (
        campoNormalizado === "STATUS GERAL" ||
        campoNormalizado === "STATUSGERAL"
    ) {
        return item["Status Geral"];
    }

    if (campoNormalizado === "STATUS") {
        return item.Status;
    }

    if (
        campoNormalizado === "DATA FIM" ||
        campoNormalizado === "DATAFIM" ||
        campoNormalizado === "PRAZO"
    ) {
        return formatarDataBR(item["Data Fim"]);
    }

    if (campoNormalizado === "PRIORIDADE") {
        return item.Prioridade;
    }

    if (campoNormalizado === "RE") {
        return item.RE;
    }

    return "";
};

const linhaContemPesquisa = (item, termo) => {
    if (!termo || !termo.trim()) return true;

    const partes = termo
        .split(";")
        .map(p => p.trim())
        .filter(Boolean);

    /*
      Pesquisa somente nas colunas visíveis da tabela Demandas:
      ID, Demanda, Gerente, Coordenador, PMO Responsável, Fórum,
      Status Geral, Status, Data Fim e Prioridade.

      Não pesquisa em Ações, Responsável, Status Ação ou Prazo da Ação,
      porque esses campos não aparecem nesta tabela e geravam falsos positivos.
    */
    const textoLinhaVisivel = [
        item.ID,
        item.Projeto,
        obterProblemaOportunidade(item),
        obterBeneficioQuantitativo(item),
        obterBeneficioQualitativo(item),
        item.Gerente,
        obterCoordenador(item),
        obterPMOResponsavel(item),
        item.Forum,
        item["Status Geral"],
        item.Status,
        formatarDataBR(item["Data Fim"]),
        item.Prioridade
    ]
        .map(valor => normalizar(valor))
        .join(" ");

    return partes.every(parte => {
        if (parte.includes("=")) {
            const [campo, ...resto] = parte.split("=");
            const valorBuscado = resto.join("=").trim();

            if (!campo || !valorBuscado) return true;

            const valorCampo = normalizar(obterCampoPesquisaProjetos(item, campo));
            const valorFiltro = normalizar(valorBuscado);

            return valorCampo.includes(valorFiltro);
        }

        const palavras = normalizar(parte)
            .split(" ")
            .map(p => p.trim())
            .filter(Boolean);

        /*
          Regra:
          - Se digitar uma palavra, a linha precisa conter essa palavra.
          - Se digitar mais de uma palavra, a linha precisa conter todas as palavras.
          Exemplo:
          "torre de controle" só retorna linhas que contenham TORRE, DE e CONTROLE
          em alguma coluna visível da tabela.
        */
        return palavras.every(palavra => textoLinhaVisivel.includes(palavra));
    });
};

const ehDuplicado = (item) => {
    const statusGeral = normalizar(item["Status Geral"]);
    const statusPrazo = normalizar(item.Status);

    return (
        statusGeral === "DUPLICADO" ||
        statusPrazo === "DUPLICADO"
    );
};

const ehCancelado = (item) => {
    const statusGeral = normalizar(item["Status Geral"]);
    const statusPrazo = normalizar(item.Status);

    return (
        statusGeral === "CANCELADO" ||
        statusPrazo === "CANCELADO"
    );
};

const ehConcluido = (item) => {
    const statusGeral = normalizar(item["Status Geral"]);
    const statusPrazo = normalizar(item.Status);

    return (
        statusGeral === "CONCLUIDO" ||
        statusGeral === "CONCLUÍDO" ||
        statusPrazo === "CONCLUIDO" ||
        statusPrazo === "CONCLUÍDO"
    );
};

const ehBacklog = (item) => {
    const statusGeral = normalizar(item["Status Geral"]);

    return statusGeral === "BACKLOG";
};

const ehDemandaAtiva = (item) => {
    const statusGeral = normalizar(item["Status Geral"]);

    return (
        statusGeral === "EXECUCAO" ||
        statusGeral === "EXECUÇÃO" ||
        statusGeral === "PLANEJADO"
    );
};

const ehDemandaNaoAtiva = (item) => {
    const statusGeral = normalizar(item["Status Geral"]);

    return statusGeral === "ENCERRADO";
};

const passaFiltroSituacao = (item) => {
    if (
        !situacoesSelecionadas ||
        situacoesSelecionadas.length === 0 ||
        situacoesSelecionadas.includes("TODAS")
    ) {
        return true;
    }

    return situacoesSelecionadas.some(situacao => {
        if (situacao === "ATIVAS") {
            return ehDemandaAtiva(item);
        }

        if (situacao === "NAO_ATIVAS") {
            return ehDemandaNaoAtiva(item);
        }

        if (situacao === "BACKLOG") {
            return ehBacklog(item);
        }

        return false;
    });
};

const escaparAtributoHtml = (valor) => {
    return (valor || "")
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

const obterJustificativaCancelamento = (item) => {
    const acao = item["Ações"] || item["Acoes"] || "";

    if (!acao) {
        return "Sem justificativa de cancelamento cadastrada.";
    }

    return `Justificativa do cancelamento: ${acao}`;
};

    const setTexto = (id, valor) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.innerText = valor ?? 0;
        }
    };

    let projetos = projetosCache.filter(p => {
    const okDuplicado = !ehDuplicado(p);
    const okGerente = !gerente || p.Gerente === gerente;
    const okForum = !forum || p.Forum === forum;
    const okStatus = !status || p["Status Geral"] === status;
    const okPesquisa = linhaContemPesquisa(p, pesquisa);
    const okRE = !somenteRE || normalizar(p.RE) === "S";
    const okSituacao = passaFiltroSituacao(p);

    return (
        okDuplicado &&
        okGerente &&
        okForum &&
        okStatus &&
        okPesquisa &&
        okRE &&
        okSituacao
    );
});

    const total = projetos.length;
const atrasado = projetos.filter(p => normalizar(p.Status) === "ATRASADO").length;
const atencao = projetos.filter(p => normalizar(p.Status) === "ATENCAO").length;
const prazo = projetos.filter(p => normalizar(p.Status) === "NO PRAZO").length;

const cancelado = projetos.filter(p => ehCancelado(p)).length;
const concluido = projetos.filter(p => ehConcluido(p)).length;

setTexto("total", total);
setTexto("atrasado", atrasado);
setTexto("atencao", atencao);
setTexto("prazo", prazo);
setTexto("cancelado", cancelado);
setTexto("concluido", concluido);

// =========================
// BASE VISUAL FILTRADA PELO CARD
// Esta lista será usada pelos gráficos e pela tabela
// =========================

let projetosVisual = [...projetos];

if (filtroCardProjeto === "ATRASADO") {
    projetosVisual = projetosVisual.filter(i => normalizar(i.Status) === "ATRASADO");

} else if (filtroCardProjeto === "NO PRAZO") {
    projetosVisual = projetosVisual.filter(i => normalizar(i.Status) === "NO PRAZO");

} else if (filtroCardProjeto === "ATENÇÃO") {
    projetosVisual = projetosVisual.filter(i => normalizar(i.Status) === "ATENCAO");

} else if (filtroCardProjeto === "CANCELADO") {
    projetosVisual = projetosVisual.filter(i => ehCancelado(i));

} else if (filtroCardProjeto === "CONCLUIDO") {
    projetosVisual = projetosVisual.filter(i => ehConcluido(i));
}

// Prioridades agora são calculadas com a base visual filtrada
const prioridadeP0 = projetosVisual.filter(p => normalizar(p.Prioridade) === "P0").length;
const prioridadeP1 = projetosVisual.filter(p => normalizar(p.Prioridade) === "P1").length;
const prioridadeP2 = projetosVisual.filter(p => normalizar(p.Prioridade) === "P2").length;


   // =========================
// GRÁFICO ROSCA
// =========================

const ctxPrioridade = document.getElementById("graficoPrioridade");

if (ctxPrioridade && typeof Chart !== "undefined") {
    if (window.grafico) {
        window.grafico.destroy();
    }

    const totalPrioridades = prioridadeP0 + prioridadeP1 + prioridadeP2;

    window.grafico = new Chart(ctxPrioridade.getContext("2d"), {
        type: "doughnut",
        data: {
            labels: ["P0", "P1", "P2"],
            datasets: [{
                data: [
                    prioridadeP0,
                    prioridadeP1,
                    prioridadeP2
                ],
                backgroundColor: [
                    "#990000",
                    "#ff3333",
                    "#ffb3b3"
                ],
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "55%",

            layout: {
                padding: {
                    top: 15,
                    right: 25,
                    bottom: 5,
                    left: 25
                }
            },

            onClick: function(event, elements, chart) {
                const total = chart.data.datasets[0].data.reduce((acc, valor) => acc + valor, 0);

                if (!elements || elements.length === 0 || total === 0) {
                    chart.options.plugins.textoCentroRosca.textoPrincipal = total === 0 ? "0%" : "100%";
                    chart.options.plugins.textoCentroRosca.textoSecundario = "Total";
                    chart.update();
                    return;
                }

                const index = elements[0].index;
                const label = chart.data.labels[index];
                const value = chart.data.datasets[0].data[index];

                const percentual = ((value / total) * 100)
                    .toFixed(1)
                    .replace(".", ",") + "%";

                chart.options.plugins.textoCentroRosca.textoPrincipal = percentual;
                chart.options.plugins.textoCentroRosca.textoSecundario = label;

                chart.update();
            },

            plugins: {
                textoCentroRosca: {
                    display: true,
                    textoPrincipal: totalPrioridades > 0 ? "100%" : "0%",
                    textoSecundario: "Total",
                    fontSize: 22,
                    fontSizeSub: 10,
                    color: "#333",
                    colorSub: "#666"
                },

                valoresGraficos: {
                    display: true,
                    fontSize: 10,
                    fontWeight: "bold",
                    color: "#333",
                    offset: 18
                },

                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.92)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: "#ffffff",
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true,
                    titleFont: {
                        size: 12,
                        weight: "bold"
                    },
                    bodyFont: {
                        size: 12,
                        weight: "bold"
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            return `${label}: ${value}`;
                        }
                    }
                },

                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 10,
                        padding: 8,
                        font: {
                            size: 10
                        }
                    }
                },

                title: {
                    display: true,
                    text: "Prioridade das Demandas",
                    font: {
                        size: 14,
                        weight: "bold"
                    }
                }
            }
        }
    });
}

    // =========================
    // GRÁFICO BARRAS
    // =========================

    const ctxBarras = document.getElementById("graficoGerenciaForum");

    if (ctxBarras && typeof Chart !== "undefined") {
        if (window.grafico2) {
            window.grafico2.destroy();
        }

        const gerentes = [...new Set(projetosVisual.map(p => p.Gerente).filter(Boolean))];
        const foruns = [...new Set(projetosVisual.map(p => p.Forum).filter(Boolean))];

        const cores = [
            "#000000",
            "#e53935",
            "#808080",
            "#ff9999",
            "#990000",
            "#d32f2f"
        ];

        const datasets = foruns.map((forumNome, index) => {
            return {
                label: forumNome,
                data: gerentes.map(gerenteNome =>
                    projetosVisual.filter(p => p.Gerente === gerenteNome && p.Forum === forumNome).length
                ),
                backgroundColor: cores[index % cores.length]
            };
        });

        window.grafico2 = new Chart(ctxBarras.getContext("2d"), {
            type: "bar",
            data: {
                labels: gerentes,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                layout: {
                    padding: {
                        top: 25,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }
                },

                plugins: {
                   totalPorGerente: {
                       display: true,
                       fontSize: 12,
                       color: "#000",
                       offsetY: 13
                   },

                   legend: {
                        position: "bottom",
                        labels: {
                            boxWidth: 10,
                            padding: 8,
                            font: {
                                size: 10
                            }
                        }
                    },

                    title: {
                        display: true,
                        text: "Demandas por Gerente x Fórum",
                        font: {
                            size: 14,
                            weight: "bold"
                        },
                        padding: {
                            bottom: 10
                        }
                    },

                    datalabels: {
                        display: true,
                        anchor: "end",
                        align: "top",
                        offset: 2,
                        clamp: true,
                        clip: false,
                        color: "#333",
                        font: {
                            size: 9,
                            weight: "bold"
                        },
                        formatter: function(value) {
                            return value > 0 ? value : "";
                        }
                    }
                },

                
scales: {
    y: {
        beginAtZero: true,
        grace: "25%",

        ticks: {
            display: false
        },

        grid: {
            display: false,
            drawBorder: false
        },

        border: {
            display: false
        }
    },

    x: {
        grid: {
            display: false,
            drawBorder: false
        },

        border: {
            display: false
        },

        ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            padding: 13,

            font: {
                size: 8
            },

            callback: function(value) {
                const label = this.getLabelForValue(value);

                if (!label) return "";

                const partes = label.split(" ");

                if (partes.length >= 3) {
                    return [
                        partes[0],
                        partes.slice(1).join(" ")
                    ];
                }

                return label;

                            }
                        }
                    }
                }
            }
        });
    }

    // =========================
    // FILTRO POR CARD
    // =========================

    let listaFiltrada = [...projetosVisual];     

    // =========================
    // TABELA
    // =========================

    listaFiltrada = aplicarOrdenacaoTabelaProjetos(listaFiltrada);

    const colunasVisiveis = obterColunasDemandasVisiveis();

    montarCabecalhoTabelaDemandas(colunasVisiveis);
    montarLinhasTabelaDemandas(listaFiltrada, colunasVisiveis);
    ajustarLarguraTabelaDemandas(colunasVisiveis);

}

// =============================
// ✅ AÇÕES (CORRIGIDO)
// =============================
// =============================
// ✅ AÇÕES
// =============================
function carregarFiltrosAcoes() {

    fetch("https://dashboard-logistica-v2.onrender.com/acoes")
        .then(res => res.json())
        .then(data => {

            const selGerente = document.getElementById("filtroGerenteAcoes");
            const selForum = document.getElementById("filtroForumAcoes");
            const selStatus = document.getElementById("filtroStatusAcoes");

            if (!selGerente) return;

            const lista = data.dados || [];

            const normalizar = (valor) => {
                return (valor || "")
                    .toString()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .trim()
                    .toUpperCase();
            };

            const normalizarStatusAcao = (valor) => {
                const status = normalizar(valor);

                if (status === "" || status === "SEM ACAO") {
                    return "SEM AÇÃO";
                }

                if (status === "ATENCAO") {
                    return "ATENÇÃO";
                }

                return valor || "SEM AÇÃO";
            };

            const gerentes = [...new Set(lista.map(p => p.Gerente).filter(Boolean))];
            const foruns = [...new Set(lista.map(p => p.Forum).filter(Boolean))];
            const statusAcoes = [...new Set(lista.map(p => p["Status Geral"]).filter(Boolean))];

            selGerente.innerHTML = '<option value="">Todos</option>';
            selForum.innerHTML = '<option value="">Todos</option>';

            if (selStatus) {
                selStatus.innerHTML = '<option value="">Todos</option>';
            }

            gerentes.forEach(g => selGerente.add(new Option(g, g)));
            foruns.forEach(f => selForum.add(new Option(f, f)));

            if (selStatus) {
                statusAcoes.forEach(s => selStatus.add(new Option(s, s)));
            }

            carregarAcoes();
        })
        .catch(err => console.error("Erro ao carregar filtros de ações:", err));
}

function carregarAcoes() {

    const gerente = document.getElementById("filtroGerenteAcoes")?.value || "";
    const forum = document.getElementById("filtroForumAcoes")?.value || "";
    const statusFiltro = document.getElementById("filtroStatusAcoes")?.value || "";
    const pesquisaAcoes = document.getElementById("pesquisaAcoes")?.value || "";
    const somenteREAcoes = document.getElementById("filtroREAcoes")?.checked || false;

    fetch(`https://dashboard-logistica-v2.onrender.com/acoes?gerente=${encodeURIComponent(gerente)}&forum=${encodeURIComponent(forum)}`)
        .then(res => res.json())
        .then(data => {

            const normalizar = (valor) => {
                return (valor || "")
                    .toString()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .trim()
                    .toUpperCase();
            };

            const obterCampoPesquisaAcoes = (item, campo) => {
                const campoNormalizado = normalizar(campo);

    if (campoNormalizado === "ID") {
        return item.ID;
    }

    if (
        campoNormalizado === "PROJETO" ||
        campoNormalizado === "DEMANDA" ||
        campoNormalizado === "DEMANDAS"
    ) {
        return item.Projeto;
    }

    if (
        campoNormalizado === "STATUS" ||
        campoNormalizado === "STATUS ACAO" ||
        campoNormalizado === "STATUS AÇÃO"
    ) {
        return item["Status Ação"];
    }

    if (
        campoNormalizado === "ACAO" ||
        campoNormalizado === "AÇÃO" ||
        campoNormalizado === "ACOES" ||
        campoNormalizado === "AÇÕES"
    ) {
        return item["Ações"];
    }

    if (
        campoNormalizado === "PRAZO" ||
        campoNormalizado === "PRAZO ACAO" ||
        campoNormalizado === "PRAZO AÇÃO" ||
        campoNormalizado === "PRAZO DA ACAO" ||
        campoNormalizado === "PRAZO DA AÇÃO"
    ) {
        return formatarDataBR(item["Prazo da Ação"]);
    }

    if (campoNormalizado === "COORDENADOR") {
        return obterCoordenador(item);
    }

    if (
        campoNormalizado === "PMO" ||
        campoNormalizado === "PMO RESPONSAVEL" ||
        campoNormalizado === "PMO RESPONSÁVEL"
    ) {
        return obterPMOResponsavel(item);
    }

    return "";
};

const linhaContemPesquisaAcoes = (item, termo) => {
    if (!termo || !termo.trim()) return true;

    const partes = termo
        .split(";")
        .map(p => p.trim())
        .filter(Boolean);

    /*
      Pesquisa somente nas colunas visíveis da tabela Ações:
      ID, Demanda, Status Ação, Ações, Prazo da Ação,
      Coordenador e PMO Responsável.

      Não pesquisa em Gerente, Fórum, Status Geral ou RE,
      porque esses campos não aparecem nesta tabela.
    */
    const textoLinhaVisivel = [
        item.ID,
        item.Projeto,
        item["Status Ação"],
        item["Ações"],
        formatarDataBR(item["Prazo da Ação"]),
        obterCoordenador(item),
        obterPMOResponsavel(item)
    ]
        .map(valor => normalizar(valor))
        .join(" ");

    return partes.every(parte => {
        if (parte.includes("=")) {
            const [campo, ...resto] = parte.split("=");
            const valorBuscado = resto.join("=").trim();

            if (!campo || !valorBuscado) return true;

            const valorCampo = normalizar(obterCampoPesquisaAcoes(item, campo));
            const valorFiltro = normalizar(valorBuscado);

            return valorCampo.includes(valorFiltro);
        }

        const palavras = normalizar(parte)
            .split(" ")
            .map(p => p.trim())
            .filter(Boolean);

        /*
          Regra:
          - Uma palavra: precisa existir na linha visível.
          - Várias palavras: todas precisam existir na linha visível.
          Exemplo:
          "apuracao maio" só retorna linhas que tenham APURACAO e MAIO
          em alguma coluna visível da tabela.
        */
        return palavras.every(palavra => textoLinhaVisivel.includes(palavra));
    });
};

            const ehDuplicadoAcao = (item) => {
    const statusGeral = normalizar(item["Status Geral"]);
    const statusPrazo = normalizar(item.Status);

    return (
        statusGeral === "DUPLICADO" ||
        statusPrazo === "DUPLICADO"
    );
}; 

            const ehSemAcao = (item) => {
                const status = normalizar(item["Status Ação"]);
                const acao = normalizar(item["Ações"]);

                return (
                    status === "" ||
                    status === "SEM ACAO" ||
                    status === "SEM AÇÃO" ||
                    acao === "" ||
                    acao === "SEM ACAO" ||
                    acao === "SEM AÇÃO"
                );
            };

            const obterStatusAcao = (item) => {
                const status = normalizar(item["Status Ação"]);

                if (status === "" || status === "SEM ACAO") {
                    return "SEM ACAO";
                }

                return status;
            };

            let dados = (data.dados || []).filter(i => {
                const okDuplicado = !ehDuplicadoAcao(i);
                const okRE = !somenteREAcoes || normalizar(i.RE) === "S";

                return okDuplicado && okRE;
});

            // Aplica filtro Status
            // Aplica filtro Status Geral da demanda
            if (statusFiltro) {
                     const statusNormalizado = normalizar(statusFiltro);

                     dados = dados.filter(i => {
            return normalizar(i["Status Geral"]) === statusNormalizado;
          });
     }

// Aplica pesquisa geral na aba Ações
if (pesquisaAcoes) {
    dados = dados.filter(i => linhaContemPesquisaAcoes(i, pesquisaAcoes));
}

            const totalPrazo = dados.filter(i => normalizar(i["Status Ação"]) === "NO PRAZO").length;
            const totalAtencao = dados.filter(i => normalizar(i["Status Ação"]) === "ATENCAO").length;
            const totalAtrasado = dados.filter(i => normalizar(i["Status Ação"]) === "ATRASADO").length;
            const semAcao = dados.filter(i => ehSemAcao(i)).length;

const statusGraficoAcoes = [
    {
        label: "No Prazo",
        valor: totalPrazo,
        backgroundColor: "#74c69d",
        borderColor: "#74c69d"
    },
    {
        label: "Atenção",
        valor: totalAtencao,
        backgroundColor: "#ffd166",
        borderColor: "#f4d35e"
    },
    {
        label: "Atrasado",
        valor: totalAtrasado,
        backgroundColor: "#ef767a",
        borderColor: "#e57373"
    },
    {
        label: "Sem Ação",
        valor: semAcao,
        backgroundColor: "#b8b8b8",
        borderColor: "#bfbfbf"
    }
].filter(item => item.valor > 0);

            // Cards
            if (document.getElementById("total_acoes")) {
                document.getElementById("total_acoes").innerText = dados.length;
            }

            if (document.getElementById("acoes_no_prazo")) {
                document.getElementById("acoes_no_prazo").innerText = totalPrazo;
            }

            if (document.getElementById("acoes_atencao")) {
                document.getElementById("acoes_atencao").innerText = totalAtencao;
            }

            if (document.getElementById("acoes_atrasadas")) {
                document.getElementById("acoes_atrasadas").innerText = totalAtrasado;
            }

            if (document.getElementById("acoes_sem_acao")) {
                document.getElementById("acoes_sem_acao").innerText = semAcao;
            }

            // Gráfico
            const ctx = document.getElementById("graficoAcoes");

            if (ctx && typeof Chart !== "undefined") {

                if (window.graficoAcoes instanceof Chart) {
                    window.graficoAcoes.destroy();
                }

                const contexto = ctx.getContext("2d");

                window.graficoAcoes = new Chart(contexto, {
                    type: "bar",
                    data: {
    labels: statusGraficoAcoes.map(item => item.label),
    datasets: [{
        label: "Quantidade",
        data: statusGraficoAcoes.map(item => item.valor),
        backgroundColor: statusGraficoAcoes.map(item => item.backgroundColor),
        borderColor: statusGraficoAcoes.map(item => item.borderColor),
        borderWidth: 1
    }]
},
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,

                        layout: {
                            padding: {
                                top: 25,
                                bottom: 0
                            }
                        },

                        plugins: {
                            valoresGraficos: {
                                display: true,
                                fontSize: 10,
                                fontWeight: "bold",
                                color: "#333"
                            },

                            legend: {
                                display: false
                            },

                            title: {
                                display: true,
                                text: "Status das Ações",
                                font: {
                                    size: 14,
                                    weight: "bold"
                                }
                            }
                        },

                        
scales: {
    y: {
        beginAtZero: true,
        grace: "25%",

        ticks: {
            display: false
        },

        grid: {
            display: false,
            drawBorder: false
        },

        border: {
            display: false
        }
    },

    x: {
        grid: {
            display: false,
            drawBorder: false
        },

        border: {
            display: false
        },

        ticks: {
            font: {
                size: 10

                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Filtro por card
            let listaFiltrada = [...dados];

            if (filtroCard === "ATRASADO") {
                listaFiltrada = listaFiltrada.filter(i => normalizar(i["Status Ação"]) === "ATRASADO");
            }

            else if (filtroCard === "NO PRAZO") {
                listaFiltrada = listaFiltrada.filter(i => normalizar(i["Status Ação"]) === "NO PRAZO");
            }

            else if (filtroCard === "ATENCAO") {
                listaFiltrada = listaFiltrada.filter(i => normalizar(i["Status Ação"]) === "ATENCAO");
            }

            else if (filtroCard === "SEM_ACAO") {
                listaFiltrada = listaFiltrada.filter(i => ehSemAcao(i));
            }

            // Tabela
 
            listaFiltrada = aplicarOrdenacaoTabelaAcoes(listaFiltrada);
 
            const tabela = document.querySelector("#tabelaAcoes tbody");

            if (tabela) {
                tabela.innerHTML = listaFiltrada.map(item => {

                    let dataFormatada = "-";

                    if (item["Prazo da Ação"]) {
                        const dataPrazo = new Date(item["Prazo da Ação"]);

                        if (!isNaN(dataPrazo)) {
                            dataFormatada = dataPrazo.toLocaleDateString("pt-BR");
                        }
                    }

                    return `
                        <tr>
                            <td>${item.ID ?? ""}</td>
                            <td>${item.Projeto ?? ""}</td>
                            <td>${item["Status Ação"] ?? ""}</td>
                            <td class="celula-texto-acoes">${formatarTextoAcoes(item["Ações"])}</td>
                            <td>${dataFormatada}</td>
                            <td>${obterCoordenador(item)}</td>
                            <td>${obterPMOResponsavel(item)}</td>
                        </tr>
                    `;
                }).join("");
            }

        })
        .catch(err => console.error("Erro ao carregar ações:", err));
}

// ✅ ADICIONADO: Função que gerencia o clique do Card alinhada com o HTML
function filtrarCardAcao(tipo) {
    if (filtroCard === tipo) {
        filtroCard = ""; // Se clicar de novo no ativo, limpa o filtro
    } else {
        filtroCard = tipo;
    }
    carregarAcoes(); // Recarrega aplicando a regra
}

function formatarTextoAcoes(valor) {
    if (!valor) return "";

    let texto = valor
        .toString()
        .replace(/_x000D_/g, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    // Escapa HTML para evitar quebrar a tabela
    texto = texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // Se já vier com quebras de linha da planilha, mantém
    if (texto.includes("\n")) {
        return texto.replace(/\n+/g, "<br>");
    }

    // Se vier tudo em uma linha, quebra antes de cada nova data no padrão 30/06 -
    texto = texto.replace(
        /\s+(\d{2}\/\d{2}(?:\s*(?:a|à|-)\s*\d{2}\/\d{2})?\s*-\s*)/g,
        "<br>$1"
    );

    return texto.replace(/^<br>/, "");
}

function normalizarTextoGlobal(valor) {
    return (valor || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();
}

function classePrioridadeGlobal(prioridade) {
    const valor = normalizarTextoGlobal(prioridade);

    if (valor === "P0") return "p0";
    if (valor === "P1") return "p1";
    if (valor === "P2") return "p2";

    return "";
}

function obterColunasDemandasVisiveis() {
    let selecionadasSalvas = null;

    try {
        selecionadasSalvas = JSON.parse(
            localStorage.getItem("colunasDemandasVisiveis") || "null"
        );
    } catch (erro) {
        console.warn(
            "Preferência de colunas inválida. Aplicando todas as colunas.",
            erro
        );

        localStorage.removeItem("colunasDemandasVisiveis");
    }

    /*
      Se não existir preferência válida, todas as colunas
      começam selecionadas.
    */
    if (
        !Array.isArray(selecionadasSalvas) ||
        selecionadasSalvas.length === 0
    ) {
        return [...COLUNAS_TABELA_DEMANDAS];
    }

    return COLUNAS_TABELA_DEMANDAS.filter(coluna =>
        selecionadasSalvas.includes(coluna.id)
    );
}
function configurarSeletorColunasDemandas() {
    const seletor = document.getElementById(
        "seletorColunasDemandas"
    );

    const botao = document.getElementById(
        "btnSeletorColunas"
    );

    const menu = document.getElementById(
        "menuSeletorColunas"
    );

    const checks = document.querySelectorAll(
        ".check-coluna-demanda"
    );

    const btnTodas = document.getElementById(
        "btnSelecionarTodasColunas"
    );

    if (
        !seletor ||
        !botao ||
        !menu ||
        checks.length === 0
    ) {
        return;
    }

    let salvas = null;

    try {
        salvas = JSON.parse(
            localStorage.getItem(
                "colunasDemandasVisiveis"
            ) || "null"
        );
    } catch (erro) {
        console.warn(
            "Não foi possível ler as colunas salvas.",
            erro
        );

        localStorage.removeItem(
            "colunasDemandasVisiveis"
        );
    }

    /*
      Se houver preferência salva, aplica a preferência.
      Caso contrário, todas começam selecionadas.
    */
    if (Array.isArray(salvas) && salvas.length > 0) {
        checks.forEach(check => {
            check.checked = salvas.includes(
                check.value
            );
        });
    } else {
        checks.forEach(check => {
            check.checked = true;
        });

        salvarColunasDemandasSelecionadas();
    }

    /*
      Abre e fecha o menu.
    */
    botao.addEventListener("click", event => {
        event.stopPropagation();
        seletor.classList.toggle("aberto");
    });

    /*
      Impede que selecionar uma opção feche o menu.
    */
    menu.addEventListener("click", event => {
        event.stopPropagation();
    });

    /*
      Alteração individual das colunas.
    */
    checks.forEach(check => {
        check.addEventListener("change", () => {
            const quantidadeMarcada = [...checks]
                .filter(item => item.checked)
                .length;

            /*
              Nenhuma coluna específica fica travada,
              mas a tabela não pode ficar sem nenhuma coluna.
            */
            if (quantidadeMarcada === 0) {
                check.checked = true;
                return;
            }

            salvarColunasDemandasSelecionadas();
            atualizarTextoBotaoColunas();
            carregarDashboard();
        });
    });

    /*
      BOTÃO TODAS:
      marca todas as colunas e atualiza a tabela.
    */
    if (btnTodas) {
        btnTodas.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            checks.forEach(check => {
                check.checked = true;
            });

            salvarColunasDemandasSelecionadas();
            atualizarTextoBotaoColunas();
            carregarDashboard();
        });
    }

    /*
      Fecha o menu somente ao selecionar fora dele.
    */
    document.addEventListener("click", event => {
        if (!seletor.contains(event.target)) {
            seletor.classList.remove("aberto");
        }
    });

    atualizarTextoBotaoColunas();
}

function salvarColunasDemandasSelecionadas() {
    const selecionadas = [
        ...document.querySelectorAll(".check-coluna-demanda:checked")
    ].map(check => check.value);

    localStorage.setItem(
        "colunasDemandasVisiveis",
        JSON.stringify(selecionadas)
    );
}

function atualizarTextoBotaoColunas() {
    const botao = document.getElementById("btnSeletorColunas");
    const checks = document.querySelectorAll(".check-coluna-demanda");
    const quantidadeSelecionada = [...checks]
        .filter(check => check.checked)
        .length;

    if (!botao) return;

    botao.textContent = `Colunas (${quantidadeSelecionada}) ▾`;
}

function montarCabecalhoTabelaDemandas(colunasVisiveis) {
    const cabecalho = document.getElementById("cabecalhoTabelaProjetos");

    if (!cabecalho) return;

    cabecalho.innerHTML = colunasVisiveis
        .map(coluna => `
            <th
                data-coluna="${coluna.id}"
                onclick="ordenarTabelaProjetos('${coluna.ordenacao}')"
            >
                ${coluna.titulo}
            </th>
        `)
        .join("");
}

function montarLinhasTabelaDemandas(lista, colunasVisiveis) {
    const tabela = document.querySelector("#tabelaProjetos tbody");

    if (!tabela) return;

    tabela.innerHTML = lista.map(item => {
        const celulas = colunasVisiveis.map(coluna => {
            const classe = coluna.classe || "";

            return `
                <td
                    class="${classe}"
                    data-coluna="${coluna.id}"
                >
                    ${coluna.valorHtml(item)}
                </td>
            `;
        }).join("");

        return `<tr>${celulas}</tr>`;
    }).join("");
}

function ajustarLarguraTabelaDemandas(colunasVisiveis) {
    const tabela = document.getElementById("tabelaProjetos");

    const container =
        document.querySelector(".tabela-demandas-layout") ||
        tabela?.closest(".tabela-container");

    if (
        !tabela ||
        !container ||
        !Array.isArray(colunasVisiveis) ||
        colunasVisiveis.length === 0
    ) {
        return;
    }

    /*
      Largura visual disponível para a tabela.
    */
    const larguraContainer = container.clientWidth;

    /*
      Soma das larguras mínimas definidas no array
      COLUNAS_TABELA_DEMANDAS.
    */
    const larguraMinimaCalculada = colunasVisiveis.reduce(
        (total, coluna) => {
            return total + Number(coluna.minimo || 120);
        },
        0
    );

    /*
      Pequena folga para bordas e arredondamentos.
    */
    const larguraNecessaria =
        larguraMinimaCalculada +
        (colunasVisiveis.length * 3);

    /*
      REGRA CORRETA:

      Se todas as colunas couberem no container:
      - tabela ocupa 100%;
      - colunas dividem todo o espaço disponível;
      - não aparece área cinza;
      - não aparece barra horizontal.

      Se não couberem:
      - tabela cresce horizontalmente;
      - mantém as larguras mínimas;
      - aparece barra horizontal.
    */
    const colunasCabemNoContainer =
        larguraNecessaria <= larguraContainer;

    if (colunasCabemNoContainer) {
        tabela.classList.add("tabela-distribuida");
        tabela.classList.remove("tabela-com-scroll");

        tabela.style.setProperty(
            "width",
            "100%",
            "important"
        );

        tabela.style.setProperty(
            "min-width",
            "100%",
            "important"
        );

        tabela.style.setProperty(
            "max-width",
            "100%",
            "important"
        );

        tabela.style.setProperty(
            "table-layout",
            "fixed",
            "important"
        );

        container.style.setProperty(
            "overflow-x",
            "hidden",
            "important"
        );
    } else {
        tabela.classList.remove("tabela-distribuida");
        tabela.classList.add("tabela-com-scroll");

        tabela.style.setProperty(
            "width",
            `${larguraNecessaria}px`,
            "important"
        );

        tabela.style.setProperty(
            "min-width",
            `${larguraNecessaria}px`,
            "important"
        );

        tabela.style.setProperty(
            "max-width",
            `${larguraNecessaria}px`,
            "important"
        );

        tabela.style.setProperty(
            "table-layout",
            "fixed",
            "important"
        );

        container.style.setProperty(
            "overflow-x",
            "auto",
            "important"
        );
    }

    aplicarLargurasColunasDemandas(
        colunasVisiveis
    );
}

function aplicarLargurasColunasDemandas(colunasVisiveis) {
    const tabela = document.getElementById("tabelaProjetos");

    if (!tabela) return;

    const tabelaDistribuida =
        tabela.classList.contains("tabela-distribuida");

    const totalPeso = colunasVisiveis.reduce(
        (total, coluna) => total + coluna.peso,
        0
    );

    colunasVisiveis.forEach(coluna => {
        const celulas = tabela.querySelectorAll(
            `[data-coluna="${coluna.id}"]`
        );

        if (tabelaDistribuida) {
            const percentual =
                (coluna.peso / totalPeso) * 100;

            celulas.forEach(celula => {
                celula.style.setProperty(
                    "width",
                    `${percentual}%`,
                    "important"
                );

                celula.style.setProperty(
                    "min-width",
                    "0px",
                    "important"
                );

                celula.style.setProperty(
                    "max-width",
                    "none",
                    "important"
                );
            });
        } else {
            celulas.forEach(celula => {
                celula.style.setProperty(
                    "width",
                    `${coluna.minimo}px`,
                    "important"
                );

                celula.style.setProperty(
                    "min-width",
                    `${coluna.minimo}px`,
                    "important"
                );

                celula.style.setProperty(
                    "max-width",
                    `${coluna.minimo}px`,
                    "important"
                );
            });
        }
    });
}

let financeiroCache = [];

const API_FINANCEIRO = "https://dashboard-logistica-v2.onrender.com/financeiro";

function normalizarFinanceiro(valor) {
    return (valor || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();
}

function formatarNumeroFinanceiro(valor) {
    const numero = Number(valor);

    if (valor === null || valor === undefined || valor === "" || isNaN(numero)) {
        return "--";
    }

    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatarDataFinanceiro(valor) {
    if (!valor || valor === "-") return "-";

    if (typeof valor === "number") {
        const baseExcel = new Date(Date.UTC(1899, 11, 30));
        const data = new Date(baseExcel.getTime() + valor * 86400000);

        return data.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
            timeZone: "UTC"
        });
    }

    const data = new Date(valor);

    if (!isNaN(data)) {
        return data.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit"
        });
    }

    return valor;
}

function obterValorFinanceiro(item, campo) {
    return item[campo] ?? "";
}

function obterVersaoFCSTFinanceiro(item) {
    return (
        item["Versão FCST"] ??
        item["Versao FCST"] ??
        item["FCST"] ??
        item["Versao_FCST"] ??
        ""
    );
}

function calcularSomaFinanceira(lista, campo) {
    return lista.reduce((total, item) => {
        const valor = Number(item[campo]);

        if (isNaN(valor)) {
            return total;
        }

        return total + valor;
    }, 0);
}

function preencherSelectFinanceiro(id, valores) {
    const select = document.getElementById(id);

    if (!select) return;

    const valorAtual = select.value;

    select.innerHTML = '<option value="">Todos</option>';

    valores
        .filter(Boolean)
        .sort((a, b) => a.toString().localeCompare(b.toString(), "pt-BR"))
        .forEach(valor => {
            select.add(new Option(valor, valor));
        });

    select.value = valorAtual;
}

function carregarFiltrosFinanceiro() {
    fetch(API_FINANCEIRO)
        .then(res => res.json())
        .then(data => {
            financeiroCache = Array.isArray(data) ? data : (data.dados || []);

            const gerentes = [
                ...new Set(financeiroCache.map(item => item.Gerente).filter(Boolean))
            ];

            const stages = [
                ...new Set(financeiroCache.map(item => item.Stage).filter(Boolean))
            ];

            preencherSelectFinanceiro("filtroGerenteFinanceiro", gerentes);
            preencherSelectFinanceiro("filtroStageFinanceiro", stages);

            carregarFinanceiro();
        })
        .catch(err => console.error("Erro ao carregar financeiro:", err));
}

function obterCampoPesquisaFinanceiro(item, campo) {
    const campoNormalizado = normalizarFinanceiro(campo);

    if (campoNormalizado === "ID" || campoNormalizado === "ID FIN") {
        return item.ID || item["ID FIN"];
    }

    if (
        campoNormalizado === "PROJETO" ||
        campoNormalizado === "DEMANDA" ||
        campoNormalizado === "DEMANDAS"
    ) {
        return item.Projeto;
    }

    if (campoNormalizado === "GERENTE") {
        return item.Gerente;
    }

    if (
        campoNormalizado === "TIPO" ||
        campoNormalizado === "TIPO ORCAMENTO" ||
        campoNormalizado === "TIPO ORÇAMENTO"
    ) {
        return item.Tipo || item["Tipo Orçamento"];
    }

    if (campoNormalizado === "STAGE" || campoNormalizado === "ESTAGIO" || campoNormalizado === "ESTÁGIO") {
        return item.Stage;
    }

    if (campoNormalizado === "STATUS") {
        return item.Status || item["Status Geral"];
    }

    if (
        campoNormalizado === "GESTOR"
    ) {
        return item.Gestor;
    }

    if (
        campoNormalizado === "AREA" ||
        campoNormalizado === "ÁREA"
    ) {
        return item.Area;
    }

    if (
        campoNormalizado === "FORUM" ||
        campoNormalizado === "FÓRUM"
    ) {
        return item.Forum || item["Forum Fin"];
    }

    if (
        campoNormalizado === "META"
    ) {
        return item["Meta 2026"];
    }

    if (
        campoNormalizado === "FCST"
    ) {
        return item["FCST 2026"];
    }

    if (
        campoNormalizado === "REALIZADO" ||
        campoNormalizado === "REAL FCST" ||
        campoNormalizado === "REALIZADO FCST"
    ) {
        return item["Realizado + FCST 2026"];
    }

    if (
        campoNormalizado === "SALDO"
    ) {
        return item["Saldo contra FCST"];
    }

    return "";
}

function linhaContemPesquisaFinanceiro(item, termo) {
    if (!termo || !termo.trim()) return true;

    const partes = termo
        .split(";")
        .map(p => p.trim())
        .filter(Boolean);

    const textoLinha = [
        item.ID,
        item["ID FIN"],
        item.Projeto,
        item.Gerente,
        item.Tipo,
        item["Tipo Orçamento"],
        item.Stage,
        item.Status,
        item["Status Geral"],
        item["Meta 2026"],
        item["FCST 2026"],
        item["Realizado + FCST 2026"],
        item["Saldo contra FCST"]
    ]
        .map(valor => normalizarFinanceiro(valor))
        .join(" ");

    return partes.every(parte => {
        if (parte.includes("=")) {
            const [campo, ...resto] = parte.split("=");
            const valorBuscado = resto.join("=").trim();

            if (!campo || !valorBuscado) return true;

            const valorCampo = normalizarFinanceiro(obterCampoPesquisaFinanceiro(item, campo));
            const valorFiltro = normalizarFinanceiro(valorBuscado);

            return valorCampo.includes(valorFiltro);
        }

        const palavras = normalizarFinanceiro(parte)
            .split(" ")
            .map(p => p.trim())
            .filter(Boolean);

        return palavras.every(palavra => textoLinha.includes(palavra));
    });
}

function aplicarFiltrosFinanceiro(lista) {
    const gerente = document.getElementById("filtroGerenteFinanceiro")?.value || "";
    const tipo = document.getElementById("filtroTipoFinanceiro")?.value || "";
    const stage = document.getElementById("filtroStageFinanceiro")?.value || "";
    const fcst = document.getElementById("filtroFCSTFinanceiro")?.value || "";
    const pesquisa = document.getElementById("pesquisaFinanceiro")?.value || "";

    let dados = [...lista];

    if (gerente) {
        dados = dados.filter(item => item.Gerente === gerente);
    }

    if (tipo) {
        dados = dados.filter(item =>
            item.Tipo === tipo ||
            item["Tipo Orçamento"] === tipo
        );
    }

    if (stage) {
        const stageNormalizado = normalizarFinanceiro(stage);

        dados = dados.filter(item =>
            normalizarFinanceiro(item.Stage) === stageNormalizado
        );
    }

    if (fcst) {
        const existeCampoVersaoFCST = dados.some(item => obterVersaoFCSTFinanceiro(item));

        if (existeCampoVersaoFCST) {
            dados = dados.filter(item => obterVersaoFCSTFinanceiro(item) === fcst);
        }
    }

    if (pesquisa) {
        dados = dados.filter(item => linhaContemPesquisaFinanceiro(item, pesquisa));
    }

    return dados;
}

function ordenarTabelaFinanceiro(coluna) {
    if (ordenacaoTabelaFinanceiro.coluna === coluna) {
        ordenacaoTabelaFinanceiro.direcao =
            ordenacaoTabelaFinanceiro.direcao === "asc" ? "desc" : "asc";
    } else {
        ordenacaoTabelaFinanceiro.coluna = coluna;
        ordenacaoTabelaFinanceiro.direcao = "asc";
    }

    carregarFinanceiro();
}

function aplicarOrdenacaoTabelaFinanceiro(lista) {
    const coluna = ordenacaoTabelaFinanceiro.coluna;
    const direcao = ordenacaoTabelaFinanceiro.direcao;
    const multiplicador = direcao === "asc" ? 1 : -1;

    const normalizarTexto = (valor) => {
        return (valor || "")
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase();
    };

    const obterDataOrdenacao = (valor) => {
        if (!valor || valor === "-") return null;

        if (typeof valor === "number") {
            return valor;
        }

        const texto = valor.toString().trim();

        const numero = Number(texto);
        if (!isNaN(numero)) {
            return numero;
        }

        const data = new Date(texto);
        if (!isNaN(data)) {
            return data.getTime();
        }

        return null;
    };

    const obterNumeroOrdenacao = (valor) => {
        if (valor === null || valor === undefined || valor === "") return null;

        if (typeof valor === "number") {
            return valor;
        }

        let texto = valor.toString().trim();

        if (texto === "" || texto === "-" || texto === "#N/D" || texto === "#N/A") {
            return null;
        }

        texto = texto
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

        const numero = Number(texto);

        return isNaN(numero) ? null : numero;
    };

    const obterValor = (item, coluna) => {
        if (coluna === "ID") {
            return item.ID ?? item["ID FIN"] ?? "";
        }

        if (coluna === "Demanda") {
            return item.Projeto ?? item.Demanda ?? "";
        }

        if (coluna === "Gerente") {
            return item.Gerente ?? "";
        }

        if (coluna === "Tipo") {
            return item["Tipo Orçamento"] ?? item.Tipo ?? "";
        }

        if (coluna === "Stage") {
            return item.Stage ?? "";
        }

        if (coluna === "Status") {
            return item.Status ?? item["Status Geral"] ?? "";
        }

        if (coluna === "Dt Inicio Captura") {
            return (
                item["Dt Inicio Captura"] ??
                item["Dt Início Captura"] ??
                item["Dt Inicio"] ??
                item["Dt Início"] ??
                item["Início Captura"] ??
                item["Inicio Captura"] ??
                ""
            );
        }

        if (coluna === "Dt Fim Captura") {
            return (
                item["Dt Fim Captura"] ??
                item["Dt Fim"] ??
                item["Fim Captura"] ??
                ""
            );
        }

        if (coluna === "Meta 2026") {
            return item["Meta 2026"];
        }

        if (coluna === "FCST 2026") {
            return item["FCST 2026"];
        }

        if (coluna === "Realizado + FCST 2026") {
            return item["Realizado + FCST 2026"];
        }

        if (coluna === "Saldo FCST") {
            return item["Saldo contra FCST"];
        }

        if (coluna === "Plano de Ação/Recuperação") {
            return item["Plano de Ação/Recuperação"] ?? "";
        }

        return "";
    };

    return [...lista].sort((a, b) => {
        if (coluna === "ID") {
            const idA = extrairNumeroLog(a.ID ?? a["ID FIN"]);
            const idB = extrairNumeroLog(b.ID ?? b["ID FIN"]);

            if (idA !== idB) {
                return (idA - idB) * multiplicador;
            }

            return normalizarTexto(a.ID ?? a["ID FIN"]).localeCompare(
                normalizarTexto(b.ID ?? b["ID FIN"]),
                "pt-BR",
                {
                    sensitivity: "base",
                    numeric: true
                }
            ) * multiplicador;
        }

        if (
            coluna === "Meta 2026" ||
            coluna === "FCST 2026" ||
            coluna === "Realizado + FCST 2026" ||
            coluna === "Saldo FCST"
        ) {
            const valorA = obterNumeroOrdenacao(obterValor(a, coluna));
            const valorB = obterNumeroOrdenacao(obterValor(b, coluna));

            if (valorA === null && valorB === null) {
                return extrairNumeroLog(a.ID ?? a["ID FIN"]) - extrairNumeroLog(b.ID ?? b["ID FIN"]);
            }

            if (valorA === null) return 1;
            if (valorB === null) return -1;

            if (valorA !== valorB) {
                return (valorA - valorB) * multiplicador;
            }

            return extrairNumeroLog(a.ID ?? a["ID FIN"]) - extrairNumeroLog(b.ID ?? b["ID FIN"]);
        }

        if (
            coluna === "Dt Inicio Captura" ||
            coluna === "Dt Fim Captura"
        ) {
            const dataA = obterDataOrdenacao(obterValor(a, coluna));
            const dataB = obterDataOrdenacao(obterValor(b, coluna));

            if (dataA === null && dataB === null) {
                return extrairNumeroLog(a.ID ?? a["ID FIN"]) - extrairNumeroLog(b.ID ?? b["ID FIN"]);
            }

            if (dataA === null) return 1;
            if (dataB === null) return -1;

            if (dataA !== dataB) {
                return (dataA - dataB) * multiplicador;
            }

            return extrairNumeroLog(a.ID ?? a["ID FIN"]) - extrairNumeroLog(b.ID ?? b["ID FIN"]);
        }

        const valorA = normalizarTexto(obterValor(a, coluna));
        const valorB = normalizarTexto(obterValor(b, coluna));

        const comparacao = valorA.localeCompare(
            valorB,
            "pt-BR",
            {
                sensitivity: "base",
                numeric: true
            }
        );

        if (comparacao !== 0) {
            return comparacao * multiplicador;
        }

        return extrairNumeroLog(a.ID ?? a["ID FIN"]) - extrairNumeroLog(b.ID ?? b["ID FIN"]);
    });
}

function carregarFinanceiro() {
    let dadosFiltrados = aplicarFiltrosFinanceiro(financeiroCache);

    const metaTotal = calcularSomaFinanceira(dadosFiltrados, "Meta 2026");
    const fcstTotal = calcularSomaFinanceira(dadosFiltrados, "FCST 2026");
    const realizadoFCSTTotal = calcularSomaFinanceira(dadosFiltrados, "Realizado + FCST 2026");
    const saldoTotal = calcularSomaFinanceira(dadosFiltrados, "Saldo contra FCST");
    const saldoMetaTotal = realizadoFCSTTotal - metaTotal;

    const setTexto = (id, valor) => {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.innerText = valor;
        }
    };

    setTexto("metaFinanceiro", formatarNumeroFinanceiro(metaTotal));
    setTexto("fcstFinanceiro", formatarNumeroFinanceiro(fcstTotal));
    setTexto("realizadoFCSTFinanceiro", formatarNumeroFinanceiro(realizadoFCSTTotal));
    setTexto("saldoFinanceiro", formatarNumeroFinanceiro(saldoTotal));
    setTexto("saldoMetaFinanceiro", formatarNumeroFinanceiro(saldoMetaTotal));

    renderizarGraficoFinanceiro(dadosFiltrados);

    dadosFiltrados = aplicarOrdenacaoTabelaFinanceiro(dadosFiltrados);

    const tabela = document.querySelector("#tabelaFinanceiro tbody");

if (tabela) {
    if (dadosFiltrados.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="13">Nenhum registro financeiro encontrado.</td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = dadosFiltrados.map(item => {
        const id = item.ID ?? item["ID FIN"] ?? "";
        const demanda = item.Projeto ?? item.Demanda ?? item["Projeto"] ?? "";
        const gerente = item.Gerente ?? "";
        const tipo = item["Tipo Orçamento"] ?? item.Tipo ?? "";
        const stage = item.Stage ?? "";
        const status = item.Status ?? item["Status Geral"] ?? "";

        const dtInicio =
            item["Dt Inicio Captura"] ??
            item["Dt Início Captura"] ??
            item["Dt Inicio"] ??
            item["Dt Início"] ??
            item["Início Captura"] ??
            item["Inicio Captura"] ??
            "";

        const dtFim =
            item["Dt Fim Captura"] ??
            item["Dt Fim"] ??
            item["Fim Captura"] ??
            "";

        const meta = item["Meta 2026"];
        const fcst = item["FCST 2026"];
        const realizadoFcst = item["Realizado + FCST 2026"];
        const saldoFcst = item["Saldo contra FCST"];
        const plano = item["Plano de Ação/Recuperação"] ?? "";

        return `
            <tr>
                <td>${id}</td>
                <td>${demanda}</td>
                <td>${gerente}</td>
                <td>${tipo}</td>
                <td>${stage}</td>
                <td>${status}</td>
                <td>${formatarDataFinanceiro(dtInicio)}</td>
                <td>${formatarDataFinanceiro(dtFim)}</td>
                <td>${formatarNumeroFinanceiro(meta)}</td>
                <td>${formatarNumeroFinanceiro(fcst)}</td>
                <td>${formatarNumeroFinanceiro(realizadoFcst)}</td>
                <td>${formatarNumeroFinanceiro(saldoFcst)}</td>
                <td>${plano}</td>
            </tr>
        `;
    }).join("");
}
}

function agruparFinanceiroPorStage(lista) {
    const grupos = {};

    const arredondar = (valor) => {
        const numero = Number(valor || 0);

        if (isNaN(numero)) {
            return 0;
        }

        return Math.round(numero * 100) / 100;
    };

    lista.forEach(item => {
        const stage = item.Stage || "Sem Stage";

        if (!grupos[stage]) {
            grupos[stage] = {
                stage: stage,
                meta: 0,
                realizadoFcst: 0,
                saldoFcst: 0
            };
        }

        grupos[stage].meta += Number(item["Meta 2026"] || 0);
        grupos[stage].realizadoFcst += Number(item["Realizado + FCST 2026"] || 0);
        grupos[stage].saldoFcst += Number(item["Saldo contra FCST"] || 0);
    });

    return Object.values(grupos)
        .map(item => {
            return {
                stage: item.stage,
                meta: arredondar(item.meta),
                realizadoFcst: arredondar(item.realizadoFcst),
                saldoFcst: arredondar(item.saldoFcst)
            };
        })
        .sort((a, b) => {
            return a.stage.toString().localeCompare(b.stage.toString(), "pt-BR", {
                numeric: true,
                sensitivity: "base"
            });
        });
}

function renderizarGraficoFinanceiro(lista) {
    const canvas = document.getElementById("graficoFinanceiro");

    if (!canvas || typeof Chart === "undefined") return;

    const dadosAgrupados = agruparFinanceiroPorStage(lista);

    const labels = dadosAgrupados.map(item => item.stage);
    const metas = dadosAgrupados.map(item => item.meta);
    const realizados = dadosAgrupados.map(item => item.realizadoFcst);

    const formatarValorGrafico = (valor) => {
        const numero = Number(valor || 0);

        if (isNaN(numero)) {
            return "0,00";
        }

        return numero.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    if (window.graficoFinanceiro instanceof Chart) {
        window.graficoFinanceiro.destroy();
    }

    window.graficoFinanceiro = new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Meta",
                    data: metas,
                    backgroundColor: "#1f5f7a",
                    borderColor: "#1f5f7a",
                    borderWidth: 1,
                    borderRadius: 3,
                    barPercentage: 0.75,
                    categoryPercentage: 0.65
                },
                {
                    label: "Realizado + FCST",
                    data: realizados,
                    backgroundColor: "#f26b2f",
                    borderColor: "#f26b2f",
                    borderWidth: 1,
                    borderRadius: 3,
                    barPercentage: 0.75,
                    categoryPercentage: 0.65
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            animation: {
                duration: 600,
                easing: "easeOutQuart"
            },

            layout: {
                padding: {
                    top: 18,
                    right: 8,
                    bottom: 0,
                    left: 8
                }
            },

            plugins: {
                valoresGraficos: {
                    display: true,
                    fontSize: 9,
                    fontWeight: "bold",
                    color: "#333"
                },

                legend: {
                    display: false
                },

                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.92)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: "#ffffff",
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatarValorGrafico(context.raw)}`;
                        },

                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            const item = dadosAgrupados[index];

                            return `Saldo contra FCST: ${formatarValorGrafico(item.saldoFcst)}`;
                        }
                    }
                },

                title: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    grace: "25%",

                    ticks: {
                        display: false
                    },

                    grid: {
                        display: false,
                        drawBorder: false
                    },

                    border: {
                        display: false
                    }
                },

                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },

                    border: {
                        display: false
                    },

                    ticks: {
                        color: "#333",
                        font: {
                            size: 10,
                            weight: "bold"
                        }
                    }
                }
            }
        }
    });
}

// =============================
// ✅ EVENTOS + LOAD
// =============================
document.addEventListener("DOMContentLoaded", function () {

    // ✅ PROJETOS (Só roda se estiver na tela de projetos)
    if (document.getElementById("filtroGerente")) {
        configurarSeletorColunasDemandas();
        carregarFiltrosProjetos();

        document.getElementById("filtroGerente").addEventListener("change", carregarDashboard);
        document.getElementById("filtroForum").addEventListener("change", carregarDashboard);
        document.getElementById("filtroStatus").addEventListener("change", carregarDashboard);

        configurarFiltroSituacao();
    }

    // ✅ AÇÕES (Só roda se estiver na tela de ações)
    if (document.getElementById("filtroGerenteAcoes")) {
    carregarFiltrosAcoes();

    document.getElementById("filtroGerenteAcoes").addEventListener("change", carregarAcoes);
    document.getElementById("filtroForumAcoes").addEventListener("change", carregarAcoes);

    if (document.getElementById("filtroStatusAcoes")) {
        document.getElementById("filtroStatusAcoes").addEventListener("change", carregarAcoes);
    }
}

// ✅ FINANCEIRO
if (document.getElementById("filtroGerenteFinanceiro")) {
    carregarFiltrosFinanceiro();

    document.getElementById("filtroGerenteFinanceiro")?.addEventListener("change", carregarFinanceiro);
    document.getElementById("filtroTipoFinanceiro")?.addEventListener("change", carregarFinanceiro);
    document.getElementById("filtroStageFinanceiro")?.addEventListener("change", carregarFinanceiro);
    document.getElementById("filtroFCSTFinanceiro")?.addEventListener("change", carregarFinanceiro);

    document.getElementById("pesquisaFinanceiro")?.addEventListener("input", carregarFinanceiro);

    document.querySelector(".btn-limpar-financeiro")?.addEventListener("click", function () {
        const pesquisa = document.getElementById("pesquisaFinanceiro");

        if (pesquisa) {
            pesquisa.value = "";
        }

        carregarFinanceiro();
    });
}

ajustarEscalaDashboard();

});

function ajustarEscalaDashboard() {
    const conteudo = document.querySelector(".conteudo-dashboard");
    const canvas = document.querySelector(".dashboard-canvas");

    if (!conteudo || !canvas) return;

    const baseWidth = Number(canvas.dataset.baseWidth || 1050);
    const baseHeight = Number(canvas.dataset.baseHeight || 600);

    const larguraDisponivel = conteudo.clientWidth - 30;
    const alturaDisponivel = conteudo.clientHeight - 30;

    const escalaLargura = larguraDisponivel / baseWidth;
    const escalaAltura = alturaDisponivel / baseHeight;

    /*
      Regra:
      - Em telas grandes, permite crescer um pouco.
      - Em telas menores, reduz proporcionalmente.
      - Nunca deixa maior que 1.25 para não estourar.
    */
    const escalaMaxima = 1.25;
    const escalaMinima = 0.62;

    let escala = Math.min(escalaLargura, escalaAltura, escalaMaxima);

    if (escala < escalaMinima) {
        escala = escalaMinima;
    }

    canvas.style.setProperty("--dashboard-scale", escala);

    /*
      Ajuste fino horizontal.
      Se em 100% estiver muito para a direita, use -35px ou -45px.
      Se ficar muito para a esquerda, reduza para -20px.
    */
    canvas.style.setProperty("--dashboard-shift-x", "-35px");
}

function abrirAjudaStage() {
    const overlay = document.getElementById("overlayAjudaStage");
    const card = document.getElementById("cardAjudaStage");

    if (overlay) overlay.style.display = "block";
    if (card) card.style.display = "block";
}

function fecharAjudaStage() {
    const overlay = document.getElementById("overlayAjudaStage");
    const card = document.getElementById("cardAjudaStage");

    if (overlay) overlay.style.display = "none";
    if (card) card.style.display = "none";
}

function abrirAjudaDashboard() {
    const overlay = document.getElementById("overlayAjudaDashboard");
    const card = document.getElementById("cardAjudaDashboard");

    if (overlay) overlay.style.display = "block";
    if (card) card.style.display = "block";
}

function fecharAjudaDashboard() {
    const overlay = document.getElementById("overlayAjudaDashboard");
    const card = document.getElementById("cardAjudaDashboard");

    if (overlay) overlay.style.display = "none";
    if (card) card.style.display = "none";
}

function abrirAjudaAcoes() {
    const overlay = document.getElementById("overlayAjudaAcoes");
    const card = document.getElementById("cardAjudaAcoes");

    if (overlay) overlay.style.display = "block";
    if (card) card.style.display = "block";
}

function fecharAjudaAcoes() {
    const overlay = document.getElementById("overlayAjudaAcoes");
    const card = document.getElementById("cardAjudaAcoes");

    if (overlay) overlay.style.display = "none";
    if (card) card.style.display = "none";
}

window.addEventListener("resize", function () {
    ajustarEscalaDashboard();

    if (document.getElementById("tabelaProjetos")) {
        const colunasVisiveis = obterColunasDemandasVisiveis();
        ajustarLarguraTabelaDemandas(colunasVisiveis);
    }
});
window.addEventListener("load", ajustarEscalaDashboard);

setTimeout(ajustarEscalaDashboard, 300);
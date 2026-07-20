let filtroCardProjeto = "";
let filtroCard = "";
let projetosCache = [];

function extrairNumeroLog(id) {
    const texto = (id || "").toString().toUpperCase().trim();

    const match = texto.match(/LOG-?\s*(\d+)/);

    if (!match) return 9999;

    return parseInt(match[1], 10);
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

    afterDraw(chart, args, options) {
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

if (typeof Chart !== "undefined") {
    Chart.register(pluginValoresGraficos, pluginTextoCentroRosca);
}

function filtrarCardProjeto(tipo) {

    // ✅ toggle (melhor UX)
    if (filtroCardProjeto === tipo) {
        filtroCardProjeto = "";
    } else {
        filtroCardProjeto = tipo;
    }

    carregarDashboard();
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
            const status = [...new Set(projetosCache.map(p => p["Status Geral"]).filter(Boolean))];

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

// =============================
// ✅ 2. DASHBOARD PROJETOS (CORRIGIDO)
// =============================
function carregarDashboard() {
    const gerente = document.getElementById("filtroGerente")?.value || "";
    const forum = document.getElementById("filtroForum")?.value || "";
    const status = document.getElementById("filtroStatus")?.value || "";

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

    if (valor === "ALTA") return "alta";
    if (valor === "MEDIA") return "media";
    if (valor === "BAIXA") return "baixa";

    return "";
};

const ehSemPrazoDefinido = (item) => {
    const status = normalizar(item.Status);

    return status.includes("SEM PRAZO");
};

    const setTexto = (id, valor) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.innerText = valor ?? 0;
        }
    };

    let projetos = projetosCache.filter(p => {
        const okGerente = !gerente || p.Gerente === gerente;
        const okForum = !forum || p.Forum === forum;
        const okStatus = !status || p["Status Geral"] === status;

        return okGerente && okForum && okStatus;
    });

    const total = projetos.length;
    const atrasado = projetos.filter(p => normalizar(p.Status) === "ATRASADO").length;
    const atencao = projetos.filter(p => normalizar(p.Status) === "ATENCAO").length;
    const prazo = projetos.filter(p => normalizar(p.Status) === "NO PRAZO").length;
    const semPrazoDefinido = projetos.filter(p => ehSemPrazoDefinido(p)).length;

    const prioridadeAlta = projetos.filter(p => normalizar(p.Prioridade) === "ALTA").length;
    const prioridadeMedia = projetos.filter(p => normalizar(p.Prioridade) === "MEDIA").length;
    const prioridadeBaixa = projetos.filter(p => normalizar(p.Prioridade) === "BAIXA").length;

    setTexto("total", total);
    setTexto("atrasado", atrasado);
    setTexto("atencao", atencao);
    setTexto("prazo", prazo);
    setTexto("sem_prazo_definido", semPrazoDefinido);

    // =========================
    // GRÁFICO ROSCA
    // =========================

    const ctxPrioridade = document.getElementById("graficoPrioridade");

    if (ctxPrioridade && typeof Chart !== "undefined") {
        if (window.grafico) {
            window.grafico.destroy();
        }

        const totalPrioridades = prioridadeAlta + prioridadeMedia + prioridadeBaixa;

        window.grafico = new Chart(ctxPrioridade.getContext("2d"), {
            type: "doughnut",
            data: {
                labels: ["Alta", "Média", "Baixa"],
                datasets: [{
                    data: [
                        prioridadeAlta,
                        prioridadeMedia,
                        prioridadeBaixa
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

        const gerentes = [...new Set(projetos.map(p => p.Gerente).filter(Boolean))];
        const foruns = [...new Set(projetos.map(p => p.Forum).filter(Boolean))];

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
                    projetos.filter(p => p.Gerente === gerenteNome && p.Forum === forumNome).length
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
                            precision: 0,
                            font: {
                                size: 10
                            }
                        }
                    },

                    x: {
                        ticks: {
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                            font: {
                                size: 9
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

    let listaFiltrada = projetos;

    if (filtroCardProjeto === "ATRASADO") {
        listaFiltrada = listaFiltrada.filter(i => normalizar(i.Status) === "ATRASADO");
    } else if (filtroCardProjeto === "NO PRAZO") {
        listaFiltrada = listaFiltrada.filter(i => normalizar(i.Status) === "NO PRAZO");
    } else if (filtroCardProjeto === "ATENÇÃO") {
        listaFiltrada = listaFiltrada.filter(i => normalizar(i.Status) === "ATENCAO");
    } else if (filtroCardProjeto === "SEM_PRAZO_DEFINIDO") {
        listaFiltrada = listaFiltrada.filter(i => ehSemPrazoDefinido(i));
}
     

    // =========================
    // TABELA
    // =========================

    listaFiltrada = [...listaFiltrada].sort((a, b) => {
    return extrairNumeroLog(a.ID) - extrairNumeroLog(b.ID);
});

    const tabela = document.querySelector("#tabelaProjetos tbody");

    if (tabela) {
        tabela.innerHTML = listaFiltrada.map(item => `
            <tr>
                <td>${item.ID ?? ""}</td>
                <td>${item.Projeto ?? ""}</td>
                <td>${item.Gerente ?? ""}</td>
                <td>${item.Forum ?? ""}</td>
                <td>${item["Status Geral"] ?? ""}</td>
                <td>${item.Status ?? ""}</td>
                <td>
                <span class="prioridade-com-bolinha">
                    <span class="bolinha-prioridade ${classePrioridade(item.Prioridade)}"></span>
                    ${item.Prioridade ?? ""}
                </span>
            </td>
            </tr>
        `).join("");
    }
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

            let dados = data.dados || [];

            // Aplica filtro Status
            // Aplica filtro Status Geral da demanda
            if (statusFiltro) {
                     const statusNormalizado = normalizar(statusFiltro);

                     dados = dados.filter(i => {
            return normalizar(i["Status Geral"]) === statusNormalizado;
          });
     }

            const totalPrazo = dados.filter(i => normalizar(i["Status Ação"]) === "NO PRAZO").length;
            const totalAtencao = dados.filter(i => normalizar(i["Status Ação"]) === "ATENCAO").length;
            const totalAtrasado = dados.filter(i => normalizar(i["Status Ação"]) === "ATRASADO").length;
            const semAcao = dados.filter(i => ehSemAcao(i)).length;

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
                        labels: ["No Prazo", "Atenção", "Atrasado", "Sem Ação"],
                        datasets: [{
                            label: "Quantidade",
                            data: [
                                totalPrazo,
                                totalAtencao,
                                totalAtrasado,
                                semAcao
                            ],
                            backgroundColor: [
                                "#b7e4c7",
                                "#fff3b0",
                                "#f8b4b4",
                                "#d9d9d9"
                            ],
                            borderColor: [
                                "#74c69d",
                                "#f4d35e",
                                "#e57373",
                                "#bfbfbf"
                            ],
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
                                    precision: 0,
                                    font: {
                                        size: 10
                                    }
                                }
                            },

                            x: {
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
                            <td>${item["Ações"] ?? ""}</td>
                            <td>${dataFormatada}</td>
                            <td>${item["Responsável"] ?? ""}</td>
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


// =============================
// ✅ EVENTOS + LOAD
// =============================
document.addEventListener("DOMContentLoaded", function () {

    // ✅ PROJETOS (Só roda se estiver na tela de projetos)
    if (document.getElementById("filtroGerente")) {
        carregarFiltrosProjetos();

        document.getElementById("filtroGerente").addEventListener("change", carregarDashboard);
        document.getElementById("filtroForum").addEventListener("change", carregarDashboard);
        document.getElementById("filtroStatus").addEventListener("change", carregarDashboard);
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

window.addEventListener("resize", ajustarEscalaDashboard);
window.addEventListener("load", ajustarEscalaDashboard);

setTimeout(ajustarEscalaDashboard, 300);

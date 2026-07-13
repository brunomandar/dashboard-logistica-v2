let filtroCardProjeto = "";
let filtroCard = "";

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

    fetch("http://127.0.0.1:8000/projetos")
    .then(response => response.json())
    .then(lista => {

        const selGerente = document.getElementById("filtroGerente");
        const selForum = document.getElementById("filtroForum");
        const selStatus = document.getElementById("filtroStatus");

        if (!selGerente) return;

        const gerentes = [...new Set(lista.map(p => p.Gerente))];
        const foruns = [...new Set(lista.map(p => p.Forum))];
        const status = [...new Set(lista.map(p => p["Status Geral"]))];

        selGerente.innerHTML = '<option value="">Todos</option>';
        selForum.innerHTML = '<option value="">Todos</option>';
        selStatus.innerHTML = '<option value="">Todos</option>';

        gerentes.forEach(g => selGerente.add(new Option(g, g)));
        foruns.forEach(f => selForum.add(new Option(f, f)));
        status.forEach(s => selStatus.add(new Option(s, s)));

        // ✅ AGORA SIM roda o dashboard
        carregarDashboard();
    });
}

// =============================
// ✅ 2. DASHBOARD PROJETOS (CORRIGIDO)
// =============================
function carregarDashboard() {

    const gerente = document.getElementById("filtroGerente")?.value || "";
    const forum = document.getElementById("filtroForum")?.value || "";
    const status = document.getElementById("filtroStatus")?.value || "";

    // ✅ MÉTRICAS
    fetch(`http://127.0.0.1:8000/dashboard?gerente=${gerente}&forum=${forum}&status=${status}`)
    .then(res => res.json())
    .then(data => {

        document.getElementById("total").innerText = data.total;
        document.getElementById("atrasado").innerText = data.atrasado;
        document.getElementById("atencao").innerText = data.atencao;
        document.getElementById("prazo").innerText = data.prazo;

        document.getElementById("planejado").innerText = data.planejado;
        document.getElementById("em_execucao").innerText = data.em_execucao;
        document.getElementById("backlog").innerText = data.backlog;
        document.getElementById("prioridade_alta_card").innerText = data.prioridade_alta;

        // ✅ GRÁFICO DONUT (COM TÍTULO E LEGENDA AJUSTADOS)
const ctx = document.getElementById('graficoPrioridade');
if (ctx) {
    const contexto = ctx.getContext("2d");
    if (window.grafico) window.grafico.destroy();

    window.grafico = new Chart(contexto, {
        type: 'doughnut',
        data: {
            labels: ['Alta', 'Média', 'Baixa'],
            datasets: [{
                data: [
                    data.prioridade_alta,
                    data.prioridade_media,
                    data.prioridade_baixa
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                // 📋 Configuração da Legenda
                legend: {
                    position: 'bottom', // Move a legenda para baixo
                    labels: {
                        boxWidth: 15, // Tamanho do quadradinho de cor (opcional)
                        padding: 15   // Espaçamento entre os itens (opcional)
                    }
                },
                // 📌 Configuração do Título
                title: {
                    display: true,          // Ativa a exibição do título
                    text: 'Prioridade das Demandas', // Texto do seu título
                    position: 'top',        // Garante que fique em cima
                    font: {
                        size: 16,           // Tamanho da fonte
                        weight: 'bold'      // Deixa o texto em negrito
                    },
                    padding: {
                        top: 10,
                        bottom: 20          // Afasta o título do gráfico
                    }
                }
            }
        }
    });
}


        // ✅ TABELA + GRÁFICO BARRAS (CONECTADOS CORRETAMENTE)
        fetch(`http://127.0.0.1:8000/projetos?gerente=${gerente}&forum=${forum}&status=${status}`)
        .then(res => res.json())
        .then(lista => {

                        // ✅ GRÁFICO DE BARRAS TOTALMENTE CORRIGIDO
            const ctx2 = document.getElementById('graficoGerenciaForum');
            if (ctx2) {
                if (window.grafico2) window.grafico2.destroy();

                const gerentes = [...new Set(lista.map(p => p.Gerente))];
                const foruns = [...new Set(lista.map(p => p.Forum))];

                const datasets = foruns.map(forum => {
                    return {
                        label: forum,
                        data: gerentes.map(g =>
                            lista.filter(p => p.Gerente === g && p.Forum === forum).length
                        )
                    };
                });

                const contexto2 = ctx2.getContext("2d");
                window.grafico2 = new Chart(contexto2, {
                    type: 'bar',
                    data: {
                        labels: gerentes,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    boxWidth: 15,
                                    padding: 15
                                }
                            },
                            title: {
                                display: true,
                                text: 'Demandas por Gerente x Fórum',
                                position: 'top',
                                font: {
                                    size: 16,
                                    weight: 'bold'
                                },
                                padding: {
                                    top: 10,
                                    bottom: 20
                                }
                            }
                        },
                                                scales: {
                            x: {
                                ticks: {
                                    maxRotation: 0, 
                                    minRotation: 0, 
                                    autoSkip: false,
                                    // 🆕 NOVAS CONFIGURAÇÕES DE TAMANHO E QUEBRA
                                    font: {
                                        size: 10 // Diminui o tamanho da fonte (padrão é 12)
                                    },
                                    callback: function(val, index) {
                                        // Pega o nome do gerente
                                        const label = this.getLabelForValue(val);
                                        // Se tiver espaço/sobrenome, quebra em duas linhas para não trombar no vizinho
                                        if (label.includes(' ')) {
                                            return label.split(' '); 
                                        }
                                        return label;
                                        }
                                    }
                                }
                            }
                        }

                });
            }



            // ====== 🛠️ FILTRO DO CARD MOVIDO PARA CÁ (DENTRO DO ESCOPO DA LISTA) ======
            let listaFiltrada = lista;

            if (filtroCardProjeto === "ATRASADO") {
                listaFiltrada = listaFiltrada.filter(i => i.Status === "ATRASADO");
            } else if (filtroCardProjeto === "NO PRAZO") {
                listaFiltrada = listaFiltrada.filter(i => i.Status === "NO PRAZO");
            } else if (filtroCardProjeto === "ATENÇÃO") {
                listaFiltrada = listaFiltrada.filter(i => i.Status === "ATENÇÃO");
            } else if (filtroCardProjeto === "PLANEJADO") {
                listaFiltrada = listaFiltrada.filter(i => i["Status Geral"] === "PLANEJADO");
            } else if (filtroCardProjeto === "EXECUÇÃO") {
                listaFiltrada = listaFiltrada.filter(i => i["Status Geral"] === "EXECUÇÃO");
            } else if (filtroCardProjeto === "BACKLOG") {
                listaFiltrada = listaFiltrada.filter(i => i["Status Geral"] === "BACKLOG");
            } else if (filtroCardProjeto === "ALTA") {
                listaFiltrada = listaFiltrada.filter(i => i.Prioridade === "Alta" || i.Prioridade === "ALTA");
            }

            // ✅ RENDERIZAÇÃO DA TABELA OTIMIZADA (APENAS UMA VEZ)
            const tabela = document.querySelector("#tabelaProjetos tbody");
            if (tabela) {
                tabela.innerHTML = listaFiltrada.map(item => `
                    <tr>
                        <td>${item.ID ?? ''}</td>
                        <td>${item.Projeto ?? ''}</td>
                        <td>${item.Gerente ?? ''}</td>
                        <td>${item.Forum ?? ''}</td>
                        <td>${item["Status Geral"] ?? ''}</td>
                        <td>${item.Status ?? ''}</td>
                        <td>${item.Prioridade ?? ''}</td>
                    </tr>
                `).join('');
            }

        })
        .catch(err => console.error("Erro ao buscar projetos:", err));

    })
    .catch(err => console.error("Erro ao buscar métricas:", err));
}


// =============================
// ✅ AÇÕES (CORRIGIDO)
// =============================
// =============================
// ✅ AÇÕES
// =============================
function carregarFiltrosAcoes() {

    fetch("http://127.0.0.1:8000/acoes")	
    .then(res => res.json())
    .then(data => {

        const selGerente = document.getElementById("filtroGerenteAcoes");
        const selForum = document.getElementById("filtroForumAcoes");

        if (!selGerente) return;

        const lista = data.dados;

        const gerentes = [...new Set(lista.map(p => p.Gerente))];
        const foruns = [...new Set(lista.map(p => p.Forum))];

        selGerente.innerHTML = '<option value="">Todos</option>';
        selForum.innerHTML = '<option value="">Todos</option>';

        gerentes.forEach(g => selGerente.add(new Option(g, g)));
        foruns.forEach(f => selForum.add(new Option(f, f)));

        // ✅ Roda as ações automaticamente após os selects existirem com dados
        carregarAcoes();
    })
    .catch(err => console.error("Erro ao carregar filtros de ações:", err));
}


function carregarAcoes() {

    const gerente = document.getElementById("filtroGerenteAcoes")?.value || "";
    const forum = document.getElementById("filtroForumAcoes")?.value || "";

    fetch(`http://127.0.0.1:8000/acoes?gerente=${gerente}&forum=${forum}`)
    .then(res => res.json())
    .then(data => {

    const ctx = document.getElementById('graficoAcoes');

    if (ctx && typeof Chart !== "undefined") {

    if (window.graficoAcoes instanceof Chart) {
    window.graficoAcoes.destroy();
}

    const totalAtrasado = data.dados.filter(i => i["Status Ação"] === "ATRASADO").length;
    const totalPrazo = data.dados.filter(i => i["Status Ação"] === "NO PRAZO").length;
    const totalAtencao = data.dados.filter(i => i["Status Ação"] === "ATENÇÃO").length;
    const semAcao = data.dados.filter(i => {
    const status = (i["Status Ação"] || "").toUpperCase().trim();

    return (
        status === "" ||
        status === "SEM AÇÃO" ||
        status === "SEM ACAO"
    );
}).length;

    const contexto = ctx.getContext("2d");

    window.graficoAcoes = new Chart(contexto, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
            {
                label: 'No Prazo',
                data: [totalPrazo],
                backgroundColor: "#2ecc71"
            },
            {
                label: 'Atenção',
                data: [totalAtencao],
                backgroundColor: "#f1c40f"
            },
            {
                label: 'Atrasado',
                data: [totalAtrasado],
                backgroundColor: "#ff3b3b"
            },
            {
                label: 'Sem Ação',
                data: [semAcao],
                backgroundColor: "#95a5a6"
            }
        ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    position: 'bottom'
                },
                title: {
    display: true,
    text: 'Status das Ações',
    font: {
        size: 18,     // Defina o tamanho que desejar aqui (padrão é 12)
        weight: 'bold' // Deixa o título em negrito (opcional)
    }
}
            },
            scales: {
            y: {
                beginAtZero: true
            }
          }
        }
    });
}

        if(document.getElementById("total_acoes")) document.getElementById("total_acoes").innerText = data.total_acoes;
        if(document.getElementById("acoes_atrasadas")) document.getElementById("acoes_atrasadas").innerText = data.acoes_atrasadas;
        if(document.getElementById("acoes_no_prazo")) document.getElementById("acoes_no_prazo").innerText = data.acoes_no_prazo;
        if (document.getElementById("acoes_atencao")) {
        document.getElementById("acoes_atencao").innerText =
        data.dados.filter(i => i["Status Ação"] === "ATENÇÃO").length;
}

        const tabela = document.querySelector("#tabelaAcoes tbody");
        if (!tabela) return;

        let listaFiltrada = [...data.dados]; 

        // Aplica o filtro do card de ações
        if (filtroCard === "ATRASADO") {
            listaFiltrada = listaFiltrada.filter(i => i["Status Ação"] === "ATRASADO");
        } 
        else if (filtroCard === "NO PRAZO") {
            listaFiltrada = listaFiltrada.filter(i => i["Status Ação"] === "NO PRAZO");
        }
        else if (filtroCard === "ATENCAO") {
            listaFiltrada = listaFiltrada.filter(i => i["Status Ação"] === "ATENÇÃO");
        }

        tabela.innerHTML = listaFiltrada.map(item => {
            let dataFormatada = item["Prazo da Ação"]
                ? new Date(item["Prazo da Ação"]).toLocaleDateString()
                : "-";

            return `
                <tr>
                    <td>${item.ID ?? ''}</td>
                    <td>${item.Projeto ?? ''}</td>
                    <td>${item["Status Ação"] ?? ''}</td>
                    <td>${item["Ações"] ?? ''}</td>
                    <td>${dataFormatada}</td>
                    <td>${item["Responsável"] ?? ''}</td>
                </tr>
            `;
        }).join('');
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
        carregarFiltrosAcoes(); // 🛠️ CORREÇÃO: Removido o carregarAcoes() daqui de baixo

        document.getElementById("filtroGerenteAcoes").addEventListener("change", carregarAcoes);
        document.getElementById("filtroForumAcoes").addEventListener("change", carregarAcoes);
    }

});

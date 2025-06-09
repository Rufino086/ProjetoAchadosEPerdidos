document.addEventListener("DOMContentLoaded", () => {
    const listaDeItensDiv = document.getElementById("listaDeItens");
    const loadingItensDiv = document.getElementById("loadingItens");
    const noResultsMessageDiv = document.getElementById("noResultsMessage");
    const filtroItensForm = document.getElementById("filtroItensForm");
    const limparFiltrosButton = document.getElementById("limparFiltros");

    // Usa a função fetchData centralizada de api_helpers.js
    // async function fetchData(endpoint) { ... } // Removida, usar a global

    function getStatusClass(status) {
        switch (status) {
            case "Achado":
                return { bg: "bg-success", text: "text-white", icon: "bi-check-circle-fill" };
            case "Perdido":
                return { bg: "bg-danger", text: "text-white", icon: "bi-search" };
            case "Coletado":
                return { bg: "bg-info", text: "text-dark", icon: "bi-archive-fill" };
            case "Em análise":
                return { bg: "bg-warning", text: "text-dark", icon: "bi-hourglass-split" };
            case "Devolvido":
                return { bg: "bg-primary", text: "text-white", icon: "bi-person-check-fill" };
            default:
                return { bg: "bg-secondary", text: "text-white", icon: "bi-question-circle-fill" };
        }
    }

    async function carregarItens(filtros = {}) {
        if (!listaDeItensDiv || !loadingItensDiv || !noResultsMessageDiv) return;

        loadingItensDiv.classList.remove("d-none");
        noResultsMessageDiv.classList.add("d-none");
        listaDeItensDiv.innerHTML = ""; // Limpa itens antigos

        let todosItens = await fetchData("itens"); // Usa a função global

        if (todosItens === null) {
            listaDeItensDiv.innerHTML = 
                `<div class="col-12"><p class="text-danger text-center fw-bold">Falha ao carregar itens. Verifique se o JSON Server está rodando (json-server --watch db/db.json --port 3000) e tente novamente.</p></div>`;
            loadingItensDiv.classList.add("d-none");
            return;
        }
        
        // Aplicar filtros do formulário
        if (filtros.tipo) {
            todosItens = todosItens.filter(item => item.tipo_registro === filtros.tipo);
        }
        if (filtros.status) {
            todosItens = todosItens.filter(item => item.status === filtros.status);
        }
        if (filtros.local) {
            todosItens = todosItens.filter(item => 
                item.local_ocorrencia && item.local_ocorrencia.toLowerCase().includes(filtros.local.toLowerCase())
            );
        }

        // Filtro especial para itens coletados em um ponto específico (usado no perfil do ponto de coleta)
        const urlParams = new URLSearchParams(window.location.search);
        const filtroPontoId = urlParams.get("pontoId");
        const filtroTipoUrl = urlParams.get("filtro");

        if (filtroTipoUrl === "coletados_ponto" && filtroPontoId) {
            todosItens = todosItens.filter(item => item.id_ponto_coleta === parseInt(filtroPontoId) && item.status === "Coletado");
            const pageTitle = document.querySelector(".page-title");
            if(pageTitle) pageTitle.textContent = "Itens no Ponto de Coleta";
        }

        loadingItensDiv.classList.add("d-none");

        if (todosItens.length === 0) {
            noResultsMessageDiv.classList.remove("d-none");
            return;
        }

        todosItens.forEach(item => {
            const statusInfo = getStatusClass(item.status);
            const dataFormatada = item.data_ocorrencia ? new Date(item.data_ocorrencia).toLocaleDateString() : "Data não informada";
            const cardItem = `
                <div class="col">
                    <div class="card h-100 item-card shadow-sm">
                        <img src="${item.foto_url || "assets/images/item_placeholder.png"}" 
                             class="card-img-top item-card-img" 
                             alt="${item.titulo || "Sem título"}"
                             onerror="this.onerror=null; this.src=\'assets/images/item_placeholder.png\';">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold">${item.titulo || "Sem título"}</h5>
                            <p class="card-text text-muted small mb-1"><i class="bi bi-geo-alt-fill me-1"></i> ${item.local_ocorrencia || "Local não informado"}</p>
                            <p class="card-text text-muted small mb-2"><i class="bi bi-calendar-event-fill me-1"></i> ${dataFormatada}</p>
                            <div class="mb-2">
                                <span class="badge ${statusInfo.bg} ${statusInfo.text}"><i class="bi ${statusInfo.icon} me-1"></i>${item.status || "Status indefinido"}</span>
                                <span class="badge bg-${item.tipo_registro === "perdido" ? "secondary" : "primary"} ms-1">${item.tipo_registro === "perdido" ? "Perdido" : "Achado"}</span>
                            </div>
                            <p class="card-text item-description flex-grow-1">${item.descricao ? item.descricao.substring(0, 100) + (item.descricao.length > 100 ? "..." : "") : "Sem descrição detalhada."}</p>
                            <!-- Corrigido -->
                            <a href="pagina_gerenciar_item.html?id=${item.id}" class="btn btn-outline-primary mt-auto align-self-start w-100">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            `;
            listaDeItensDiv.innerHTML += cardItem;
        });

        // Adicionar tratamento de erro para todas as imagens após serem adicionadas ao DOM
        document.querySelectorAll(".item-card-img").forEach(img => {
            img.onerror = function() {
                this.onerror = null;
                this.src = "assets/images/item_placeholder.png";
            };
        });
    }

    if (filtroItensForm) {
        filtroItensForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const filtros = {
                tipo: document.getElementById("filtroTipo").value,
                status: document.getElementById("filtroStatus").value,
                local: document.getElementById("filtroLocal").value
            };
            carregarItens(filtros);
        });
    }

    if (limparFiltrosButton) {
        limparFiltrosButton.addEventListener("click", () => {
            if (filtroItensForm) filtroItensForm.reset();
            carregarItens(); 
        });
    }

    // Carregar itens inicialmente
    const urlParams = new URLSearchParams(window.location.search);
    const filtroPontoId = urlParams.get("pontoId");
    const filtroTipoUrl = urlParams.get("filtro");
    if (filtroTipoUrl === "coletados_ponto" && filtroPontoId) {
        carregarItens(); 
    } else {
        carregarItens();
    }
});


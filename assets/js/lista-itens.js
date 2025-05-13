document.addEventListener("DOMContentLoaded", () => {
    const listaDeItensDiv = document.getElementById("listaDeItens");
    const loadingItens = document.getElementById("loadingItens");
    const filtroItensForm = document.getElementById("filtroItensForm");
    const limparFiltrosButton = document.getElementById("limparFiltros");
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    // Atualiza o avatar e o menu dropdown do usuário na navbar
    const avatarUsuario = document.getElementById("avatarUsuario");
    const notificacaoPerfil = document.getElementById("notificacaoPerfil");
    const navUserIconDropdown = document.querySelector(".navbar .dropdown:not(.navbar-nav .dropdown)");
    const navContaDropdown = document.querySelector(".navbar-nav .dropdown"); // Menu "Conta"

    if (usuarioLogado) {
        if (navContaDropdown) navContaDropdown.style.display = "none";
        if (navUserIconDropdown) navUserIconDropdown.style.display = "block";
        // Poderia adicionar o nome do usuário ou avatar real aqui
    } else {
        if (navContaDropdown) navContaDropdown.style.display = "block";
        if (navUserIconDropdown) navUserIconDropdown.style.display = "none";
    }

    async function carregarItens(filtros = {}) {
        if (!listaDeItensDiv || !loadingItens) return;
        loadingItens.style.display = "block";
        listaDeItensDiv.innerHTML = esión;

        let todosItens = await fetchData("itens");

        if (!todosItens) {
            listaDeItensDiv.innerHTML = 
                '<div class="col-12"><p class="text-danger text-center">Falha ao carregar itens. Verifique o console para mais detalhes ou se o JSON Server está rodando (npm run server).</p></div>';
            loadingItens.style.display = "none";
            return;
        }
        
        // Aplicar filtros
        if (filtros.tipo) {
            todosItens = todosItens.filter(item => item.tipo_registro === filtros.tipo);
        }
        if (filtros.status) {
            todosItens = todosItens.filter(item => item.status === filtros.status);
        }
        if (filtros.local) {
            todosItens = todosItens.filter(item => item.local_ocorrencia.toLowerCase().includes(filtros.local.toLowerCase()));
        }
         // Filtro especial para itens coletados em um ponto específico (usado no perfil do ponto de coleta)
        const urlParams = new URLSearchParams(window.location.search);
        const filtroPontoId = urlParams.get("pontoId");
        const filtroTipoUrl = urlParams.get("filtro");

        if (filtroTipoUrl === "coletados_ponto" && filtroPontoId) {
            todosItens = todosItens.filter(item => item.id_ponto_coleta === parseInt(filtroPontoId) && item.status === "Coletado");
            document.querySelector("h2.mb-0").textContent = "Itens no Ponto de Coleta"; // Atualiza título da página
        }


        loadingItens.style.display = "none";

        if (todosItens.length === 0) {
            listaDeItensDiv.innerHTML = 
                '<div class="col-12"><p class="text-center">Nenhum item encontrado com os filtros aplicados.</p></div>';
            return;
        }

        todosItens.forEach(item => {
            const cardItem = `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm item-card">
                        <img src="${item.foto_url || 'https://via.placeholder.com/300x200/d4cece/269744?text=Sem+Foto'}" class="card-img-top" alt="${item.titulo}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${item.titulo}</h5>
                            <p class="card-text text-muted small">Local: ${item.local_ocorrencia}</p>
                            <p class="card-text text-muted small">Data: ${new Date(item.data_ocorrencia).toLocaleDateString()}</p>
                            <p class="card-text">
                                Status: <span class="badge bg-${item.status === 'Perdido' ? 'warning text-dark' : (item.status === 'Achado' ? 'success' : (item.status === 'Coletado' ? 'info text-dark' : 'secondary'))}">${item.status}</span>
                                <span class="badge bg-${item.tipo_registro === 'perdido' ? 'danger' : 'primary'} ms-1">${item.tipo_registro === 'perdido' ? 'Perdido por Usuário' : 'Achado por Usuário'}</span>
                            </p>
                            <a href="item.html?id=${item.id}" class="btn btn-outline-primary mt-auto">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            `;
            listaDeItensDiv.innerHTML += cardItem;
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
            carregarItens(); // Carrega todos os itens sem filtro
        });
    }

    // Carregar itens inicialmente
    const urlParams = new URLSearchParams(window.location.search);
    const filtroPontoId = urlParams.get("pontoId");
    const filtroTipoUrl = urlParams.get("filtro");
    if (filtroTipoUrl === "coletados_ponto" && filtroPontoId) {
        carregarItens(); // O filtro de ponto de coleta será aplicado dentro da função carregarItens
    } else {
        carregarItens();
    }

    // Logout (duplicado de auth.js para garantir funcionalidade se houver problema de carregamento)
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            alert("Logout realizado com sucesso!");
            window.location.href = "index.html";
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    // Verificar se o usuário está logado e é um ponto de coleta usando a função centralizada
    const usuarioVerificado = verificarLogin("ponto_coleta"); // Garante que é um ponto de coleta
    if (!usuarioVerificado) {
        // A função verificarLogin já trata o redirecionamento
        return; 
    }
    
    // Elementos do DOM
    const avatarPontoColeta = document.getElementById("avatarPontoColeta");
    const avatarUsuario = document.getElementById("avatarUsuario"); // Navbar avatar
    const nomePontoColeta = document.getElementById("nomePontoColeta");
    const cnpjPontoColeta = document.getElementById("cnpjPontoColeta");
    const enderecoPontoColeta = document.getElementById("enderecoPontoColeta");
    const telefonePontoColeta = document.getElementById("telefonePontoColeta");
    const horarioPontoColeta = document.getElementById("horarioPontoColeta");
    const emailPontoColeta = document.getElementById("emailPontoColeta");
    
    const totalItensColetados = document.getElementById("totalItensColetados");
    const totalItensDevolvidos = document.getElementById("totalItensDevolvidos");
    const totalItensEmAnalise = document.getElementById("totalItensEmAnalise");
    
    const loadingItensRecebidos = document.getElementById("loadingItensRecebidos");
    const emptyStateItensRecebidos = document.getElementById("emptyStateItensRecebidos");
    const itensRecebidosList = document.getElementById("itensRecebidosList");
    
    const loadingHistoricoEntregas = document.getElementById("loadingHistoricoEntregas");
    const emptyStateHistoricoEntregas = document.getElementById("emptyStateHistoricoEntregas");
    const historicoEntregasList = document.getElementById("historicoEntregasList");
    
    const btnEditarPerfil = document.getElementById("btnEditarPerfil");
    
    // Carregar informações do ponto de coleta
    function carregarInformacoesPontoColeta() {
        // Carregar avatar
        if (avatarPontoColeta && usuarioVerificado.foto_estabelecimento) {
            avatarPontoColeta.src = usuarioVerificado.foto_estabelecimento;
            if (avatarUsuario) avatarUsuario.src = usuarioVerificado.foto_estabelecimento;
        } else if (avatarPontoColeta) {
             avatarPontoColeta.src = "assets/images/avatarPadrão.png"; // Padrão
             if (avatarUsuario) avatarUsuario.src = "assets/images/avatarPadrão.png";
        }
        
        // Carregar informações básicas
        if (nomePontoColeta) nomePontoColeta.textContent = usuarioVerificado.nome_estabelecimento || usuarioVerificado.nome || "Nome não informado";
        if (cnpjPontoColeta) cnpjPontoColeta.textContent = usuarioVerificado.cnpj || "CNPJ não informado";
        if (enderecoPontoColeta) enderecoPontoColeta.textContent = usuarioVerificado.endereco || "Endereço não informado";
        if (telefonePontoColeta) telefonePontoColeta.textContent = usuarioVerificado.telefone || "Telefone não informado";
        if (horarioPontoColeta) horarioPontoColeta.textContent = usuarioVerificado.horario_funcionamento || "Horário não informado";
        if (emailPontoColeta) emailPontoColeta.textContent = usuarioVerificado.email || "Email não informado";
    }
    
    // Carregar itens do ponto de coleta
    async function carregarItensPontoColeta() {
        // Usa a função fetchData centralizada
        const todosItens = await fetchData("itens"); 
        
        if (!todosItens) {
            if (loadingItensRecebidos) loadingItensRecebidos.style.display = "none";
            if (loadingHistoricoEntregas) loadingHistoricoEntregas.style.display = "none";
            alert("Não foi possível carregar os itens. Verifique sua conexão ou o servidor JSON.");
            return;
        }
        
        // Filtrar itens do ponto de coleta
        const itensDoPonto = todosItens.filter(item => item.id_ponto_coleta === usuarioVerificado.id);
        
        // Contar itens por status
        const itensColetados = itensDoPonto.filter(item => item.status === "Coletado").length;
        const itensDevolvidos = itensDoPonto.filter(item => item.status === "Devolvido").length;
        const itensEmAnalise = itensDoPonto.filter(item => item.status === "Em análise").length;
        
        // Atualizar contadores
        if (totalItensColetados) totalItensColetados.textContent = itensColetados;
        if (totalItensDevolvidos) totalItensDevolvidos.textContent = itensDevolvidos;
        if (totalItensEmAnalise) totalItensEmAnalise.textContent = itensEmAnalise;
        
        // Carregar itens recebidos (Coletados e Em análise)
        const itensRecebidos = itensDoPonto.filter(item => 
            item.status === "Coletado" || item.status === "Em análise"
        );
        
        if (loadingItensRecebidos) loadingItensRecebidos.style.display = "none";
        
        if (itensRecebidos.length === 0) {
            if (emptyStateItensRecebidos) {
                emptyStateItensRecebidos.classList.remove("d-none");
            }
        } else {
             if (emptyStateItensRecebidos) emptyStateItensRecebidos.classList.add("d-none");
            if (itensRecebidosList) {
                itensRecebidosList.innerHTML = ""; // Limpa a lista antes de adicionar
                
                itensRecebidos.forEach(item => {
                    const dataFormatada = item.data_ocorrencia ? new Date(item.data_ocorrencia).toLocaleDateString() : "Data não informada";
                    const statusClass = item.status === "Coletado" ? "status-coletado" : "status-analise";
                    
                    const itemCard = document.createElement("div");
                    itemCard.className = "col";
                    itemCard.innerHTML = `
                        <div class="card item-card h-100 shadow-sm">
                            <div class="position-relative">
                                <img src="${item.foto_url || "assets/images/item_placeholder.png"}" 
                                    class="card-img-top" alt="${item.titulo || "Sem título"}" 
                                    style="height: 180px; object-fit: cover;"
                                    onerror="this.onerror=null; this.src=\'assets/images/item_placeholder.png\';">
                                <div class="item-status ${statusClass}">${item.status}</div>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${item.titulo || "Sem título"}</h5>
                                <p class="card-text mb-1 text-muted small">
                                    <i class="bi bi-calendar-event me-1"></i> ${dataFormatada}
                                </p>
                                <p class="card-text mb-3 text-muted small">
                                    <i class="bi bi-geo-alt me-1"></i> ${item.local_ocorrencia || "Local não informado"}
                                </p>
                                <div class="d-flex justify-content-between align-items-center mt-auto">
                                    <!-- Corrigido -->
                                    <a href="pagina_gerenciar_item.html?id=${item.id}" class="btn btn-sm btn-outline-primary">Ver Detalhes</a>
                                    ${item.status === "Coletado" || item.status === "Em análise" ? 
                                    `<button class="btn btn-sm btn-success validar-devolucao" data-item-id="${item.id}">
                                        <i class="bi bi-check-circle me-1"></i> Validar Devolução
                                    </button>` : ""}
                                </div>
                            </div>
                        </div>
                    `;
                    
                    itensRecebidosList.appendChild(itemCard);
                });
                
                // Adicionar event listeners para botões de validação
                document.querySelectorAll(".validar-devolucao").forEach(btn => {
                    btn.addEventListener("click", async (e) => {
                        const itemId = e.currentTarget.getAttribute("data-item-id");
                        if (confirm("Confirmar a devolução deste item ao proprietário?")) {
                            await validarDevolucao(itemId);
                        }
                    });
                });
            }
        }
        
        // Carregar histórico de entregas (Devolvidos)
        const itensDevolvido = itensDoPonto.filter(item => item.status === "Devolvido");
        
        if (loadingHistoricoEntregas) loadingHistoricoEntregas.style.display = "none";
        
        if (itensDevolvido.length === 0) {
            if (emptyStateHistoricoEntregas) {
                emptyStateHistoricoEntregas.classList.remove("d-none");
            }
        } else {
            if (emptyStateHistoricoEntregas) emptyStateHistoricoEntregas.classList.add("d-none");
            if (historicoEntregasList) {
                historicoEntregasList.innerHTML = ""; // Limpa a lista
                
                itensDevolvido.forEach(item => {
                    const dataFormatada = item.data_ocorrencia ? new Date(item.data_ocorrencia).toLocaleDateString() : "Data não informada";
                    const dataAtualizacao = item.data_atualizacao ? new Date(item.data_atualizacao).toLocaleDateString() : "Data não informada";
                    
                    const itemCard = document.createElement("div");
                    itemCard.className = "col";
                    itemCard.innerHTML = `
                        <div class="card item-card h-100 shadow-sm">
                            <div class="position-relative">
                                <img src="${item.foto_url || "assets/images/item_placeholder.png"}" 
                                    class="card-img-top" alt="${item.titulo || "Sem título"}" 
                                    style="height: 180px; object-fit: cover;"
                                    onerror="this.onerror=null; this.src=\'assets/images/item_placeholder.png\';">
                                <div class="item-status status-devolvido">Devolvido</div>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${item.titulo || "Sem título"}</h5>
                                <p class="card-text mb-1 text-muted small">
                                    <i class="bi bi-calendar-event me-1"></i> Encontrado: ${dataFormatada}
                                </p>
                                <p class="card-text mb-1 text-muted small">
                                    <i class="bi bi-calendar-check me-1"></i> Devolvido: ${dataAtualizacao}
                                </p>
                                <p class="card-text mb-3 text-muted small">
                                    <i class="bi bi-geo-alt me-1"></i> ${item.local_ocorrencia || "Local não informado"}
                                </p>
                                <!-- Corrigido -->
                                <a href="pagina_gerenciar_item.html?id=${item.id}" class="btn btn-sm btn-outline-primary mt-auto">Ver Detalhes</a>
                            </div>
                        </div>
                    `;
                    
                    historicoEntregasList.appendChild(itemCard);
                });
            }
        }
    }
    
    // Função para validar devolução de item
    async function validarDevolucao(itemId) {
        // Usa a função patchData centralizada
        const result = await patchData(`itens/${itemId}`, {
            status: "Devolvido",
            data_atualizacao: new Date().toISOString()
        });
        
        if (result) {
            alert("Devolução validada com sucesso!");
            // Recarregar itens
            carregarItensPontoColeta();
        } else {
            alert("Ocorreu um erro ao validar a devolução. Verifique sua conexão ou o servidor JSON.");
        }
    }
    
    // Event listener para botão de editar perfil - Corrigido
    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener("click", () => {
            // Redireciona para a página de cadastro/edição do ponto de coleta
            window.location.href = "pagina_cadastro_ponto_coleta.html"; 
        });
    }
    
    // Inicializar
    carregarInformacoesPontoColeta();
    carregarItensPontoColeta();
    
    // Logout - Usa a função centralizada
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
            e.preventDefault();
            logoutUsuario(); // Chama a função de logout de api_helpers.js
            alert("Logout realizado com sucesso!");
            window.location.href = "pagina_inicial.html"; // Redireciona para a página inicial após logout
        });
    }
});


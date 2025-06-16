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
    const changeAvatarBtn = document.getElementById("changeAvatarBtn");
    const linkAvatarBtn = document.getElementById("linkAvatarBtn");
    const removeAvatarBtn = document.getElementById("removeAvatarBtn");
    const avatarInput = document.getElementById("avatarInput");
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
        
        // Exibir descrição se existir
        const descricaoPontoColeta = document.getElementById("descricaoPontoColeta");
        if (descricaoPontoColeta) descricaoPontoColeta.textContent = usuarioVerificado.descricao || "Descrição não informada";
    }
    
    // Gerenciamento de avatar
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener("click", () => {
            avatarInput.click();
        });
    }
    
    if (linkAvatarBtn) {
        linkAvatarBtn.addEventListener("click", () => {
            const url = prompt("Digite a URL da imagem:");
            if (url && url.trim()) {
                const img = new Image();
                img.onload = function() {
                    if (avatarPontoColeta) avatarPontoColeta.src = url;
                    if (avatarUsuario) avatarUsuario.src = url;
                    
                    usuarioVerificado.foto_estabelecimento = url;
                    sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioVerificado));
                    alert("Foto de perfil atualizada com sucesso!");
                };
                img.onerror = function() {
                    alert("Erro ao carregar a imagem. Verifique se a URL está correta.");
                };
                img.src = url;
            }
        });
    }
    
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener("click", () => {
            if (confirm("Tem certeza que deseja remover a foto de perfil?")) {
                if (avatarPontoColeta) avatarPontoColeta.src = "assets/images/avatarPadrão.png";
                if (avatarUsuario) avatarUsuario.src = "assets/images/avatarPadrão.png";
                
                usuarioVerificado.foto_estabelecimento = null;
                sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioVerificado));
                alert("Foto de perfil removida com sucesso!");
            }
        });
    }
    
    if (linkAvatarBtn) {
        linkAvatarBtn.addEventListener("click", async () => {
            const url = prompt("Digite a URL da imagem:");
            if (url && url.trim()) {
                const img = new Image();
                img.onload = async function() {
                    if (avatarPontoColeta) avatarPontoColeta.src = url;
                    if (avatarUsuario) avatarUsuario.src = url;
                    
                    // Atualizar no banco de dados
                    try {
                        const resultado = await patchData(`pontos_coleta/${usuarioVerificado.id}`, { foto_estabelecimento: url });
                        if (resultado) {
                            usuarioVerificado.foto_estabelecimento = url;
                            sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioVerificado));
                            alert("Foto de perfil atualizada com sucesso!");
                        } else {
                            alert("Erro ao salvar a foto. Tente novamente.");
                        }
                    } catch (error) {
                        console.error("Erro ao atualizar avatar:", error);
                        alert("Erro ao salvar a foto. Tente novamente.");
                    }
                };
                img.onerror = function() {
                    alert("Erro ao carregar a imagem. Verifique se a URL está correta.");
                };
                img.src = url;
            }
        });
    }
    
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener("click", async () => {
            if (avatarPontoColeta) avatarPontoColeta.src = "assets/images/avatarPadrão.png";
            if (avatarUsuario) avatarUsuario.src = "assets/images/avatarPadrão.png";
            
            // Atualizar no banco de dados
            try {
                const resultado = await patchData(`pontos_coleta/${usuarioVerificado.id}`, { foto_estabelecimento: null });
                if (resultado) {
                    usuarioVerificado.foto_estabelecimento = null;
                    sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioVerificado));
                    alert("Foto de perfil removida com sucesso!");
                } else {
                    alert("Erro ao remover a foto. Tente novamente.");
                }
            } catch (error) {
                console.error("Erro ao remover avatar:", error);
                alert("Erro ao remover a foto. Tente novamente.");
            }
        });
    }
    
    if (avatarInput) {
        avatarInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = function(event) {
                    const dataUrl = event.target.result;
                    if (avatarPontoColeta) avatarPontoColeta.src = dataUrl;
                    if (avatarUsuario) avatarUsuario.src = dataUrl;
                    
                    usuarioVerificado.foto_estabelecimento = dataUrl;
                    sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioVerificado));
                    alert("Foto de perfil atualizada com sucesso!");
                };
                reader.readAsDataURL(file);
            }
        });
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
        
        // Filtrar itens do ponto de coleta - Corrigido para usar == ao invés de ===
        const itensDoPonto = todosItens.filter(item => item.id_ponto_coleta == usuarioVerificado.id);
        
        console.log("Usuário logado ID:", usuarioVerificado.id);
        console.log("Todos os itens:", todosItens);
        console.log("Itens do ponto:", itensDoPonto);
        
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
    
    // Event listener para botão de editar perfil
    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener("click", () => {
            // Armazena os dados do ponto de coleta para edição
            sessionStorage.setItem("editandoPontoColeta", JSON.stringify(usuarioVerificado));
            // Redireciona para a página de cadastro/edição do ponto de coleta
            window.location.href = "pagina_cadastro_ponto_coleta.html?edit=true"; 
        });
    }
    
    // Event listener para pesquisa por código de item
    const btnPesquisarCodigo = document.getElementById("btnPesquisarCodigo");
    const codigoItemInput = document.getElementById("codigoItemInput");
    
    if (btnPesquisarCodigo && codigoItemInput) {
        btnPesquisarCodigo.addEventListener("click", async () => {
            const codigo = codigoItemInput.value.trim().toUpperCase();
            
            if (!codigo) {
                alert("Por favor, digite um código para pesquisar.");
                return;
            }
            
            if (codigo.length !== 6) {
                alert("O código deve ter exatamente 6 caracteres.");
                return;
            }
            
            try {
                // Buscar item pelo código
                const todosItens = await fetchData("itens");
                if (!todosItens) {
                    alert("Erro ao conectar com o servidor. Tente novamente.");
                    return;
                }
                
                const itemEncontrado = todosItens.find(item => item.codigo_item === codigo);
                
                if (!itemEncontrado) {
                    alert(`Nenhum item encontrado com o código: ${codigo}`);
                    return;
                }
                
                // Mostrar modal com informações do item e dropdown para alterar status
                mostrarModalAlterarStatus(itemEncontrado);
                
            } catch (error) {
                console.error("Erro ao pesquisar item:", error);
                alert("Erro ao pesquisar item. Tente novamente.");
            }
        });
    }
    
    // Função para mostrar modal de alteração de status
    function mostrarModalAlterarStatus(item) {
        // Criar modal dinamicamente
        const modalHTML = `
            <div class="modal fade" id="modalAlterarStatus" tabindex="-1" aria-labelledby="modalAlterarStatusLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalAlterarStatusLabel">Alterar Status do Item</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <h6><strong>Item:</strong> ${item.titulo}</h6>
                                <p><strong>Código:</strong> ${item.codigo_item}</p>
                                <p><strong>Descrição:</strong> ${item.descricao || "Sem descrição"}</p>
                                <p><strong>Status atual:</strong> <span class="badge bg-secondary">${item.status}</span></p>
                            </div>
                            <div class="mb-3">
                                <label for="novoStatus" class="form-label">Novo Status:</label>
                                <select class="form-select" id="novoStatus">
                                    <option value="">Selecione o novo status...</option>
                                    <option value="Coletado" ${item.status === "Perdido" ? "" : "disabled"}>Coletado (Item entregue ao ponto de coleta)</option>
                                    <option value="Devolvido" ${item.status === "Coletado" ? "" : "disabled"}>Devolvido (Item entregue ao dono)</option>
                                    <option value="Em análise" ${item.status === "Coletado" ? "" : "disabled"}>Em análise (Verificando proprietário)</option>
                                </select>
                                <div class="form-text">Você só pode alterar para status permitidos baseados no status atual.</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btnConfirmarAlteracao">Confirmar Alteração</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal existente se houver
        const modalExistente = document.getElementById("modalAlterarStatus");
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Adicionar modal ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalAlterarStatus'));
        modal.show();
        
        // Event listener para confirmar alteração
        document.getElementById("btnConfirmarAlteracao").addEventListener("click", async () => {
            const novoStatus = document.getElementById("novoStatus").value;
            
            if (!novoStatus) {
                alert("Por favor, selecione um novo status.");
                return;
            }
            
            try {
                // Atualizar status do item
                const dadosAtualizacao = {
                    status: novoStatus,
                    data_atualizacao: new Date().toISOString()
                };
                
                // Se está coletando o item, associar ao ponto de coleta
                if (novoStatus === "Coletado") {
                    dadosAtualizacao.id_ponto_coleta = usuarioVerificado.id;
                }
                
                const resultado = await patchData(`itens/${item.id}`, dadosAtualizacao);
                
                if (resultado) {
                    alert(`Status do item alterado para "${novoStatus}" com sucesso!`);
                    modal.hide();
                    document.getElementById("codigoItemInput").value = ""; // Limpar campo
                    carregarItensPontoColeta(); // Recarregar lista
                } else {
                    alert("Erro ao atualizar o item. Tente novamente.");
                }
            } catch (error) {
                console.error("Erro ao alterar status:", error);
                alert("Erro ao alterar status. Tente novamente.");
            }
        });
        
        // Remover modal do DOM quando fechado
        document.getElementById('modalAlterarStatus').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    }
    
    // Carregar informações iniciais
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


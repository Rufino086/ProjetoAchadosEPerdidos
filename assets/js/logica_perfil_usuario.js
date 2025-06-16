document.addEventListener("DOMContentLoaded", () => {
    // console.log("DEBUG: logica_perfil_usuario.js - DOMContentLoaded iniciado."); // Removido

    // Usa sessionStorage para consistência e segurança (limpa ao fechar navegador)
    // const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado")); // Removido, usar verificarLogin
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profilePhone = document.getElementById("profilePhone");
    const profileCpf = document.getElementById("profileCpf");
    const profileLocation = document.getElementById("profileLocation");
    const profileMemberSince = document.getElementById("profileMemberSince");
    const profileAvatar = document.getElementById("profileAvatar");
    const avatarUsuario = document.getElementById("avatarUsuario");
    const changeAvatarBtn = document.getElementById("changeAvatarBtn");
    const linkAvatarBtn = document.getElementById("linkAvatarBtn");
    const removeAvatarBtn = document.getElementById("removeAvatarBtn");
    const avatarInput = document.getElementById("avatarInput");
    const notificacaoPerfil = document.getElementById("notificacaoPerfil");
    
    // Containers para itens
    const itensPerdidosContainer = document.getElementById("itensPerdidosContainer");
    const itensAchadosContainer = document.getElementById("itensAchadosContainer");
    const loadingItensPerdidos = document.getElementById("loadingItensPerdidos");
    const loadingItensAchados = document.getElementById("loadingItensAchados");
    
    // Botões de ação
    const btnCadastrarItem = document.querySelector(".action-btn.btn-cadastrar");
    const btnProcurarItem = document.querySelector(".action-btn.btn-procurar");

    // Verifica login usando a função centralizada de api_helpers.js
    // console.log("DEBUG: logica_perfil_usuario.js - Chamando verificarLogin(\"comum\")..."); // Removido
    const usuarioVerificado = verificarLogin("comum"); // Corrigido: Garante que é um usuário comum (tipo "comum" no db.json)
    // console.log("DEBUG: logica_perfil_usuario.js - Resultado de verificarLogin:", usuarioVerificado); // Removido

    if (!usuarioVerificado) {
        // console.error("DEBUG: logica_perfil_usuario.js - usuarioVerificado é nulo ou falso. Interrompendo execução."); // Removido
        // A função verificarLogin já trata o redirecionamento ou loga o erro de permissão
        return; 
    }

    // console.log("DEBUG: logica_perfil_usuario.js - Verificação de login passou. Prosseguindo com o carregamento do perfil."); // Removido

    // Carregar informações do perfil
    function carregarInformacoesPerfil() {
        if (profileName) profileName.textContent = usuarioVerificado.nome || "Nome não informado";
        if (profileEmail) profileEmail.textContent = usuarioVerificado.email || "Email não informado";
        if (profilePhone) profilePhone.textContent = usuarioVerificado.telefone || "Telefone não informado";
        if (profileCpf) profileCpf.textContent = usuarioVerificado.cpf || "CPF não informado";
        if (profileLocation) profileLocation.textContent = usuarioVerificado.localizacao || "Localização não informada";
        
        // Formatar data de cadastro
        if (profileMemberSince) {
            if (usuarioVerificado.data_cadastro) {
                const dataCadastro = new Date(usuarioVerificado.data_cadastro);
                profileMemberSince.textContent = dataCadastro.toLocaleDateString();
            } else {
                profileMemberSince.textContent = "Data não informada";
            }
        }
        
        // Carregar avatar
        if (profileAvatar && usuarioVerificado.avatar) {
            profileAvatar.src = usuarioVerificado.avatar;
            if (avatarUsuario) avatarUsuario.src = usuarioVerificado.avatar;
        } else if (profileAvatar) {
            // Define um avatar padrão se não houver um salvo
            profileAvatar.src = "assets/images/avatarPadrão.png";
            if (avatarUsuario) avatarUsuario.src = "assets/images/avatarPadrão.png";
        }
    }

    // Gerenciamento de avatar
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener("click", () => {
            avatarInput.click();
        });
    }
    
    if (linkAvatarBtn) {
        linkAvatarBtn.addEventListener("click", async () => {
            const url = prompt("Digite a URL da imagem:");
            if (url && url.trim()) {
                const img = new Image();
                img.onload = async function() {
                    if (profileAvatar) profileAvatar.src = url;
                    if (avatarUsuario) avatarUsuario.src = url;
                    
                    // Atualizar no banco de dados
                    try {
                        const resultado = await patchData(`usuarios/${usuarioVerificado.id}`, { avatar: url });
                        if (resultado) {
                            usuarioVerificado.avatar = url;
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
    
    if (avatarInput) {
        avatarInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const avatarUrl = event.target.result;
                    if (profileAvatar) profileAvatar.src = avatarUrl;
                    if (avatarUsuario) avatarUsuario.src = avatarUrl;
                    
                    // Salvar no sessionStorage
                    usuarioVerificado.avatar = avatarUrl;
                    sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioVerificado));
                    
                    // Em um sistema real, aqui faria upload para o servidor e atualizaria o DB
                    // Ex: await patchData(`usuarios/${usuarioVerificado.id}`, { avatar: avatarUrl });
                    alert("Foto de perfil atualizada com sucesso!");
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener("click", async () => {
            if (profileAvatar) profileAvatar.src = "assets/images/avatarPadrão.png";
            if (avatarUsuario) avatarUsuario.src = "assets/images/avatarPadrão.png";
            
            // Atualizar no banco de dados
            try {
                const resultado = await patchData(`usuarios/${usuarioVerificado.id}`, { avatar: null });
                if (resultado) {
                    usuarioVerificado.avatar = null;
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

    // Botões de ação - Corrigido para usar nomes de página corretos
    if (btnCadastrarItem) {
        btnCadastrarItem.addEventListener("click", (e) => {
            e.preventDefault();
            // Redireciona para a página de seleção de ponto de coleta com a ação correta
            window.location.href = "pagina_selecionar_ponto_coleta.html?action=achado"; 
        });
    }
    
    if (btnProcurarItem) {
        btnProcurarItem.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "pagina_lista_itens.html"; // Corrigido
        });
    }

    // Carregar itens perdidos e achados separadamente
    async function carregarItensPerdidos() {
        if (!itensPerdidosContainer || !loadingItensPerdidos) return;
        
        // Usa a função fetchData centralizada
        const todosItens = await fetchData("itens"); 
        if (!todosItens) {
            itensPerdidosContainer.innerHTML = 
                '<p class="text-danger">Não foi possível carregar os itens. Verifique sua conexão ou o servidor JSON.</p>';
            loadingItensPerdidos.style.display = "none";
            return;
        }
        
        const itensPerdidos = todosItens.filter(item => 
            item.id_usuario_reportou === usuarioVerificado.id && 
            item.tipo_registro === "perdido"
        );
        
        loadingItensPerdidos.style.display = "none";
        
        if (itensPerdidos.length === 0) {
            itensPerdidosContainer.innerHTML = `
                <div class="empty-state text-center p-4">
                    <i class="bi bi-search fs-1 text-muted mb-3"></i>
                    <h4 class="text-muted">Nenhum item perdido registrado</h4>
                    <p class="text-muted">Você ainda não registrou nenhum item perdido.</p>
                    <!-- Corrigido -->
                    <a href="pagina_gerenciar_item.html?action=perdido" class="btn btn-outline-danger mt-3">
                        <i class="bi bi-plus-lg"></i> Registrar Item Perdido
                    </a>
                </div>
            `;
            return;
        }
        
        let html = 
            '<div class="row row-cols-1 row-cols-md-2 g-4">';
        
        itensPerdidos.forEach(item => {
            const dataFormatada = item.data_ocorrencia ? new Date(item.data_ocorrencia).toLocaleDateString() : "Data não informada";
            const statusClass = getStatusClass(item.status);
            
            html += `
                <div class="col">
                    <div class="card item-card h-100 shadow-sm">
                        <div class="position-relative">
                            <img src="${item.foto_url || "assets/images/item_placeholder.png"}" 
                                class="card-img-top" alt="${item.titulo}" 
                                style="height: 180px; object-fit: cover;"
                                onerror="this.onerror=null; this.src='assets/images/item_placeholder.png';">
                            <div class="item-status ${statusClass.class}">${item.status || "Status indefinido"}</div>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${item.titulo || "Sem título"}</h5>
                            <p class="card-text mb-1 text-muted small">
                                <i class="bi bi-calendar-event me-1"></i> ${dataFormatada}
                            </p>
                            <p class="card-text mb-3 text-muted small">
                                <i class="bi bi-geo-alt me-1"></i> ${item.local_ocorrencia || "Local não informado"}
                            </p>
                            <!-- Corrigido -->
                            <a href="pagina_gerenciar_item.html?id=${item.id}" class="btn btn-sm btn-outline-primary mt-auto">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += "</div>";
        itensPerdidosContainer.innerHTML = html;
    }
    
    async function carregarItensAchados() {
        if (!itensAchadosContainer || !loadingItensAchados) return;
        
        const todosItens = await fetchData("itens");
        if (!todosItens) {
            itensAchadosContainer.innerHTML = 
                '<p class="text-danger">Não foi possível carregar os itens. Verifique sua conexão ou o servidor JSON.</p>';
            loadingItensAchados.style.display = "none";
            return;
        }
        
        const itensAchados = todosItens.filter(item => 
            item.id_usuario_reportou === usuarioVerificado.id && 
            item.tipo_registro === "achado"
        );
        
        loadingItensAchados.style.display = "none";
        
        if (itensAchados.length === 0) {
            itensAchadosContainer.innerHTML = `
                <div class="empty-state text-center p-4">
                    <i class="bi bi-box2-heart fs-1 text-muted mb-3"></i>
                    <h4 class="text-muted">Nenhum item achado cadastrado</h4>
                    <p class="text-muted">Você ainda não cadastrou nenhum item achado.</p>
                    <!-- Corrigido -->
                    <a href="pagina_gerenciar_item.html?action=achado" class="btn btn-outline-success mt-3">
                        <i class="bi bi-plus-lg"></i> Cadastrar Item Achado
                    </a>
                </div>
            `;
            return;
        }
        
        let html = 
            '<div class="row row-cols-1 row-cols-md-2 g-4">';
        
        itensAchados.forEach(item => {
            const dataFormatada = item.data_ocorrencia ? new Date(item.data_ocorrencia).toLocaleDateString() : "Data não informada";
            const statusClass = getStatusClass(item.status);
            
            html += `
                <div class="col">
                    <div class="card item-card h-100 shadow-sm">
                        <div class="position-relative">
                            <img src="${item.foto_url || "assets/images/item_placeholder.png"}" 
                                class="card-img-top" alt="${item.titulo}" 
                                style="height: 180px; object-fit: cover;"
                                onerror="this.onerror=null; this.src='assets/images/item_placeholder.png';">
                            <div class="item-status ${statusClass.class}">${item.status || "Status indefinido"}</div>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${item.titulo || "Sem título"}</h5>
                            <p class="card-text mb-1 text-muted small">
                                <i class="bi bi-calendar-event me-1"></i> ${dataFormatada}
                            </p>
                            <p class="card-text mb-3 text-muted small">
                                <i class="bi bi-geo-alt me-1"></i> ${item.local_ocorrencia || "Local não informado"}
                            </p>
                            <!-- Corrigido -->
                            <a href="pagina_gerenciar_item.html?id=${item.id}" class="btn btn-sm btn-outline-primary mt-auto">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += "</div>";
        itensAchadosContainer.innerHTML = html;
    }
    
    // Função auxiliar para determinar a classe CSS do status
    function getStatusClass(status) {
        switch (status) {
            case "Achado":
                return { class: "status-achado" };
            case "Perdido":
                return { class: "status-perdido" };
            case "Coletado":
                return { class: "status-coletado" };
            case "Em análise":
                return { class: "status-analise" };
            default:
                return { class: "status-default" }; // Classe padrão
        }
    }

    // Verificar notificações (simplificado)
    async function verificarNotificacoes() {
        if (!notificacaoPerfil) return;
        
        const todosItens = await fetchData("itens");
        if (!todosItens) return;
        
        // Verificar itens perdidos pelo usuário que foram encontrados/coletados/analisados
        const itensPerdidosEncontrados = todosItens.filter(item => 
            item.id_usuario_reportou === usuarioVerificado.id && 
            item.tipo_registro === "perdido" && 
            ["Achado", "Coletado", "Em análise"].includes(item.status)
        );
        
        if (itensPerdidosEncontrados.length > 0) {
            notificacaoPerfil.textContent = itensPerdidosEncontrados.length;
            notificacaoPerfil.style.display = "inline-block"; // Usar inline-block para melhor alinhamento
        } else {
            notificacaoPerfil.style.display = "none";
        }
    }

    // Inicializar carregamento das informações
    carregarInformacoesPerfil();
    carregarItensPerdidos();
    carregarItensAchados();
    verificarNotificacoes();

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


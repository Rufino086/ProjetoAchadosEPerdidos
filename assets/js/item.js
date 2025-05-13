document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const formItem = document.getElementById("formItem");
    const viewItemDetailsDiv = document.getElementById("viewItemDetails");
    const itemActionsDiv = document.getElementById("itemActions");
    const tituloPaginaItem = document.getElementById("tituloPaginaItem");
    const loadingItem = document.getElementById("loadingItem");
    const itemIdField = document.getElementById("itemId");
    const itemStatusContainer = document.getElementById("itemStatusContainer");
    const pontoColetaSelectContainer = document.getElementById("pontoColetaSelectContainer");
    const itemPontoColetaSelect = document.getElementById("itemPontoColeta");
    const itemStatusSelect = document.getElementById("itemStatus");

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get("id");
    const action = urlParams.get("action"); // "achado" ou "perdido"

    if (!usuarioLogado && !itemId) { // Se não está logado e não está visualizando um item, não pode cadastrar
        alert("Você precisa estar logado para cadastrar um item.");
        window.location.href = "login.html";
        return;
    }

    async function carregarPontosColeta() {
        const pontos = await fetchData("pontos_coleta");
        if (pontos && itemPontoColetaSelect) {
            itemPontoColetaSelect.innerHTML = 
                '<option value="">Selecione um ponto de coleta...</option>";
            pontos.forEach(ponto => {
                itemPontoColetaSelect.innerHTML += `<option value="${ponto.id}">${ponto.nome}</option>`;
            });
        }
    }

    if (itemStatusSelect && pontoColetaSelectContainer) {
        itemStatusSelect.addEventListener("change", () => {
            if (itemStatusSelect.value === "Coletado") {
                pontoColetaSelectContainer.style.display = "block";
                itemPontoColetaSelect.required = true;
                carregarPontosColeta();
            } else {
                pontoColetaSelectContainer.style.display = "none";
                itemPontoColetaSelect.required = false;
            }
        });
    }

    async function carregarItemParaEdicaoOuVisualizacao() {
        if (!itemId) {
            loadingItem.style.display = "none";
            formItem.style.display = "block";
            if (action === "achado") {
                tituloPaginaItem.textContent = "Cadastrar Item Achado";
                if(itemStatusSelect) itemStatusSelect.value = "Achado";
            } else if (action === "perdido") {
                tituloPaginaItem.textContent = "Registrar Item Perdido";
                if(itemStatusSelect) itemStatusSelect.value = "Perdido";
            } else {
                tituloPaginaItem.textContent = "Cadastrar Novo Item"; // Genérico
            }
            // Ocultar campo de status se for um novo item perdido/achado pelo usuário comum
            // Ou permitir que ele escolha se já foi coletado, etc.
            // Por simplicidade, usuário comum cadastra como "Achado" ou "Perdido" inicialmente.
            if (usuarioLogado && usuarioLogado.tipo === 'comum' && (action === 'achado' || action === 'perdido')){
                if(itemStatusContainer) itemStatusContainer.style.display = 'block'; // Permitir mudar se necessário
            } else if (!usuarioLogado) { // Visualização pública
                 if(itemStatusContainer) itemStatusContainer.style.display = 'none';
            }
            return;
        }

        const item = await fetchData(`itens/${itemId}`);
        loadingItem.style.display = "none";

        if (item) {
            // Modo de visualização por padrão
            viewItemDetailsDiv.style.display = "block";
            formItem.style.display = "none";
            tituloPaginaItem.textContent = item.titulo;

            let quemReportouInfo = "Informação não disponível";
            if (item.id_usuario_reportou) {
                const reportador = await fetchData(`usuarios/${item.id_usuario_reportou}`);
                if (reportador) quemReportouInfo = `Usuário: ${reportador.nome}`;
            } else if (item.id_ponto_coleta && item.tipo_registro === "achado" && item.status === "Coletado") {
                 // Se foi um ponto de coleta que cadastrou diretamente (menos comum no fluxo atual)
                 const ponto = await fetchData(`pontos_coleta/${item.id_ponto_coleta}`);
                 if(ponto) quemReportouInfo = `Ponto de Coleta: ${ponto.nome}`;
            }

            let localColetaInfo = "";
            if (item.status === "Coletado" && item.id_ponto_coleta) {
                const ponto = await fetchData(`pontos_coleta/${item.id_ponto_coleta}`);
                if (ponto) {
                    localColetaInfo = `<p><strong>Local de Coleta:</strong> <a href="#" onclick="alert('Detalhes do Ponto: ${ponto.nome} - ${ponto.endereco}')">${ponto.nome}</a></p>`;
                }
            }

            viewItemDetailsDiv.innerHTML = `
                <img src="${item.foto_url || 'https://via.placeholder.com/600x400/d4cece/269744?text=Sem+Foto'}" class="img-fluid rounded mb-3" alt="${item.titulo}">
                <p><strong>Descrição:</strong> ${item.descricao}</p>
                <p><strong>Data da Ocorrência:</strong> ${new Date(item.data_ocorrencia).toLocaleDateString()}</p>
                <p><strong>Local da Ocorrência:</strong> ${item.local_ocorrencia}</p>
                <p><strong>Status:</strong> <span class="badge bg-${item.status === 'Perdido' ? 'warning text-dark' : (item.status === 'Achado' ? 'success' : (item.status === 'Coletado' ? 'info text-dark' : 'secondary'))}">${item.status}</span></p>
                <p><strong>Tipo de Registro:</strong> ${item.tipo_registro === 'perdido' ? 'Perdido por Usuário' : 'Achado por Usuário/Ponto'}</p>
                <p><strong>Reportado por:</strong> ${quemReportouInfo}</p>
                ${localColetaInfo}
            `;

            // Lógica de Ações para o item
            if (usuarioLogado && itemActionsDiv) {
                itemActionsDiv.style.display = "block";
                itemActionsDiv.innerHTML = ""; // Limpa ações anteriores

                // Se o usuário logado é quem reportou o item perdido e o item foi achado/coletado
                if (usuarioLogado.id === item.id_usuario_reportou && item.tipo_registro === "perdido" && (item.status === "Achado" || item.status === "Coletado")) {
                    itemActionsDiv.innerHTML += 
                        '<button class="btn btn-success me-2" id="btnMarcarComoRecuperado">Marcar como Recuperado/Devolvido</button>";
                }

                // Se o usuário logado é quem achou o item e ele ainda está com status "Achado"
                if (usuarioLogado.id === item.id_usuario_reportou && item.tipo_registro === "achado" && item.status === "Achado") {
                    itemActionsDiv.innerHTML += 
                        '<button class="btn btn-info me-2" id="btnEntregarPontoColeta">Entregar a um Ponto de Coleta</button>";
                }

                // Se o usuário logado é um Ponto de Coleta e o item está "Coletado" neste ponto
                if (usuarioLogado.tipo === "ponto_coleta" && usuarioLogado.id === item.id_ponto_coleta && item.status === "Coletado") {
                    itemActionsDiv.innerHTML += 
                        '<button class="btn btn-primary me-2" id="btnValidarDevolucao">Validar Devolução ao Dono</button>";
                }
                
                // Permitir edição se for o dono do registro (simplificado)
                if (usuarioLogado.id === item.id_usuario_reportou || (usuarioLogado.tipo === "ponto_coleta" && usuarioLogado.id === item.id_ponto_coleta) ){
                     itemActionsDiv.innerHTML += 
                        '<button class="btn btn-warning" id="btnEditarItem">Editar Item</button>";
                }

                // Adicionar event listeners para os botões de ação
                document.getElementById("btnMarcarComoRecuperado")?.addEventListener("click", () => atualizarStatusItem(item.id, "Devolvido"));
                document.getElementById("btnEntregarPontoColeta")?.addEventListener("click", () => {
                    // Simular a seleção de um ponto de coleta e depois atualizar
                    // Aqui deveria abrir um modal ou select para escolher o ponto
                    const pontoId = prompt("Digite o ID do Ponto de Coleta para entrega (simulação):");
                    if (pontoId && !isNaN(pontoId)) {
                        atualizarStatusItem(item.id, "Coletado", parseInt(pontoId));
                    } else if (pontoId !== null) {
                        alert("ID do Ponto de Coleta inválido.");
                    }
                });
                document.getElementById("btnValidarDevolucao")?.addEventListener("click", () => atualizarStatusItem(item.id, "Devolvido"));
                document.getElementById("btnEditarItem")?.addEventListener("click", () => popularFormularioParaEdicao(item));
            }

        } else {
            tituloPaginaItem.textContent = "Item não encontrado";
            viewItemDetailsDiv.innerHTML = "<p class='text-danger'>O item que você está procurando não foi encontrado ou não existe.</p>";
        }
    }
    
    function popularFormularioParaEdicao(item) {
        viewItemDetailsDiv.style.display = "none";
        itemActionsDiv.style.display = "none";
        formItem.style.display = "block";
        tituloPaginaItem.textContent = `Editando: ${item.titulo}`;

        itemIdField.value = item.id;
        document.getElementById("itemTitulo").value = item.titulo;
        document.getElementById("itemDescricao").value = item.descricao;
        document.getElementById("itemDataOcorrencia").value = item.data_ocorrencia;
        document.getElementById("itemLocalOcorrencia").value = item.local_ocorrencia;
        document.getElementById("itemFotoUrl").value = item.foto_url || "";
        itemStatusSelect.value = item.status;

        if (item.status === "Coletado" && item.id_ponto_coleta) {
            pontoColetaSelectContainer.style.display = "block";
            carregarPontosColeta().then(() => {
                itemPontoColetaSelect.value = item.id_ponto_coleta;
            });
        } else {
            pontoColetaSelectContainer.style.display = "none";
        }
    }


    async function atualizarStatusItem(idItem, novoStatus, idPontoColeta = null) {
        const dadosAtualizacao = { status: novoStatus };
        if (idPontoColeta) {
            dadosAtualizacao.id_ponto_coleta = idPontoColeta;
        }

        const response = await fetch(`${API_URL}/itens/${idItem}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAtualizacao),
        });

        if (response.ok) {
            alert(`Status do item atualizado para ${novoStatus}!`);
            carregarItemParaEdicaoOuVisualizacao(); // Recarrega os detalhes
        } else {
            alert("Falha ao atualizar o status do item.");
        }
    }

    if (formItem) {
        formItem.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!usuarioLogado) {
                alert("Login necessário para esta ação.");
                return;
            }

            const id = itemIdField.value;
            const dadosItem = {
                titulo: document.getElementById("itemTitulo").value,
                descricao: document.getElementById("itemDescricao").value,
                data_ocorrencia: document.getElementById("itemDataOcorrencia").value,
                local_ocorrencia: document.getElementById("itemLocalOcorrencia").value,
                foto_url: document.getElementById("itemFotoUrl").value || "assets/images/item_placeholder.png",
                status: itemStatusSelect.value,
                id_usuario_reportou: usuarioLogado.id,
                tipo_registro: action || (itemStatusSelect.value === "Perdido" ? "perdido" : "achado"), // Define o tipo de registro
                id_ponto_coleta: null
            };

            if (dadosItem.status === "Coletado") {
                dadosItem.id_ponto_coleta = parseInt(itemPontoColetaSelect.value);
                if (!dadosItem.id_ponto_coleta) {
                    alert("Por favor, selecione um ponto de coleta.");
                    return;
                }
            }

            let resultado;
            let metodo = 'POST';
            let endpoint = 'itens';

            if (id) { // Editando item existente
                metodo = 'PUT';
                endpoint = `itens/${id}`;
            }

            try {
                const response = await fetch(`${API_URL}/${endpoint}`, {
                    method: metodo,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dadosItem),
                });
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                resultado = await response.json();

                if (resultado) {
                    alert(`Item ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
                    window.location.href = `item.html?id=${resultado.id}`;
                } else {
                    alert(`Falha ao ${id ? 'atualizar' : 'cadastrar'} o item.`);
                }
            } catch (error) {
                console.error(`Erro ao salvar item: ${error}`);
                alert(`Erro ao salvar item. Verifique o console.`);
            }
        });
    }

    // Carregar dados do item ou mostrar formulário de cadastro
    carregarItemParaEdicaoOuVisualizacao();

    // Atualiza o avatar e o menu dropdown do usuário na navbar (repetido de auth.js para garantir)
    const avatarUsuarioNav = document.getElementById("avatarUsuario");
    const navUserIconDropdown = document.querySelector(".navbar .dropdown:not(.navbar-nav .dropdown)");
    const navContaDropdown = document.querySelector(".navbar-nav .dropdown");

    if (usuarioLogado) {
        if (navContaDropdown) navContaDropdown.style.display = "none";
        if (navUserIconDropdown) navUserIconDropdown.style.display = "block";
        // Lógica de notificação (exemplo)
        const notificacaoPerfil = document.getElementById("notificacaoPerfil");
        // fetchNotifications(usuarioLogado.id).then(count => { if(count > 0 && notificacaoPerfil) { notificacaoPerfil.textContent = count; notificacaoPerfil.style.display = 'block'; } });
    } else {
        if (navContaDropdown) navContaDropdown.style.display = "block";
        if (navUserIconDropdown) navUserIconDropdown.style.display = "none";
        if (action) { // Se tentando cadastrar sem logar, redireciona
             // A verificação no topo já deve ter pego isso
        }
    }
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            alert("Logout realizado com sucesso!");
            window.location.href = "index.html";
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    // Elementos do formulário
    const formItem = document.getElementById("formItem");
    const itemId = document.getElementById("itemId");
    const itemTipoRegistro = document.getElementById("itemTipoRegistro");
    const itemTitulo = document.getElementById("itemTitulo");
    const itemCategoria = document.getElementById("itemCategoria");
    const itemTipo = document.getElementById("itemTipo");
    const itemTipoOutroContainer = document.getElementById("itemTipoOutroContainer");
    const itemTipoOutro = document.getElementById("itemTipoOutro");
    const itemDescricao = document.getElementById("itemDescricao");
    const itemDataOcorrencia = document.getElementById("itemDataOcorrencia");
    const itemLocalOcorrencia = document.getElementById("itemLocalOcorrencia");
    const itemFotoUrl = document.getElementById("itemFotoUrl"); // Campo oculto para URL existente
    const itemStatus = document.getElementById("itemStatus"); // Campo oculto ou display
    const itemPontoColeta = document.getElementById("itemPontoColeta");
    const pontoColetaSelectContainer = document.getElementById("pontoColetaSelectContainer");
    const btnSalvarItem = document.getElementById("btnSalvarItem");
    const loadingItem = document.getElementById("loadingItem");
    const viewItemDetails = document.getElementById("viewItemDetails");
    const itemActions = document.getElementById("itemActions");
    const tituloPaginaItem = document.getElementById("tituloPaginaItem");
    
    // Elementos para upload de arquivo
    const btnSelectFile = document.getElementById("btnSelectFile");
    const itemArquivo = document.getElementById("itemArquivo");
    const previewContainer = document.getElementById("previewContainer");
    const previewImage = document.getElementById("previewImage");
    const previewVideo = document.getElementById("previewVideo");
    
    // Variáveis globais
    let categorias = [];
    let pontosColeta = [];
    let arquivoSelecionado = null;
    let arquivoUrl = null; // Para preview e envio
    
    // Verificar se o usuário está logado usando a função centralizada
    // A função verificarLogin já redireciona se não estiver logado
    const usuarioVerificado = verificarLogin(); // Não especifica tipo, qualquer usuário logado pode ver/cadastrar
    
    // Inicializar data máxima (hoje)
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split("T")[0];
    if (itemDataOcorrencia) {
        itemDataOcorrencia.setAttribute("max", dataHoje);
    }
    
    // Inicializar formulário com base nos parâmetros da URL
    async function inicializarFormulario() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get("action");
        const id = urlParams.get("id");
        
        // Carregar categorias e pontos de coleta
        await Promise.all([
            carregarCategorias(),
            carregarPontosColeta()
        ]);
        
        if (id) {
            // Modo de visualização/edição de item existente
            await carregarItem(id);
        } else if (action) {
            // Modo de cadastro de novo item
            if (!usuarioVerificado) {
                // Se não estiver logado e tentando cadastrar, redireciona
                alert("Você precisa estar logado para cadastrar um item.");
                // Corrigido
                window.location.href = `pagina_login.html?redirect=${encodeURIComponent(window.location.href)}`; 
                return;
            }
            
            if (action === "perdido") {
                itemTipoRegistro.value = "perdido";
                tituloPaginaItem.textContent = "Registrar Item Perdido";
                document.title = "Registrar Item Perdido - Achados e Perdidos";
            } else if (action === "achado") {
                itemTipoRegistro.value = "achado";
                tituloPaginaItem.textContent = "Cadastrar Item Achado";
                document.title = "Cadastrar Item Achado - Achados e Perdidos";
            }
            
            // Mostrar formulário
            if (loadingItem) loadingItem.style.display = "none";
            if (formItem) formItem.style.display = "block";
        } else {
            // Redirecionar para a lista de itens se não houver ação ou ID
            window.location.href = "pagina_lista_itens.html"; // Corrigido
        }
    }
    
    // Carregar categorias (simulado)
    async function carregarCategorias() {
        try {
            categorias = [
                { id: 1, nome: "Documentos", tipos: ["RG", "CPF", "CNH", "Passaporte", "Carteira de Trabalho", "Outro"] },
                { id: 2, nome: "Eletrônicos", tipos: ["Celular", "Notebook", "Tablet", "Fone de Ouvido", "Carregador", "Outro"] },
                { id: 3, nome: "Acessórios", tipos: ["Óculos", "Relógio", "Bolsa", "Mochila", "Carteira", "Outro"] },
                { id: 4, nome: "Chaves", tipos: ["Chave de Casa", "Chave de Carro", "Chaveiro", "Outro"] },
                { id: 5, nome: "Outros", tipos: ["Outro"] }
            ];
            
            if (itemCategoria) {
                let options = 
                    '<option value="" disabled selected>Selecione uma categoria...</option>';
                categorias.forEach(categoria => {
                    options += `<option value="${categoria.id}">${categoria.nome}</option>`;
                });
                itemCategoria.innerHTML = options;
            }
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
        }
    }
    
    // Carregar pontos de coleta do JSON Server
    async function carregarPontosColeta() {
        try {
            // Usa a função fetchData centralizada
            pontosColeta = await fetchData("pontos_coleta"); 
            if (!pontosColeta) throw new Error("Falha ao buscar pontos de coleta");

            if (itemPontoColeta) {
                let options = 
                    '<option value="">Selecione um ponto de coleta (opcional)...</option>';
                pontosColeta.forEach(ponto => {
                    options += `<option value="${ponto.id}">${ponto.nome_estabelecimento || ponto.nome} - ${ponto.endereco}</option>`;
                });
                itemPontoColeta.innerHTML = options;
            }
        } catch (error) {
            console.error("Erro ao carregar pontos de coleta:", error);
        }
    }
    
    // Carregar item existente
    async function carregarItem(id) {
        try {
            // Usa a função fetchData centralizada
            const item = await fetchData(`itens/${id}`); 
            if (!item) throw new Error("Item não encontrado ou falha na busca");

            tituloPaginaItem.textContent = "Detalhes do Item";
            document.title = `${item.titulo || "Item"} - Achados e Perdidos`;
            
            // Verificar se o usuário logado pode editar
            let podeEditar = false;
            
            if (usuarioVerificado) {
                console.log("Verificando permissões de edição:");
                console.log("Usuário logado ID:", usuarioVerificado.id, "Tipo:", usuarioVerificado.tipo);
                console.log("Item ID do usuário que reportou:", item.id_usuario_reportou);
                console.log("Tipo de registro do item:", item.tipo_registro);
                
                // Regras de edição:
                // 1. Itens perdidos: podem ser editados pelo próprio usuário ou por pontos de coleta
                // 2. Itens achados: podem ser editados apenas pelo próprio usuário que fez a postagem
                
                if (item.tipo_registro === "perdido") {
                    // Itens perdidos podem ser editados pelo usuário que postou ou qualquer ponto de coleta
                    podeEditar = (String(usuarioVerificado.id) === String(item.id_usuario_reportou)) || 
                                 (usuarioVerificado.tipo === "ponto_coleta");
                } else if (item.tipo_registro === "achado") {
                    // Itens achados só podem ser editados pelo próprio usuário que postou
                    podeEditar = (String(usuarioVerificado.id) === String(item.id_usuario_reportou));
                }
                
                console.log("Pode editar:", podeEditar);
            }
            
            if (podeEditar) {
                // Preencher formulário para edição
                itemId.value = item.id;
                itemTipoRegistro.value = item.tipo_registro;
                itemTitulo.value = item.titulo;
                itemDescricao.value = item.descricao;
                itemDataOcorrencia.value = item.data_ocorrencia ? item.data_ocorrencia.split("T")[0] : "";
                itemLocalOcorrencia.value = item.local_ocorrencia;
                itemFotoUrl.value = item.foto_url || ""; // Guarda URL existente
                if (itemStatus) itemStatus.value = item.status; // Campo oculto ou display
                
                // Mostrar preview da imagem/vídeo existente
                if (item.foto_url) {
                    arquivoUrl = item.foto_url;
                    previewContainer.style.display = "block";
                    if (arquivoUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
                        previewImage.src = arquivoUrl;
                        previewImage.style.display = "block";
                        previewVideo.style.display = "none";
                    } else if (arquivoUrl.match(/\.(mp4|webm|ogg)$/i)) {
                        previewVideo.src = arquivoUrl;
                        previewVideo.style.display = "block";
                        previewImage.style.display = "none";
                    }
                }
                
                // Mostrar código do item se existir e o usuário tiver permissão para ver
                if (item.codigo_item && (String(usuarioVerificado.id) === String(item.id_usuario_reportou) || usuarioVerificado.tipo === "ponto_coleta")) {
                    const codigoItemContainer = document.getElementById("codigoItemContainer");
                    const itemCodigo = document.getElementById("itemCodigo");
                    if (codigoItemContainer && itemCodigo) {
                        itemCodigo.value = item.codigo_item;
                        codigoItemContainer.style.display = "block";
                    }
                }
                
                if (item.id_ponto_coleta) {
                    itemPontoColeta.value = item.id_ponto_coleta;
                    pontoColetaSelectContainer.style.display = "block";
                }
                
                if (item.categoria_id) {
                    itemCategoria.value = item.categoria_id;
                    carregarTiposCategoria(item.categoria_id, item.tipo);
                }
                
                loadingItem.style.display = "none";
                formItem.style.display = "block";
            } else {
                // Modo de visualização apenas
                loadingItem.style.display = "none";
                
                let categoriaNome = "Não especificada";
                let tipoNome = item.tipo || "Não especificado";
                const categoria = categorias.find(c => c.id == item.categoria_id);
                if (categoria) categoriaNome = categoria.nome;
                
                let pontoColetaNome = "Não entregue a ponto de coleta";
                if (item.id_ponto_coleta) {
                    const ponto = pontosColeta.find(p => p.id == item.id_ponto_coleta);
                    if (ponto) pontoColetaNome = `${ponto.nome_estabelecimento || ponto.nome} - ${ponto.endereco}`;
                    else pontoColetaNome = `Ponto ID ${item.id_ponto_coleta} (não encontrado)`;
                }
                
                const dataFormatada = item.data_ocorrencia ? new Date(item.data_ocorrencia).toLocaleDateString() : "Data não informada";
                
                let statusClass = "bg-secondary text-white";
                switch (item.status) {
                    case "Achado": statusClass = "bg-success text-white"; break;
                    case "Perdido": statusClass = "bg-danger text-white"; break;
                    case "Coletado": statusClass = "bg-info text-dark"; break;
                    case "Em análise": statusClass = "bg-warning text-dark"; break;
                    case "Devolvido": statusClass = "bg-primary text-white"; break;
                }
                
                viewItemDetails.innerHTML = `
                    <div class="text-center mb-4">
                        ${item.foto_url && item.foto_url.match(/\.(mp4|webm|ogg)$/i) ? 
                        `<video controls class="img-fluid rounded" style="max-height: 300px;"><source src="${item.foto_url}" type="video/mp4">Seu navegador não suporta vídeo.</video>` : 
                        `<img src="${item.foto_url || "assets/images/item_placeholder.png"}" 
                            class="img-fluid rounded" 
                            style="max-height: 300px;" 
                            alt="${item.titulo || "Item"}"
                            onerror="this.onerror=null; this.src=\'assets/images/item_placeholder.png\';">`}
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 class="mb-0">${item.titulo || "Sem título"}</h3>
                        <span class="badge ${statusClass} px-3 py-2 fs-6">${item.status || "Status indefinido"}</span>
                    </div>
                    
                    <div class="row mb-4 g-3">
                        <div class="col-md-6">
                            <p class="mb-1 text-muted small"><i class="bi bi-tag me-1"></i> Categoria</p>
                            <p class="fw-medium mb-0">${categoriaNome}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1 text-muted small"><i class="bi bi-bookmark me-1"></i> Tipo</p>
                            <p class="fw-medium mb-0">${tipoNome}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1 text-muted small"><i class="bi bi-calendar-event me-1"></i> Data da Ocorrência</p>
                            <p class="fw-medium mb-0">${dataFormatada}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1 text-muted small"><i class="bi bi-geo-alt me-1"></i> Local da Ocorrência</p>
                            <p class="fw-medium mb-0">${item.local_ocorrencia || "Não informado"}</p>
                        </div>
                        <div class="col-12">
                            <p class="mb-1 text-muted small"><i class="bi bi-shop me-1"></i> Ponto de Coleta</p>
                            <p class="fw-medium mb-0">${pontoColetaNome}</p>
                        </div>
                        ${(item.codigo_item && (String(usuarioVerificado.id) === String(item.id_usuario_reportou) || usuarioVerificado.tipo === "ponto_coleta")) ? 
                        `<div class="col-md-6">
                            <p class="mb-1 text-muted small"><i class="bi bi-qr-code me-1"></i> Código do Item</p>
                            <p class="fw-medium mb-0 text-primary">${item.codigo_item}</p>
                        </div>` : ''}
                        <div class="col-12">
                            <p class="mb-1 text-muted small"><i class="bi bi-card-text me-1"></i> Descrição</p>
                            <p class="fw-medium mb-0">${item.descricao || "Sem descrição"}</p>
                        </div>
                    </div>
                `;
                
                // Mostrar ações disponíveis
                if (usuarioVerificado) {
                    let acoesHTML = "";
                    
                    console.log("Verificando ações disponíveis:");
                    console.log("Usuário logado ID:", usuarioVerificado.id, "Tipo:", usuarioVerificado.tipo);
                    console.log("Item ID do usuário que reportou:", item.id_usuario_reportou);
                    console.log("Tipo de registro do item:", item.tipo_registro);
                    console.log("Status do item:", item.status);
                    
                    // Ações para itens perdidos
                    if (item.tipo_registro === "perdido" && item.status === "Perdido" && String(usuarioVerificado.id) === String(item.id_usuario_reportou)) {
                        acoesHTML += `<button class="btn btn-success" id="btnMarcarEncontrado"><i class="bi bi-check-circle-fill me-1"></i>Marcar como Encontrado</button>`;
                    }
                    
                    // Ações para itens achados - apenas o próprio usuário pode excluir
                    if (item.tipo_registro === "achado" && String(usuarioVerificado.id) === String(item.id_usuario_reportou)) {
                        console.log("Usuário é o proprietário do item achado - adicionando ações");
                        if (item.status === "Achado") {
                            acoesHTML += `<button class="btn btn-primary" id="btnEntregarPontoColeta"><i class="bi bi-shop me-1"></i>Entregar a Ponto de Coleta</button>`;
                        }
                        acoesHTML += `<button class="btn btn-danger ms-2" id="btnExcluirItem"><i class="bi bi-trash-fill me-1"></i>Excluir Postagem</button>`;
                    }
                    
                    // Ações para pontos de coleta
                    if (usuarioVerificado.tipo === "ponto_coleta" && String(item.id_ponto_coleta) === String(usuarioVerificado.id) && (item.status === "Coletado" || item.status === "Em análise")) {
                        acoesHTML += `<button class="btn btn-success" id="btnValidarDevolucao"><i class="bi bi-check-circle-fill me-1"></i>Validar Devolução</button>`;
                    }
                    
                    console.log("HTML das ações:", acoesHTML);
                    
                    if (acoesHTML) {
                        itemActions.innerHTML = `
                            <h4 class="mb-3">Ações Disponíveis</h4>
                            <div class="d-flex gap-2 flex-wrap">
                                ${acoesHTML}
                            </div>
                        `;
                        itemActions.style.display = "block";
                        
                        // Adicionar event listeners
                        const btnMarcarEncontrado = document.getElementById("btnMarcarEncontrado");
                        if (btnMarcarEncontrado) btnMarcarEncontrado.addEventListener("click", () => marcarItemComoEncontrado(item.id));
                        
                        const btnEntregarPontoColeta = document.getElementById("btnEntregarPontoColeta");
                        if (btnEntregarPontoColeta) btnEntregarPontoColeta.addEventListener("click", () => mostrarDialogoPontosColeta(item.id));
                        
                        const btnExcluirItem = document.getElementById("btnExcluirItem");
                        if (btnExcluirItem) btnExcluirItem.addEventListener("click", () => excluirItem(item.id));
                        
                        const btnValidarDevolucao = document.getElementById("btnValidarDevolucao");
                        if (btnValidarDevolucao) btnValidarDevolucao.addEventListener("click", () => validarDevolucao(item.id));
                    }
                }
                
                viewItemDetails.style.display = "block";
            }
        } catch (error) {
            console.error("Erro ao carregar item:", error);
            loadingItem.innerHTML = 
                `<p class="text-danger text-center">Não foi possível carregar os detalhes do item. ${error.message}</p>`;
            loadingItem.style.display = "block";
        }
    }
    
    // Carregar tipos com base na categoria selecionada
    function carregarTiposCategoria(categoriaId, tipoSelecionado = null) {
        if (!itemTipo) return;
        
        const categoria = categorias.find(c => c.id == categoriaId);
        if (!categoria) return;
        
        let options = 
            '<option value="" disabled selected>Selecione um tipo...</option>';
        categoria.tipos.forEach(tipo => {
            const selected = tipo === tipoSelecionado ? "selected" : "";
            options += `<option value="${tipo}" ${selected}>${tipo}</option>`;
        });
        
        itemTipo.innerHTML = options;
        itemTipo.disabled = false;
        
        if (tipoSelecionado === "Outro") {
            itemTipoOutroContainer.style.display = "block";
        } else {
            itemTipoOutroContainer.style.display = "none";
        }
    }
    
    // Event listeners
    if (itemCategoria) {
        itemCategoria.addEventListener("change", () => {
            const categoriaId = itemCategoria.value;
            carregarTiposCategoria(categoriaId);
        });
    }
    
    if (itemTipo) {
        itemTipo.addEventListener("change", () => {
            itemTipoOutroContainer.style.display = itemTipo.value === "Outro" ? "block" : "none";
        });
    }
    
    // Validação de data
    if (itemDataOcorrencia) {
        itemDataOcorrencia.addEventListener("change", () => {
            const dataOcorrencia = new Date(itemDataOcorrencia.value);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            if (dataOcorrencia > hoje) {
                alert("A data da ocorrência não pode ser futura.");
                itemDataOcorrencia.value = dataHoje;
            }
        });
    }
    
    // Upload de arquivo
    if (btnSelectFile) {
        btnSelectFile.addEventListener("click", () => {
            itemArquivo.click();
        });
    }
    
    if (itemArquivo) {
        itemArquivo.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                arquivoSelecionado = file; // Guarda o File object para upload futuro (não implementado aqui)
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    arquivoUrl = event.target.result; // Guarda Data URL para preview e salvar no JSON
                    
                    previewContainer.style.display = "block";
                    if (file.type.startsWith("image/")) {
                        previewImage.src = arquivoUrl;
                        previewImage.style.display = "block";
                        previewVideo.style.display = "none";
                    } else if (file.type.startsWith("video/")) {
                        previewVideo.src = arquivoUrl;
                        previewVideo.style.display = "block";
                        previewImage.style.display = "none";
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Salvar item
    if (formItem) {
        formItem.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (!usuarioVerificado) {
                alert("Sessão expirada ou inválida. Faça login novamente.");
                // Corrigido
                window.location.href = `pagina_login.html?redirect=${encodeURIComponent(window.location.href)}`; 
                return;
            }
            
            const dataOcorrencia = new Date(itemDataOcorrencia.value);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            if (dataOcorrencia > hoje) {
                alert("A data da ocorrência não pode ser futura.");
                return;
            }
            
            const spinner = btnSalvarItem.querySelector(".spinner-border");
            spinner.style.display = "inline-block";
            btnSalvarItem.disabled = true;
            
            try {
                let statusAutomatico;
                if (itemTipoRegistro.value === "perdido") {
                    statusAutomatico = "Perdido";
                } else if (itemTipoRegistro.value === "achado") {
                    statusAutomatico = "Achado";
                }
                
                const dadosItem = {
                    titulo: itemTitulo.value,
                    descricao: itemDescricao.value,
                    categoria_id: itemCategoria.value,
                    tipo: itemTipo.value === "Outro" ? itemTipoOutro.value : itemTipo.value,
                    data_ocorrencia: itemDataOcorrencia.value,
                    local_ocorrencia: itemLocalOcorrencia.value,
                    // Usa a URL do preview (Data URL) ou a URL existente
                    foto_url: arquivoUrl || itemFotoUrl.value || null, 
                    tipo_registro: itemTipoRegistro.value,
                    // Usa o status automático ou o status existente se estiver editando
                    status: itemId.value ? (itemStatus ? itemStatus.value : statusAutomatico) : statusAutomatico, 
                    id_usuario_reportou: usuarioVerificado.id,
                    data_registro: itemId.value ? undefined : new Date().toISOString(), // Não atualiza data de registro
                    data_atualizacao: new Date().toISOString() // Sempre atualiza
                };
                
                // Gerar código único para novos itens
                if (!itemId.value) {
                    if (typeof gerarCodigoUnico === 'function') {
                        dadosItem.codigo_item = await gerarCodigoUnico();
                        console.log("Código gerado para o item:", dadosItem.codigo_item);
                    } else {
                        console.warn("Função gerarCodigoUnico não disponível");
                    }
                }
                
                // Adicionar relacionamento com ponto de coleta se for um ponto de coleta cadastrando
                if (usuarioVerificado.tipo === "ponto_coleta") {
                    dadosItem.id_ponto_coleta = usuarioVerificado.id;
                    // Se for um ponto de coleta cadastrando um item achado, marcar como coletado
                    if (itemTipoRegistro.value === "achado") {
                        dadosItem.status = "Coletado";
                    }
                } else if (itemPontoColeta && itemPontoColeta.value) {
                    // Se um usuário comum selecionou um ponto de coleta
                    dadosItem.id_ponto_coleta = itemPontoColeta.value;
                    if (itemTipoRegistro.value === "achado") {
                        dadosItem.status = "Coletado";
                    }
                }

                let itemSalvo;
                if (itemId.value) {
                    // Atualizar item existente (PATCH)
                    itemSalvo = await patchData(`itens/${itemId.value}`, dadosItem);
                } else {
                    // Criar novo item (POST)
                    itemSalvo = await postData("itens", dadosItem);
                }
                
                if (!itemSalvo) {
                    throw new Error("Falha ao salvar o item no servidor.");
                }
                
                alert(itemId.value ? "Item atualizado com sucesso!" : "Item cadastrado com sucesso!");
                
                // Redirecionar para a lista de itens após cadastro/edição
                window.location.href = "pagina_lista_itens.html"; 
            } catch (error) {
                console.error("Erro ao salvar item:", error);
                alert(`Ocorreu um erro ao salvar o item: ${error.message}`);
            } finally {
                spinner.style.display = "none";
                btnSalvarItem.disabled = false;
            }
        });
    }
    
    // Funções para ações de itens
    async function marcarItemComoEncontrado(itemId) {
        const result = await patchData(`itens/${itemId}`, {
            status: "Achado",
            data_atualizacao: new Date().toISOString()
        });
        if (result) {
            alert("Item marcado como encontrado com sucesso!");
            window.location.reload();
        } else {
            alert("Ocorreu um erro ao atualizar o status do item.");
        }
    }
    
    async function mostrarDialogoPontosColeta(itemId) {
        // Cria um select dinâmico para escolher o ponto
        let selectHTML = 
            `<select id="selectPontoColetaDialog" class="form-select mb-3">
                <option value="" disabled selected>Selecione um ponto de coleta...</option>`;
        pontosColeta.forEach(ponto => {
            selectHTML += `<option value="${ponto.id}">${ponto.nome_estabelecimento || ponto.nome}</option>`;
        });
        selectHTML += `</select>`;
        
        // Usar um modal Bootstrap seria melhor, mas prompt para simplificar
        const pontoId = prompt(`Selecione o ponto de coleta para entregar o item:\n${pontosColeta.map(p => `${p.id}: ${p.nome_estabelecimento || p.nome}`).join("\n")}`);
        
        if (pontoId && pontosColeta.find(p => p.id == pontoId)) {
            const result = await patchData(`itens/${itemId}`, {
                id_ponto_coleta: pontoId,
                status: "Coletado",
                data_atualizacao: new Date().toISOString()
            });
            if (result) {
                alert("Item entregue ao ponto de coleta com sucesso!");
                window.location.reload();
            } else {
                alert("Ocorreu um erro ao entregar o item.");
            }
        } else if (pontoId) {
            alert("ID do ponto de coleta inválido.");
        }
    }
    
    async function validarDevolucao(itemId) {
        const result = await patchData(`itens/${itemId}`, {
            status: "Devolvido",
            data_atualizacao: new Date().toISOString()
        });
        if (result) {
            alert("Devolução validada com sucesso!");
            window.location.reload();
        } else {
            alert("Ocorreu um erro ao validar a devolução.");
        }
    }
    
    // Função para excluir item (apenas para itens achados pelo próprio usuário)
    async function excluirItem(itemId) {
        if (confirm("Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.")) {
            try {
                const response = await fetch(`http://localhost:3000/itens/${itemId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert("Postagem excluída com sucesso!");
                    window.location.href = "pagina_lista_itens.html";
                } else {
                    throw new Error("Falha ao excluir item");
                }
            } catch (error) {
                console.error("Erro ao excluir item:", error);
                alert("Ocorreu um erro ao excluir a postagem. Tente novamente.");
            }
        }
    }
    
    // Inicializar
    inicializarFormulario();
});


document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const conteudoPerfil = document.getElementById("conteudoPerfil");
    const acoesUsuario = document.getElementById("acoesUsuario");
    const meusItensDiv = document.getElementById("meusItens");
    const tituloMeusItens = document.getElementById("tituloMeusItens");
    const loadingPerfil = document.getElementById("loadingPerfil");
    const notificacaoPerfil = document.getElementById("notificacaoPerfil");

    if (!usuarioLogado) {
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = "login.html";
        return;
    }

    if (loadingPerfil) loadingPerfil.style.display = 'none';

    function carregarInformacoesPerfil() {
        if (!conteudoPerfil) return;
        conteudoPerfil.innerHTML = `
            <p><strong>Nome:</strong> ${usuarioLogado.nome}</p>
            <p><strong>Email:</strong> ${usuarioLogado.email}</p>
            <p><strong>Tipo de Conta:</strong> ${usuarioLogado.tipo === 'comum' ? 'Usuário Comum' : 'Ponto de Coleta'}</p>
        `;
        if (usuarioLogado.tipo === 'ponto_coleta') {
            conteudoPerfil.innerHTML += `
                <p><strong>Endereço:</strong> ${usuarioLogado.endereco}</p>
                <p><strong>Horário de Funcionamento:</strong> ${usuarioLogado.horario_funcionamento}</p>
            `;
        }
    }

    function carregarAcoesUsuario() {
        if (!acoesUsuario) return;
        if (usuarioLogado.tipo === 'comum') {
            acoesUsuario.innerHTML = `
                <a href="item.html?action=perdido" class="btn btn-danger me-2">Registrar Item Perdido</a>
                <a href="item.html?action=achado" class="btn btn-success">Cadastrar Item Achado</a>
            `;
        } else if (usuarioLogado.tipo === 'ponto_coleta') {
            acoesUsuario.innerHTML = `
                <p>Como ponto de coleta, você pode validar itens entregues e visualizar os itens sob sua custódia.</p>
                <a href="lista-itens.html?filtro=coletados_ponto&pontoId=${usuarioLogado.id}" class="btn btn-info">Ver Itens no Ponto de Coleta</a>
                <!-- Futuramente: Botão para validar devoluções -->
            `;
        }
    }

    async function carregarMeusItens() {
        if (!meusItensDiv || !tituloMeusItens) return;
        meusItensDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando itens...</span></div>';
        
        const todosItens = await fetchData('itens');
        let itensFiltrados = [];

        if (usuarioLogado.tipo === 'comum') {
            tituloMeusItens.textContent = "Meus Itens Registrados";
            if (todosItens) {
                itensFiltrados = todosItens.filter(item => item.id_usuario_reportou === usuarioLogado.id);
            }
        } else if (usuarioLogado.tipo === 'ponto_coleta') {
            tituloMeusItens.textContent = "Itens no Meu Ponto de Coleta";
            if (todosItens) {
                itensFiltrados = todosItens.filter(item => item.id_ponto_coleta === usuarioLogado.id && item.status === 'Coletado');
            }
        }

        if (!todosItens) {
            meusItensDiv.innerHTML = '<p class="text-danger">Não foi possível carregar os itens. Verifique sua conexão ou o servidor JSON.</p>';
            return;
        }

        if (itensFiltrados.length === 0) {
            meusItensDiv.innerHTML = '<p>Nenhum item encontrado para exibir.</p>';
            return;
        }

        let htmlItens = '<ul class="list-group">';
        itensFiltrados.forEach(item => {
            htmlItens += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <h5><a href="item.html?id=${item.id}">${item.titulo}</a></h5>
                        <p class="mb-1">Status: <span class="badge bg-${item.status === 'Perdido' ? 'warning' : (item.status === 'Achado' ? 'success' : 'info')} text-dark">${item.status}</span></p>
                        <small>Local: ${item.local_ocorrencia} | Data: ${new Date(item.data_ocorrencia).toLocaleDateString()}</small>
                    </div>
                    <a href="item.html?id=${item.id}" class="btn btn-sm btn-outline-primary">Ver Detalhes</a>
                </li>
            `;
        });
        htmlItens += '</ul>';
        meusItensDiv.innerHTML = htmlItens;

        // Simulação de notificação para usuário comum se um item "Perdido" dele for "Achado" ou "Coletado"
        if (usuarioLogado.tipo === 'comum' && notificacaoPerfil) {
            const itensPerdidosPeloUsuario = itensFiltrados.filter(item => item.tipo_registro === 'perdido' && item.status !== 'Perdido');
            if (itensPerdidosPeloUsuario.length > 0) {
                notificacaoPerfil.style.display = 'block';
                notificacaoPerfil.textContent = itensPerdidosPeloUsuario.length;
                // Aqui poderia ter uma lógica mais elaborada para marcar notificações como lidas.
            }
        }
    }

    // Inicializar carregamento das informações
    carregarInformacoesPerfil();
    carregarAcoesUsuario();
    carregarMeusItens();

    // Logout (já definido em auth.js, mas garantindo que o botão funcione se auth.js não for carregado a tempo ou tiver algum problema)
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            alert("Logout realizado com sucesso!");
            window.location.href = "index.html";
        });
    }
});


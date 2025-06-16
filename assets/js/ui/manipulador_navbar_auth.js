// Lida com a exibição dinâmica dos links de autenticação na navbar
// Utiliza sessionStorage e funções de api_helpers.js

console.log("Script manipulador_navbar_auth.js carregado");

document.addEventListener("DOMContentLoaded", function() {
    const userProfileDropdownContainer = document.getElementById("userProfileDropdownContainer");
    if (!userProfileDropdownContainer) {
        console.warn("Container do dropdown de perfil não encontrado.");
        return;
    }

    // Elementos da Navbar
    const linkMeuPerfil = document.getElementById("linkMeuPerfil");
    const linkEntrar = document.getElementById("linkEntrar");
    const linkCriarConta = document.getElementById("linkCriarConta");
    const linkConfiguracoes = document.getElementById("linkConfiguracoes"); // Manter oculto por enquanto
    const dividerLogout = document.getElementById("dividerLogout");
    const logoutButton = document.getElementById("logoutButton");
    const avatarUsuario = document.getElementById("avatarUsuario");
    const notificacaoPerfil = document.getElementById("notificacaoPerfil"); // Manter oculto por enquanto

    // Verificar usuário logado usando a função helper (que usa sessionStorage)
    const usuarioLogado = getUsuarioLogado(); // Função de api_helpers.js

    if (usuarioLogado) {
        console.log("Usuário logado detectado na navbar:", usuarioLogado.email);
        // Usuário está logado
        if(linkMeuPerfil) {
            linkMeuPerfil.style.display = "block";
            // Ajustar o link do perfil com base no tipo de usuário
            linkMeuPerfil.href = usuarioLogado.tipo === 'ponto_coleta' ? 'pagina_perfil_ponto_coleta.html' : 'pagina_perfil_usuario.html';
        }
        // if(linkConfiguracoes) linkConfiguracoes.style.display = "block"; // Manter oculto
        if(dividerLogout) dividerLogout.style.display = "block";
        if(logoutButton) logoutButton.style.display = "block";
        
        // Ocultar links de login/cadastro
        if(linkEntrar) linkEntrar.style.display = "none";
        if(linkCriarConta) linkCriarConta.style.display = "none";

        // Atualizar avatar
        if (avatarUsuario) {
            // Priorizar foto específica do tipo de usuário
            let avatarSrc = "assets/images/avatarPadrão.png"; // Padrão
            if (usuarioLogado.tipo === 'ponto_coleta' && usuarioLogado.foto_estabelecimento) {
                avatarSrc = usuarioLogado.foto_estabelecimento;
            } else if (usuarioLogado.tipo === 'usuario' && usuarioLogado.avatar) {
                avatarSrc = usuarioLogado.avatar;
            } // Senão, mantém o padrão
            avatarUsuario.src = avatarSrc;
             avatarUsuario.onerror = () => { avatarUsuario.src = 'assets/images/avatarPadrão.png'; }; // Fallback
        }

        // Lógica de notificação (manter oculta por enquanto)
        // if (notificacaoPerfil) notificacaoPerfil.style.display = "none"; 

    } else {
        console.log("Nenhum usuário logado detectado na navbar.");
        // Usuário não está logado
        if(linkMeuPerfil) linkMeuPerfil.style.display = "none";
        // if(linkConfiguracoes) linkConfiguracoes.style.display = "none";
        if(dividerLogout) dividerLogout.style.display = "none";
        if(logoutButton) logoutButton.style.display = "none";
        // if(notificacaoPerfil) notificacaoPerfil.style.display = "none";

        // Mostrar links de login/cadastro
        if(linkEntrar) linkEntrar.style.display = "block";
        if(linkCriarConta) linkCriarConta.style.display = "block";
        
        // Usar avatar padrão para não logado
        if (avatarUsuario) {
            avatarUsuario.src = "assets/images/avatarPadrão.png";
        }
    }

    // Adicionar listener para o botão de logout
    if (logoutButton) {
        logoutButton.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("Botão de logout clicado.");
            logoutUsuario(); // Chama a função de logout de api_helpers.js
            alert("Logout realizado com sucesso!");
            window.location.href = "pagina_inicial.html"; // Redireciona para a home após logout
        });
    }
});

console.log("Script manipulador_navbar_auth.js executado até o final.");


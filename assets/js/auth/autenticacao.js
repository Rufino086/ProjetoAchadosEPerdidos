// Script de autenticação para o sistema Achados e Perdidos

console.log("Script autenticacao.js carregado");

// Função assíncrona para lidar com o login
async function handleLogin(event, tipoUsuario) {
    event.preventDefault(); // Impedir o envio padrão do formulário
    console.log(`Tentativa de login para: ${tipoUsuario}`);

    const emailInputId = tipoUsuario === 'usuario' ? 'emailLoginUsuario' : 'emailLoginColeta';
    const senhaInputId = tipoUsuario === 'usuario' ? 'senhaLoginUsuario' : 'senhaLoginColeta';
    const formId = tipoUsuario === 'usuario' ? 'loginFormUsuario' : 'loginFormPontoColeta';

    const emailInput = document.getElementById(emailInputId);
    const senhaInput = document.getElementById(senhaInputId);
    const form = document.getElementById(formId);
    const submitButton = form.querySelector('button[type="submit"]');

    if (!emailInput || !senhaInput || !form || !submitButton) {
        console.error("Erro: Elementos do formulário não encontrados para", tipoUsuario);
        alert("Erro interno no formulário de login. Tente recarregar a página.");
        return;
    }

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
        alert("Por favor, preencha o email e a senha.");
        return;
    }

    // Desabilitar botão e mostrar spinner (opcional)
    submitButton.disabled = true;
    // Adicionar lógica de spinner se necessário

    try {
        const endpoint = tipoUsuario === 'usuario' ? 'usuarios' : 'pontos_coleta';
        const response = await fetch(`http://localhost:3000/${endpoint}?email=${encodeURIComponent(email)}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const users = await response.json();

        if (users.length === 0) {
            alert("Email não encontrado.");
            submitButton.disabled = false;
            return;
        }

        const user = users[0]; // Pega o primeiro usuário com o email correspondente

        // Verificar a senha (IMPORTANTE: Em um sistema real, use hashing!)
        if (user.senha === senha) {
            console.log("Login bem-sucedido para:", user.email);
            
            // Armazenar dados do usuário na sessionStorage para evitar login automático
            sessionStorage.setItem('usuarioLogado', JSON.stringify(user));
            sessionStorage.setItem('sessionTimestamp', new Date().getTime().toString()); // Adicionado para registrar o início da sessão
            
            // Redirecionar para a página de perfil apropriada
            const redirectUrl = tipoUsuario === 'usuario' ? 'pagina_perfil_usuario.html' : 'pagina_perfil_ponto_coleta.html';
            window.location.href = redirectUrl;

        } else {
            alert("Senha incorreta.");
            submitButton.disabled = false;
        }

    } catch (error) {
        console.error("Erro durante o login:", error);
        alert("Erro ao tentar fazer login. Verifique sua conexão ou tente novamente mais tarde.");
        submitButton.disabled = false;
    }
}

// Adicionar listeners aos formulários quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM carregado, adicionando listeners de login.");

    const loginFormUsuario = document.getElementById("loginFormUsuario");
    const loginFormPontoColeta = document.getElementById("loginFormPontoColeta");

    if (loginFormUsuario) {
        console.log("Adicionando listener ao formulário de usuário comum.");
        loginFormUsuario.addEventListener("submit", (event) => handleLogin(event, 'usuario'));
    } else {
        console.warn("Formulário de login de usuário comum não encontrado.");
    }

    if (loginFormPontoColeta) {
        console.log("Adicionando listener ao formulário de ponto de coleta.");
        loginFormPontoColeta.addEventListener("submit", (event) => handleLogin(event, 'ponto_coleta'));
    } else {
        console.warn("Formulário de login de ponto de coleta não encontrado.");
    }
    
    // Limpar qualquer sessão antiga ao carregar a página de login
    // Isso garante que o usuário precise logar novamente
    sessionStorage.removeItem('usuarioLogado');
    console.log("Sessão anterior (se existente) removida do sessionStorage.");
});

console.log("Script autenticacao.js executado até o final.");


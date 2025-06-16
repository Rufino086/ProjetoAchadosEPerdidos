// Script de autenticação para o sistema Achados e Perdidos

console.log("Script autenticacao.js carregado");

// Aguarda o carregamento completo da página e da função sha256
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM carregado, verificando disponibilidade da função sha256...");
    
    // Verifica se a função sha256 está disponível
    if (typeof sha256 === 'undefined') {
        console.error("Função sha256 não encontrada! Verifique se hashing.js foi carregado.");
        return;
    }
    
    console.log("Função sha256 disponível, adicionando listeners de login.");

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
});

// Função assíncrona para lidar com o login
async function handleLogin(event, tipoUsuario) {
    event.preventDefault();
    console.log(`Tentativa de login para: ${tipoUsuario}`);

    const emailInputId = tipoUsuario === 'usuario' ? 'emailLoginUsuario' : 'emailLoginColeta';
    const senhaInputId = tipoUsuario === 'usuario' ? 'senhaLoginUsuario' : 'senhaLoginColeta';
    const formId = tipoUsuario === 'usuario' ? 'loginFormUsuario' : 'loginFormPontoColeta';

    const emailInput = document.getElementById(emailInputId);
    const senhaInput = document.getElementById(senhaInputId);
    const form = document.getElementById(formId);
    const submitButton = form.querySelector('button[type="submit"]');
    const errorMessageElement = form.querySelector('.error-message');

    // Função para exibir erro inline
    function displayError(message) {
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
            errorMessageElement.style.display = 'block';
        } else {
            console.error("Elemento de erro não encontrado:", message);
            alert(message); // Fallback para alert se não encontrar o elemento
        }
    }

    // Função para limpar erro inline
    function clearError() {
        if (errorMessageElement) {
            errorMessageElement.textContent = '';
            errorMessageElement.style.display = 'none';
        }
    }

    if (!emailInput || !senhaInput || !form || !submitButton) {
        console.error("Erro: Elementos do formulário não encontrados para", tipoUsuario);
        displayError("Erro interno no formulário de login. Tente recarregar a página.");
        return;
    }

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    clearError();

    if (!email || !senha) {
        displayError("Por favor, preencha o email e a senha.");
        return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        displayError("Por favor, insira um email válido.");
        return;
    }

    // Desabilitar botão durante o processamento
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = "Entrando...";

    try {
        // Verifica se a função sha256 está disponível
        if (typeof sha256 === 'undefined') {
            throw new Error("Função de hash não disponível. Recarregue a página.");
        }

        const endpoint = tipoUsuario === 'usuario' ? 'usuarios' : 'pontos_coleta';
        console.log(`Fazendo requisição para: http://localhost:3000/${endpoint}?email=${encodeURIComponent(email)}`);
        
        const response = await fetch(`http://localhost:3000/${endpoint}?email=${encodeURIComponent(email)}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const users = await response.json();
        console.log("Resposta do servidor:", users);

        if (users.length === 0) {
            displayError("Email não encontrado.");
            return;
        }

        // Encontra o usuário correto pelo email (pode haver múltiplos resultados)
        const user = users.find(u => u.email === email);
        if (!user) {
            displayError("Email não encontrado.");
            return;
        }

        console.log("Usuário encontrado:", user.email);
        console.log("Senha no banco:", user.senha);

        // Verifica se a senha no banco está hasheada (64 caracteres hex) ou em texto plano
        const senhaEstaHasheada = user.senha && user.senha.length === 64 && /^[a-f0-9]+$/i.test(user.senha);
        
        let senhaCorreta = false;

        if (senhaEstaHasheada) {
            // Senha no banco está hasheada, hasheia a senha fornecida para comparar
            console.log("Senha no banco está hasheada, hasheando senha fornecida...");
            const senhaHasheada = await sha256(senha);
            console.log("Senha hasheada:", senhaHasheada);
            senhaCorreta = (user.senha === senhaHasheada);
        } else {
            // Senha no banco está em texto plano, compara diretamente
            console.log("Senha no banco está em texto plano, comparando diretamente...");
            senhaCorreta = (user.senha === senha);
        }

        if (senhaCorreta) {
            console.log("Login bem-sucedido para:", user.email);
            
            // Armazena dados do usuário na sessionStorage
            sessionStorage.setItem('usuarioLogado', JSON.stringify(user));
            sessionStorage.setItem('sessionTimestamp', new Date().getTime().toString());
            
            // Redireciona para a página de perfil apropriada
            const redirectUrl = tipoUsuario === 'usuario' ? 'pagina_perfil_usuario.html' : 'pagina_perfil_ponto_coleta.html';
            console.log("Redirecionando para:", redirectUrl);
            window.location.href = redirectUrl;

        } else {
            console.log("Senha incorreta.");
            displayError("Senha incorreta.");
        }

    } catch (error) {
        console.error("Erro durante o login:", error);
        displayError("Erro ao tentar fazer login. Verifique sua conexão ou tente novamente.");
    } finally {
        // Reabilitar botão
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}


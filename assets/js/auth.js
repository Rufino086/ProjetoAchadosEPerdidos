// Lógica de autenticação e gerenciamento de sessão

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const cadastroForm = document.getElementById("cadastroForm");
    const tipoUsuarioSelect = document.getElementById("tipoUsuario");
    const camposPontoColeta = document.getElementById("camposPontoColeta");

    // Mostrar/ocultar campos de Ponto de Coleta no formulário de cadastro
    if (tipoUsuarioSelect && camposPontoColeta) {
        tipoUsuarioSelect.addEventListener("change", () => {
            if (tipoUsuarioSelect.value === "ponto_coleta") {
                camposPontoColeta.style.display = "block";
                document.getElementById("enderecoPontoColeta").required = true;
                document.getElementById("horarioPontoColeta").required = true;
            } else {
                camposPontoColeta.style.display = "none";
                document.getElementById("enderecoPontoColeta").required = false;
                document.getElementById("horarioPontoColeta").required = false;
            }
        });
    }

    // Lógica de Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("emailLogin").value;
            const senha = document.getElementById("senhaLogin").value;
            console.log("Tentativa de login com:", email);

            // Simulação de busca no JSON Server
            let usuarioEncontrado = null;
            const usuarios = await fetchData("usuarios");
            const pontosColeta = await fetchData("pontos_coleta");

            if (usuarios) {
                usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);
            }
            if (!usuarioEncontrado && pontosColeta) {
                usuarioEncontrado = pontosColeta.find(p => p.email === email && p.senha === senha);
            }

            if (usuarioEncontrado) {
                alert("Login bem-sucedido!");
                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));
                // Redirecionar para o perfil ou dashboard apropriado
                window.location.href = "perfil.html"; 
            } else {
                alert("Email ou senha incorretos.");
            }
        });
    }

    // Lógica de Cadastro
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const nome = document.getElementById("nomeCadastro").value;
            const email = document.getElementById("emailCadastro").value;
            const senha = document.getElementById("senhaCadastro").value;
            const confirmarSenha = document.getElementById("confirmarSenhaCadastro").value;
            const tipo = document.getElementById("tipoUsuario").value;

            if (senha !== confirmarSenha) {
                alert("As senhas não coincidem!");
                return;
            }

            let novoUsuario = {
                nome,
                email,
                senha,
                tipo
            };

            let endpoint = "usuarios";
            if (tipo === "ponto_coleta") {
                endpoint = "pontos_coleta";
                novoUsuario.endereco = document.getElementById("enderecoPontoColeta").value;
                novoUsuario.horario_funcionamento = document.getElementById("horarioPontoColeta").value;
            }
            
            // Verificar se o email já existe
            const usuariosExistentes = await fetchData("usuarios");
            const pontosColetaExistentes = await fetchData("pontos_coleta");
            let emailExiste = false;
            if(usuariosExistentes && usuariosExistentes.find(u => u.email === email)) emailExiste = true;
            if(!emailExiste && pontosColetaExistentes && pontosColetaExistentes.find(p => p.email === email)) emailExiste = true;

            if(emailExiste){
                alert("Este email já está cadastrado.");
                return;
            }

            const resultado = await postData(endpoint, novoUsuario);

            if (resultado) {
                alert("Cadastro realizado com sucesso! Faça o login.");
                window.location.href = "login.html";
            } else {
                alert("Erro ao realizar o cadastro. Tente novamente.");
            }
        });
    }

    // Lógica de Logout (exemplo, pode ser colocado em um botão no perfil)
    const logoutButton = document.getElementById("logoutButton"); // Supondo que exista um botão com este ID
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            alert("Logout realizado com sucesso!");
            window.location.href = "index.html";
        });
    }

    // Verificar se o usuário está logado e atualizar a UI
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const navContaDropdown = document.querySelector(".navbar-nav .dropdown");
    const navUserIconDropdown = document.querySelector(".navbar .dropdown:not(.navbar-nav .dropdown)"); // O segundo dropdown

    if (usuarioLogado) {
        if (navContaDropdown) {
            navContaDropdown.style.display = "none"; // Esconde "Conta > Entrar/Criar Conta"
        }
        if (navUserIconDropdown) {
            navUserIconDropdown.style.display = "block"; // Mostra o ícone do usuário
            const userNameElement = navUserIconDropdown.querySelector(".dropdown-menu .dropdown-item"); // Primeiro item geralmente é o nome/link do perfil
            // Idealmente, ter um elemento específico para o nome do usuário
        }        
    } else {
        if (navContaDropdown) {
            navContaDropdown.style.display = "block";
        }
        if (navUserIconDropdown) {
            navUserIconDropdown.style.display = "none";
        }
    }
});

// Funções auxiliares para API (já definidas em script.js, mas duplicadas aqui para contexto se este arquivo for isolado)
// Em um projeto real, importe-as ou garanta que script.js seja carregado antes.
async function fetchData(endpoint) {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha ao buscar dados de ${endpoint}:`, error);
        return null;
    }
}

async function postData(endpoint, data) {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha ao enviar dados para ${endpoint}:`, error);
        return null;
    }
}


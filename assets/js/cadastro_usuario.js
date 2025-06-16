// Script para cadastro de usuário comum
document.addEventListener("DOMContentLoaded", function() {
    console.log("Script de cadastro de usuário carregado");
    
    const cadastroForm = document.getElementById("cadastroForm");
    
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            console.log("Formulário de cadastro submetido");
            
            const nome = document.getElementById("nomeCadastro").value.trim();
            const email = document.getElementById("emailCadastro").value.trim();
            const cpf = document.getElementById("cpfCadastro").value.trim();
            const senha = document.getElementById("senhaCadastro").value;
            const confirmarSenha = document.getElementById("confirmarSenhaCadastro").value;
            const btnCadastrar = document.getElementById("btnCadastrar");
            const spinner = btnCadastrar.querySelector(".spinner-border");
            
            // Validações
            if (!nome || !email || !cpf || !senha || !confirmarSenha) {
                alert("Por favor, preencha todos os campos.");
                return;
            }
            
            if (senha !== confirmarSenha) {
                alert("As senhas não coincidem.");
                return;
            }
            
            if (senha.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres.");
                return;
            }
            
            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Por favor, insira um email válido.");
                return;
            }
            
            // Mostrar loading
            if (spinner) spinner.style.display = "inline-block";
            btnCadastrar.disabled = true;
            
            try {
                // Verifica se o email já existe
                console.log("Verificando se email já existe...");
                const usuariosExistentes = await fetchData("usuarios");
                if (usuariosExistentes && usuariosExistentes.some(user => user.email === email)) {
                    alert("Este email já está cadastrado. Tente fazer login ou use outro email.");
                    return;
                }
                
                // Verifica se a função sha256 está disponível
                if (typeof sha256 === 'undefined') {
                    console.error("Função sha256 não disponível!");
                    alert("Erro interno: função de hash não disponível. Recarregue a página.");
                    return;
                }
                
                // Hasheia a senha antes de salvar
                console.log("Hasheando senha...");
                const senhaHasheada = await sha256(senha);
                console.log("Senha hasheada com sucesso");

                // Cria objeto do usuário
                const novoUsuario = {
                    nome: nome,
                    email: email,
                    cpf: cpf,
                    senha: senhaHasheada,
                    tipo: "comum",
                    data_cadastro: new Date().toISOString(),
                    foto_perfil: null
                };
                
                console.log("Salvando usuário...");
                // Salva no db.json
                const resultado = await postData("usuarios", novoUsuario);
                
                if (resultado) {
                    alert("Cadastro realizado com sucesso! Você pode fazer login agora.");
                    window.location.href = "pagina_login.html";
                } else {
                    throw new Error("Falha ao salvar usuário no servidor");
                }
                
            } catch (error) {
                console.error("Erro no cadastro:", error);
                alert("Erro ao realizar cadastro. Verifique sua conexão e tente novamente.");
            } finally {
                if (spinner) spinner.style.display = "none";
                btnCadastrar.disabled = false;
            }
        });
    } else {
        console.warn("Formulário de cadastro não encontrado");
    }
});


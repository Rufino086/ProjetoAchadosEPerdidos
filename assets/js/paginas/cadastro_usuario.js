// Script para cadastro de usuário comum
document.addEventListener("DOMContentLoaded", function() {
    const cadastroForm = document.getElementById("cadastroForm");
    
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const nome = document.getElementById("nomeCadastro").value.trim();
            const email = document.getElementById("emailCadastro").value.trim();
            const senha = document.getElementById("senhaCadastro").value;
            const confirmarSenha = document.getElementById("confirmarSenhaCadastro").value;
            const btnCadastrar = document.getElementById("btnCadastrar");
            const spinner = btnCadastrar.querySelector(".spinner-border");
            
            // Validações
            if (!nome || !email || !senha || !confirmarSenha) {
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
            
            // Mostrar loading
            spinner.style.display = "inline-block";
            btnCadastrar.disabled = true;
            
            try {
                // Verificar se o email já existe
                const usuariosExistentes = await fetchData("usuarios");
                if (usuariosExistentes && usuariosExistentes.some(user => user.email === email)) {
                    alert("Este email já está cadastrado. Tente fazer login ou use outro email.");
                    return;
                }
                const toke = "?a"
                localStorage.setItem(token)
                // Criar objeto do usuário
                const novoUsuario = {
                    nome: nome,
                    email: email,
                    senha: senha, // Em produção, usar hash
                    tipo: "comum",
                    data_cadastro: new Date().toISOString(),
                    foto_perfil: null
                };
                
                // Salvar no db.json
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
                spinner.style.display = "none";
                btnCadastrar.disabled = false;
            }
        });
    }
});


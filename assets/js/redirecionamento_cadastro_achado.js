// Script para gerenciar o redirecionamento ao cadastrar item achado
document.addEventListener("DOMContentLoaded", () => {
    console.log("Script de redirecionamento carregado");
    
    // Verificar se há um usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    
    // Obter os botões de ação do perfil
    const btnCadastrarItem = document.querySelector('.action-btn.btn-cadastrar');
    
    if (btnCadastrarItem) {
        btnCadastrarItem.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Se o usuário estiver logado, redirecionar diretamente para a página de pontos de coleta
            if (usuarioLogado) {
                window.location.href = "pontos_de_coleta.html?action=achado";
            } else {
                // Se não estiver logado, redirecionar para o login com redirecionamento posterior
                window.location.href = "login.html?redirect=pontos_de_coleta.html?action=achado";
            }
        });
    }
    
    // Verificar se estamos na página de pontos de coleta
    if (window.location.pathname.includes('pontos_de_coleta.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        // Se for ação de item achado e o usuário estiver logado
        if (action === 'achado' && usuarioLogado) {
            // Verificar se o botão "Continuar" existe
            const btnContinuar = document.querySelector('.card-footer .btn-primary');
            
            if (btnContinuar) {
                // Atualizar o href para redirecionar diretamente para a página de cadastro
                btnContinuar.href = "item.html?action=achado";
            }
        }
    }
});

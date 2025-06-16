// Utilitário para geração de códigos únicos de itens
function gerarCodigoItem() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}

// Função para verificar se um código já existe no banco de dados
async function verificarCodigoExistente(codigo) {
    try {
        const itens = await fetchData("itens");
        if (!itens) return false;
        
        return itens.some(item => item.codigo_item === codigo);
    } catch (error) {
        console.error("Erro ao verificar código existente:", error);
        return false;
    }
}

// Função para gerar um código único (não duplicado)
async function gerarCodigoUnico() {
    let codigo;
    let tentativas = 0;
    const maxTentativas = 10;
    
    do {
        codigo = gerarCodigoItem();
        tentativas++;
        
        if (tentativas >= maxTentativas) {
            console.warn("Muitas tentativas para gerar código único. Usando código atual:", codigo);
            break;
        }
    } while (await verificarCodigoExistente(codigo));
    
    return codigo;
}

// Disponibilizar as funções globalmente
if (typeof window !== 'undefined') {
    window.gerarCodigoItem = gerarCodigoItem;
    window.verificarCodigoExistente = verificarCodigoExistente;
    window.gerarCodigoUnico = gerarCodigoUnico;
}


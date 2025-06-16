// Função de hashing SHA-256 para senhas
async function sha256(message) {
    // Codifica a mensagem como UTF-8
    const msgBuffer = new TextEncoder().encode(message);
    
    // Calcula o hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // Converte o buffer para array de bytes
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Converte bytes para string hexadecimal
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

// Verifica se a função está disponível globalmente
if (typeof window !== 'undefined') {
    window.sha256 = sha256;
}

console.log("Função sha256 carregada e disponível globalmente");


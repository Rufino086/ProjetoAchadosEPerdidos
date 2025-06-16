// Funções globais, interações com API e gerenciamento de sessão

// console.log("Script api_helpers.js carregado"); // Removido

const API_URL = 'http://localhost:3000'; // URL base do JSON Server
const SESSION_TIMEOUT_MINUTES = 30; // Tempo de expiração da sessão em minutos

/**
 * Busca dados de um endpoint da API.
 * @param {string} endpoint O endpoint da API (ex: 'usuarios', 'itens?id=1').
 * @returns {Promise<any>} Os dados da API ou null em caso de erro.
 */
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        if (!response.ok) {
            console.error(`Erro HTTP: ${response.status} ao buscar ${endpoint}`);
            return null; 
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha ao buscar dados de ${endpoint}:`, error);
        return null;
    }
}

/**
 * Envia dados para um endpoint da API via POST.
 * @param {string} endpoint O endpoint da API (ex: 'usuarios', 'itens').
 * @param {object} data O objeto de dados a ser enviado.
 * @returns {Promise<any>} A resposta da API ou null em caso de erro.
 */
async function postData(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
             console.error(`Erro HTTP: ${response.status} ao enviar para ${endpoint}`);
             try {
                 const errorBody = await response.json();
                 console.error("Detalhes do erro:", errorBody);
             } catch (e) { /* Ignora se não conseguir ler o corpo */ }
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha ao enviar dados para ${endpoint}:`, error);
        return null;
    }
}

/**
 * Atualiza dados em um endpoint da API via PATCH.
 * @param {string} endpoint O endpoint da API com ID (ex: 'itens/1').
 * @param {object} data O objeto com os dados a serem atualizados.
 * @returns {Promise<any>} A resposta da API ou null em caso de erro.
 */
async function patchData(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            console.error(`Erro HTTP: ${response.status} ao atualizar ${endpoint}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha ao atualizar dados em ${endpoint}:`, error);
        return null;
    }
}

/**
 * Deleta dados em um endpoint da API via DELETE.
 * @param {string} endpoint O endpoint da API com ID (ex: 'itens/1').
 * @returns {Promise<boolean>} True se bem-sucedido, false caso contrário.
 */
async function deleteData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
             console.error(`Erro HTTP: ${response.status} ao deletar ${endpoint}`);
            return false;
        }
        return true; // Retorna true para indicar sucesso
    } catch (error) {
        console.error(`Falha ao deletar dados em ${endpoint}:`, error);
        return false;
    }
}


// --- Gerenciamento de Sessão --- 

/**
 * Obtém os dados do usuário logado da sessionStorage.
 * @returns {object|null} Objeto do usuário ou null se não estiver logado ou a sessão expirou.
 */
function getUsuarioLogado() {
    const usuarioString = sessionStorage.getItem("usuarioLogado");
    const sessionTimestamp = sessionStorage.getItem("sessionTimestamp");
    // console.log(`DEBUG: getUsuarioLogado - Lendo sessionStorage: usuarioString=[${usuarioString}], sessionTimestamp=[${sessionTimestamp}]`); // Removido

    if (!usuarioString || !sessionTimestamp) {
        // console.log("Nenhum usuário logado na sessão."); // Removido
        return null;
    }

    const now = new Date().getTime();
    const sessionAgeMinutes = (now - parseInt(sessionTimestamp, 10)) / (1000 * 60);

    if (sessionAgeMinutes > SESSION_TIMEOUT_MINUTES) {
        // console.log("Sessão expirada."); // Removido
        sessionStorage.removeItem('usuarioLogado');
        sessionStorage.removeItem('sessionTimestamp');
        return null;
    }

    // Atualiza o timestamp para estender a sessão (atividade recente)
    sessionStorage.setItem('sessionTimestamp', now.toString()); 

    try {
        return JSON.parse(usuarioString);
    } catch (e) {
        console.error("Erro ao parsear dados do usuário da sessão:", e);
        sessionStorage.removeItem('usuarioLogado');
        sessionStorage.removeItem('sessionTimestamp');
        return null;
    }
}

/**
 * Verifica se o usuário está logado e redireciona para o login se não estiver.
 * Opcionalmente, verifica o tipo de usuário.
 * @param {string|null} requiredType O tipo de usuário requerido ("comum" ou "ponto_coleta") ou null para qualquer tipo.
 * @returns {object|null} O objeto do usuário logado se a verificação passar, ou null se não estiver logado ou o tipo for incorreto (neste caso, a função já trata o redirecionamento para login ou loga um aviso).
 */
function verificarLogin(requiredType = null) {
    const usuario = getUsuarioLogado();

    if (!usuario) {
        console.warn("Usuário não logado ou sessão expirada. Redirecionando para login.");
        const currentPath = window.location.pathname + window.location.search;
        // Redireciona para login se não houver usuário
        window.location.href = `pagina_login.html?redirect=${encodeURIComponent(currentPath)}`;
        return null;
    }

    // Verifica o tipo APENAS se requiredType for fornecido
    if (requiredType) {
        if (!usuario.tipo) {
            console.error("Erro crítico: Usuário logado não possui a propriedade 'tipo'.", usuario);
            // Considerar logout ou redirecionamento para erro?
            logoutUsuario(); // Força logout por segurança
            window.location.href = `pagina_login.html`;
            return null;
        }

        if (usuario.tipo !== requiredType) {
            // console.warn(`DEBUG: Permissão negada! Comparando usuario.tipo [${usuario.tipo}] com requiredType [${requiredType}]`); // Removido
            console.warn(`Permissão negada: Usuário logado é do tipo '${usuario.tipo}', mas a página requer tipo '${requiredType}'.`);
            // NÃO redireciona mais daqui para evitar loops. A página que chamou deve tratar isso.
            // Apenas retorna null para indicar falha na verificação de tipo.
            return null; 
        }
    }
    
    // Se chegou aqui, o usuário está logado e (se aplicável) tem o tipo correto.
    return usuario; 
}

/**
 * Realiza o logout do usuário, limpando a sessionStorage.
 */
function logoutUsuario() {
    sessionStorage.removeItem('usuarioLogado');
    sessionStorage.removeItem('sessionTimestamp');
    // console.log("Logout realizado, sessão limpa."); // Removido
}

// --- Inicializações Globais --- (se necessário)
// document.addEventListener('DOMContentLoaded', () => {
//     console.log("Documento carregado. Helpers prontos."); // Removido
// });

// console.log("Script api_helpers.js executado até o final."); // Removido
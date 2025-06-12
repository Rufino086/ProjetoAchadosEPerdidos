// api_helpers.js com suporte a testes simulados e melhorias sugeridas

const API_URL = 'http://localhost:3000';
const SESSION_TIMEOUT_MINUTES = 30;

// --- Funções de API ---
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

async function postData(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error(`Erro HTTP: ${response.status} ao enviar para ${endpoint}`);
            try {
                const errorBody = await response.clone().json();
                console.error("Detalhes do erro:", errorBody);
            } catch {
                const errorText = await response.text();
                console.error("Erro sem JSON:", errorText);
            }
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha ao enviar dados para ${endpoint}:`, error);
        return null;
    }
}

async function patchData(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
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

async function deleteData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            console.error(`Erro HTTP: ${response.status} ao deletar ${endpoint}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Falha ao deletar dados em ${endpoint}:`, error);
        return false;
    }
}

// --- Sessão ---
function isSessaoExpirada(timestamp) {
    const agora = Date.now();
    return ((agora - timestamp) / (1000 * 60)) > SESSION_TIMEOUT_MINUTES;
}

function getUsuarioLogado() {
    const usuarioString = sessionStorage.getItem("usuarioLogado");
    const sessionTimestamp = parseInt(sessionStorage.getItem("sessionTimestamp"), 10);
    if (!usuarioString || isNaN(sessionTimestamp)) return null;

    if (isSessaoExpirada(sessionTimestamp)) {
        sessionStorage.clear();
        return null;
    }

    sessionStorage.setItem('sessionTimestamp', Date.now().toString());
    try {
        return JSON.parse(usuarioString);
    } catch (e) {
        console.error("Erro ao parsear dados da sessão:", e);
        sessionStorage.clear();
        return null;
    }
}

function verificarLogin(requiredType = null) {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `pagina_login.html?redirect=${encodeURIComponent(currentPath)}`;
        return null;
    }

    if (requiredType && usuario.tipo !== requiredType) {
        console.warn(`Permissão negada: requerido '${requiredType}', encontrado '${usuario.tipo}'`);
        logoutUsuario();
        window.location.href = `pagina_login.html`;
        return null;
    }
    return usuario;
}

function logoutUsuario() {
    sessionStorage.clear();
}

function salvarUsuario(usuario, persistente = false) {
    const storage = persistente ? localStorage : sessionStorage;
    storage.setItem('usuarioLogado', JSON.stringify(usuario));
    storage.setItem('sessionTimestamp', Date.now().toString());
}

// --- Mock para testes ---
if (typeof window === 'undefined') {
    globalThis.sessionStorage = {
        storage: {},
        getItem(key) { return this.storage[key] || null; },
        setItem(key, val) { this.storage[key] = val; },
        removeItem(key) { delete this.storage[key]; },
        clear() { this.storage = {}; }
    };
    globalThis.localStorage = structuredClone(globalThis.sessionStorage);
    globalThis.window = { location: { href: '', pathname: '/', search: '' } };
}

// Exportações para testes
if (typeof module !== 'undefined') {
    module.exports = {
        fetchData,
        postData,
        patchData,
        deleteData,
        getUsuarioLogado,
        verificarLogin,
        logoutUsuario,
        salvarUsuario,
        isSessaoExpirada,
    };
}

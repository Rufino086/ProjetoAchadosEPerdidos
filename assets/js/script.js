// Funções globais e inicializações do JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log("Documento carregado e pronto!");

    // Exemplo de manipulação de DOM ou lógica inicial
    // Pode ser expandido conforme as funcionalidades são implementadas

    // Simulação de notificação (para demonstração)
    // const notificacaoPerfil = document.getElementById('notificacaoPerfil');
    // if (notificacaoPerfil) {
    //     // Lógica para mostrar notificação, por exemplo, se houver um item novo
    //     // setTimeout(() => {
    //     //     notificacaoPerfil.style.display = 'block';
    //     //     notificacaoPerfil.textContent = '1'; // Número de notificações
    //     // }, 3000);
    // }
});

// Funções para interagir com o JSON Server (serão implementadas depois)
const API_URL = 'http://localhost:3000'; // URL base do JSON Server

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
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
        const response = await fetch(`${API_URL}/${endpoint}`, {
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

// Outras funções auxiliares podem ser adicionadas aqui


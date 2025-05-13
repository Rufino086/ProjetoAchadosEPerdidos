# Projeto Achados e Perdidos

Este é um projeto de uma plataforma web de Achados e Perdidos desenvolvida com HTML, CSS, JavaScript e Bootstrap, utilizando JSON Server para simular o backend e a persistência de dados.

## Funcionalidades Principais

- Página inicial com apresentação do serviço.
- Sistema de login e cadastro para dois tipos de usuário: Comum e Ponto de Coleta.
- Área restrita para Usuário Comum: cadastrar item achado, registrar item perdido, acompanhar status.
- Área restrita para Ponto de Coleta: validar devoluções (simulado), ver lista de itens recebidos.
- Campos de item: título, descrição, data, local, foto (URL), status.
- Notificação visual simples para quando um item perdido por um usuário for encontrado/coletado.
- Estrutura modular de páginas: Home, Login, Cadastro, Perfil, Lista de Itens, Página do Item.
- Design responsivo para desktop e celular.
- Paleta de cores com gradiente: `#d4cece` (30%) e `#269744c9` (70%).

## Como Executar o Projeto Localmente

### Pré-requisitos

- Node.js e npm (para rodar o JSON Server).
- Um navegador web moderno.

### Passos para Execução

1.  **Descompactar o Projeto:**
    Extraia o arquivo `achados_e_perdidos_projeto.zip` em uma pasta de sua preferência.

2.  **Navegar até a Pasta do Projeto:**
    Abra o terminal ou prompt de comando e navegue até o diretório onde você descompactou o projeto (a pasta `achados_e_perdidos`).
    ```bash
    cd caminho/para/achados_e_perdidos
    ```

3.  **Instalar o JSON Server (se ainda não tiver globalmente):
    ```bash
    npm install -g json-server
    ```

4.  **Iniciar o JSON Server (Backend Simulado):**
    No terminal, dentro da pasta `achados_e_perdidos`, execute o comando abaixo para iniciar o servidor de dados. Ele usará o arquivo `db/db.json`.
    ```bash
    json-server --watch db/db.json --port 3000
    ```
    Mantenha este terminal aberto. O JSON Server estará rodando em `http://localhost:3000`.

5.  **Iniciar um Servidor HTTP Local (Frontend):**
    Abra **outro** terminal ou prompt de comando, navegue novamente até a pasta `achados_e_perdidos` e execute um dos seguintes comandos para servir os arquivos HTML:

    *   Se você tem Python 3 instalado:
        ```bash
        python3 -m http.server 8000
        ```
    *   Ou, se você tem o `http-server` do Node.js instalado (pode instalar com `npm install -g http-server`):
        ```bash
        http-server -p 8000
        ```
    Mantenha este segundo terminal aberto também.

6.  **Acessar a Aplicação no Navegador:**
    Abra seu navegador e acesse a seguinte URL:
    ```
    http://localhost:8000
    ```
    (Ou `http://localhost:8000/index.html`)

### Estrutura do Projeto

-   `index.html`: Página inicial.
-   `login.html`: Página de login.
-   `cadastro.html`: Página de cadastro de usuários.
-   `perfil.html`: Página de perfil do usuário logado.
-   `lista-itens.html`: Página para listar todos os itens cadastrados, com filtros.
-   `item.html`: Página para visualizar detalhes de um item ou cadastrar/editar um novo item.
-   `assets/`
    -   `css/style.css`: Folha de estilos principal.
    -   `js/`
        -   `script.js`: Scripts globais (atualmente com funções de API).
        -   `auth.js`: Lógica de autenticação (login, cadastro, sessão).
        -   `perfil.js`: Lógica da página de perfil.
        -   `lista-itens.js`: Lógica da página de listagem de itens.
        -   `item.js`: Lógica da página de detalhes/cadastro de item.
    -   `images/`: Imagens e ícones utilizados no projeto.
-   `db/db.json`: Arquivo de banco de dados inicial para o JSON Server.
-   `README.md`: Este arquivo de instruções.

### Dados Iniciais

O arquivo `db/db.json` contém alguns dados de exemplo:

-   **Usuários Comuns:**
    -   `joao.silva@email.com` / `senha123`
    -   `maria.oliveira@email.com` / `senha456`
-   **Pontos de Coleta:**
    -   `contato@padariapaoquente.com` / `padaria123`
    -   `biblioteca@cidade.gov.br` / `biblioteca456`

Sinta-se à vontade para explorar e testar a plataforma!


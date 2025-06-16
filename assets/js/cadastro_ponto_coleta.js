// Script para cadastro de ponto de coleta
document.addEventListener("DOMContentLoaded", function() {
    console.log("Script cadastro_ponto_coleta.js carregado");
    
    // Verificar se está em modo de edição
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    
    if (isEditMode) {
        // Carregar dados para edição
        const dadosEdicao = JSON.parse(sessionStorage.getItem("editandoPontoColeta"));
        if (dadosEdicao) {
            preencherFormularioEdicao(dadosEdicao);
            // Alterar título da página
            const titulo = document.querySelector("h1.card-title");
            if (titulo) titulo.textContent = "Editar Perfil do Ponto de Coleta";
            
            // Alterar texto do botão
            const btnSalvar = document.getElementById("btnSalvarPontoColeta");
            if (btnSalvar) btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style="display: none;"></span>Atualizar Dados';
        }
    }
    
    const formPontoColeta = document.getElementById("formPontoColeta");
    const senhaInput = document.getElementById("senhaPontoColeta");
    const confirmarSenhaInput = document.getElementById("confirmarSenhaPontoColeta");
    const senhaFeedback = document.getElementById("senhaFeedback");
    
    // Função para exibir erro inline
    function displayFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            let errorElement = field.parentElement.querySelector('.field-error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error text-danger small mt-1';
                field.parentElement.appendChild(errorElement);
            }
            errorElement.textContent = message;
            field.classList.add('is-invalid');
        }
    }

    // Função para limpar erro inline
    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            const errorElement = field.parentElement.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
            field.classList.remove('is-invalid');
        }
    }

    // Função para limpar todos os erros
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.field-error');
        errorElements.forEach(el => el.remove());
        const invalidFields = document.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => field.classList.remove('is-invalid'));
    }
    
    // Função para validar se as senhas coincidem
    function validarSenhas() {
        if (!senhaInput || !confirmarSenhaInput || !senhaFeedback) return false;
        
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;
        
        if (confirmarSenha === "") {
            senhaFeedback.textContent = "";
            senhaFeedback.className = "form-text";
            return false;
        }
        
        if (senha === confirmarSenha) {
            senhaFeedback.textContent = "✓ Senhas coincidem";
            senhaFeedback.className = "form-text text-success";
            return true;
        } else {
            senhaFeedback.textContent = "✗ Senhas não coincidem";
            senhaFeedback.className = "form-text text-danger";
            return false;
        }
    }
    
    // Validação em tempo real das senhas
    if (senhaInput && confirmarSenhaInput) {
        senhaInput.addEventListener("input", validarSenhas);
        confirmarSenhaInput.addEventListener("input", validarSenhas);
    }
    
    if (formPontoColeta) {
        formPontoColeta.addEventListener("submit", async function(e) {
            e.preventDefault();
            console.log("Formulário de cadastro de ponto de coleta submetido");
            
            clearAllErrors();
            
            const nome = document.getElementById("nomePontoColeta").value.trim();
            const cnpj = document.getElementById("cnpjPontoColeta").value.trim();
            const email = document.getElementById("emailPontoColeta").value.trim();
            const endereco = document.getElementById("enderecoPontoColeta").value.trim();
            const latitude = document.getElementById("latitudePontoColeta").value.trim();
            const longitude = document.getElementById("longitudePontoColeta").value.trim();
            const telefone = document.getElementById("telefonePontoColeta").value.trim();
            const horario = document.getElementById("horarioPontoColeta").value.trim();
            const descricao = document.getElementById("descricaoPontoColeta").value.trim();
            const foto = document.getElementById("fotoPontoColeta").value.trim();
            const senha = document.getElementById("senhaPontoColeta").value;
            const confirmarSenha = document.getElementById("confirmarSenhaPontoColeta").value;
            const termosAceite = document.getElementById("termosAceite").checked;
            
            const btnSalvar = document.getElementById("btnSalvarPontoColeta");
            const spinner = btnSalvar ? btnSalvar.querySelector(".spinner-border") : null;
            
            let hasErrors = false;
            
            // Validações com mensagens inline
            if (!nome) {
                displayFieldError("nomePontoColeta", "Nome do estabelecimento é obrigatório");
                hasErrors = true;
            }
            
            if (!cnpj) {
                displayFieldError("cnpjPontoColeta", "CNPJ é obrigatório");
                hasErrors = true;
            } else {
                const cnpjLimpo = cnpj.replace(/\D/g, "");
                if (cnpjLimpo.length !== 14) {
                    displayFieldError("cnpjPontoColeta", "CNPJ deve ter 14 dígitos");
                    hasErrors = true;
                }
            }
            
            if (!email) {
                displayFieldError("emailPontoColeta", "Email é obrigatório");
                hasErrors = true;
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    displayFieldError("emailPontoColeta", "Email inválido");
                    hasErrors = true;
                }
            }
            
            if (!endereco) {
                displayFieldError("enderecoPontoColeta", "Endereço é obrigatório");
                hasErrors = true;
            }
            
            if (!latitude || !longitude) {
                displayFieldError("latitudePontoColeta", "Forneça a localização");
                hasErrors = true;
            } else {
                const lat = parseFloat(latitude);
                const lng = parseFloat(longitude);
                if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    displayFieldError("latitudePontoColeta", "Coordenadas inválidas");
                    hasErrors = true;
                }
            }
            
            if (!telefone) {
                displayFieldError("telefonePontoColeta", "Telefone é obrigatório");
                hasErrors = true;
            }
            
            if (!horario) {
                displayFieldError("horarioPontoColeta", "Horário de funcionamento é obrigatório");
                hasErrors = true;
            }
            
            if (!descricao) {
                displayFieldError("descricaoPontoColeta", "Descrição é obrigatória");
                hasErrors = true;
            }
            
            if (!senha) {
                displayFieldError("senhaPontoColeta", "Senha é obrigatória");
                hasErrors = true;
            } else if (senha.length < 6) {
                displayFieldError("senhaPontoColeta", "Senha deve ter pelo menos 6 caracteres");
                hasErrors = true;
            }
            
            if (!confirmarSenha) {
                displayFieldError("confirmarSenhaPontoColeta", "Confirmação de senha é obrigatória");
                hasErrors = true;
            } else if (senha !== confirmarSenha) {
                displayFieldError("confirmarSenhaPontoColeta", "Senhas não coincidem");
                hasErrors = true;
            }

            if (!termosAceite) {
                displayFieldError("termosAceite", "Você deve aceitar os termos");
                hasErrors = true;
            }
            
            if (hasErrors) {
                return;
            }
            
            // Mostrar loading
            if (spinner) spinner.style.display = "inline-block";
            if (btnSalvar) btnSalvar.disabled = true;
            
            try {
                // Verificar se está em modo de edição
                const pontoColetaId = document.getElementById("pontoColetaId").value;
                const isUpdate = pontoColetaId && pontoColetaId.trim() !== "";
                
                if (!isUpdate) {
                    // Verifica se o email ou CNPJ já existem (apenas para novos cadastros)
                    console.log("Verificando se email ou CNPJ já existem...");
                    const pontosExistentes = await fetchData("pontos_coleta");
                    if (pontosExistentes) {
                        const emailExiste = pontosExistentes.some(ponto => ponto.email === email);
                        const cnpjExiste = pontosExistentes.some(ponto => ponto.cnpj === cnpj);
                        
                        if (emailExiste) {
                            displayFieldError("emailPontoColeta", "Este email já está cadastrado");
                            return;
                        }
                        
                        if (cnpjExiste) {
                            displayFieldError("cnpjPontoColeta", "Este CNPJ já está cadastrado");
                            return;
                        }
                    }
                }
                
                // Verifica se a função sha256 está disponível
                if (typeof sha256 === 'undefined') {
                    console.error("Função sha256 não disponível!");
                    alert("Erro interno: função de hash não disponível. Recarregue a página.");
                    return;
                }
                
                // Hasheia a senha antes de salvar (apenas se senha foi alterada)
                let senhaHasheada = senha;
                if (senha && senha.trim() !== "") {
                    console.log("Hasheando senha...");
                    senhaHasheada = await sha256(senha);
                    console.log("Senha hasheada com sucesso");
                }
                
                // Cria objeto do ponto de coleta com todos os campos obrigatórios
                const dadosPontoColeta = {
                    nome: nome,
                    email: email,
                    tipo: "ponto_coleta",
                    endereco: endereco,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    telefone: telefone,
                    horario_funcionamento: horario,
                    descricao: descricao,
                    foto_estabelecimento: foto || "https://via.placeholder.com/150",
                    nome_estabelecimento: nome,
                    cnpj: cnpj,
                    cadastro_completo: true,
                    ativo: true
                };
                
                // Adicionar senha apenas se foi fornecida
                if (senhaHasheada && senhaHasheada.trim() !== "") {
                    dadosPontoColeta.senha = senhaHasheada;
                }
                
                // Adicionar data de cadastro apenas para novos registros
                if (!isUpdate) {
                    dadosPontoColeta.data_cadastro = new Date().toISOString();
                }
                
                if (isUpdate) {
                    console.log("Atualizando ponto de coleta ID:", pontoColetaId);
                    // Atualizar ponto de coleta existente
                    const resultado = await patchData(`pontos_coleta/${pontoColetaId}`, dadosPontoColeta);
                    
                    if (resultado) {
                        // Atualizar dados na sessão
                        sessionStorage.setItem('usuarioLogado', JSON.stringify(resultado));
                        sessionStorage.removeItem('editandoPontoColeta');
                        
                        alert("Dados atualizados com sucesso!");
                        window.location.href = "pagina_perfil_ponto_coleta.html";
                    } else {
                        throw new Error("Falha ao atualizar o ponto de coleta");
                    }
                } else {
                    console.log("Salvando novo ponto de coleta...");
                    // Salva no db.json
                    const resultado = await postData("pontos_coleta", dadosPontoColeta);
                    
                    if (resultado) {
                        alert("Cadastro realizado com sucesso! Agora você pode fazer login como ponto de coleta.");
                        window.location.href = "pagina_login.html";
                    } else {
                        throw new Error("Falha ao salvar ponto de coleta no servidor");
                    }
                }
                
            } catch (error) {
                console.error("Erro no cadastro:", error);
                alert("Erro ao realizar cadastro. Verifique sua conexão e tente novamente.");
            } finally {
                if (spinner) spinner.style.display = "none";
                if (btnSalvar) btnSalvar.disabled = false;
            }
        });
    } else {
        console.warn("Formulário de cadastro de ponto de coleta não encontrado");
    }
    
    // Função para preencher formulário com dados de edição
    function preencherFormularioEdicao(dados) {
        console.log("Preenchendo formulário com dados:", dados);
        
        // Preencher campo oculto com ID
        document.getElementById("pontoColetaId").value = dados.id || "";
        
        // Preencher campos do formulário
        document.getElementById("nomePontoColeta").value = dados.nome_estabelecimento || dados.nome || "";
        document.getElementById("cnpjPontoColeta").value = dados.cnpj || "";
        document.getElementById("emailPontoColeta").value = dados.email || "";
        document.getElementById("enderecoPontoColeta").value = dados.endereco || "";
        document.getElementById("latitudePontoColeta").value = dados.latitude || "";
        document.getElementById("longitudePontoColeta").value = dados.longitude || "";
        document.getElementById("telefonePontoColeta").value = dados.telefone || "";
        document.getElementById("horarioPontoColeta").value = dados.horario_funcionamento || "";
        document.getElementById("descricaoPontoColeta").value = dados.descricao || "";
        document.getElementById("fotoPontoColeta").value = dados.foto_estabelecimento || "";
        
        // Não preencher campos de senha em modo de edição
        // Os campos de senha ficam vazios para permitir alteração opcional
    }
    const btnObterLocalizacao = document.getElementById("btnObterLocalizacao");
    if (btnObterLocalizacao) {
        btnObterLocalizacao.addEventListener("click", function() {
            if (navigator.geolocation) {
                btnObterLocalizacao.disabled = true;
                btnObterLocalizacao.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Obtendo...';
                
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        document.getElementById("latitudePontoColeta").value = position.coords.latitude.toFixed(6);
                        document.getElementById("longitudePontoColeta").value = position.coords.longitude.toFixed(6);
                        
                        btnObterLocalizacao.disabled = false;
                        btnObterLocalizacao.innerHTML = '<i class="bi bi-geo-alt"></i> Localização Obtida!';
                        
                        setTimeout(() => {
                            btnObterLocalizacao.innerHTML = '<i class="bi bi-geo-alt"></i> Obter Localização';
                        }, 2000);
                    },
                    function(error) {
                        console.error("Erro ao obter localização:", error);
                        displayFieldError("latitudePontoColeta", "Não foi possível obter sua localização. Insira manualmente.");
                        
                        btnObterLocalizacao.disabled = false;
                        btnObterLocalizacao.innerHTML = '<i class="bi bi-geo-alt"></i> Obter Localização';
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    }
                );
            } else {
                displayFieldError("latitudePontoColeta", "Geolocalização não é suportada por este navegador");
            }
        });
    }
    
    // Formatar CNPJ ao digitar
    const cnpjInput = document.getElementById("cnpjPontoColeta");
    if (cnpjInput) {
        cnpjInput.addEventListener("input", function(e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 14) value = value.slice(0, 14);
            
            if (value.length > 12) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
            } else if (value.length > 8) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+).*/, "$1.$2.$3/$4");
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{3})(\d+).*/, "$1.$2.$3");
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d+).*/, "$1.$2");
            }
            
            e.target.value = value;
        });
    }
    
    // Formatar telefone ao digitar
    const telefoneInput = document.getElementById("telefonePontoColeta");
    if (telefoneInput) {
        telefoneInput.addEventListener("input", function(e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 10) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
            } else if (value.length > 6) {
                value = value.replace(/^(\d{2})(\d{4})(\d+).*/, "($1) $2-$3");
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d+).*/, "($1) $2");
            }
            
            e.target.value = value;
        });
    }
});


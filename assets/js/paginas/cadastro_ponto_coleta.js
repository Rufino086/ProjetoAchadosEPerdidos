// Script para cadastro de ponto de coleta
document.addEventListener("DOMContentLoaded", function() {
    const formPontoColeta = document.getElementById("formPontoColeta");
    
    if (formPontoColeta) {
        formPontoColeta.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const nome = document.getElementById("nomePontoColeta").value.trim();
            const cnpj = document.getElementById("cnpjPontoColeta").value.trim();
            const endereco = document.getElementById("enderecoPontoColeta").value.trim();
            const latitude = document.getElementById("latitudePontoColeta").value.trim();
            const longitude = document.getElementById("longitudePontoColeta").value.trim();
            const telefone = document.getElementById("telefonePontoColeta").value.trim();
            const horario = document.getElementById("horarioPontoColeta").value.trim();
            const descricao = document.getElementById("descricaoPontoColeta").value.trim();
            const foto = document.getElementById("fotoPontoColeta").value.trim();
            const termosAceite = document.getElementById("termosAceite").checked;
            
            const btnSalvar = document.getElementById("btnSalvarPontoColeta");
            const spinner = btnSalvar.querySelector(".spinner-border");
            
            // Validações
            if (!nome || !cnpj || !endereco || !latitude || !longitude || !telefone || !horario) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                return;
            }
            
            if (!termosAceite) {
                alert("Você deve aceitar os termos para continuar.");
                return;
            }
            
            // Validar CNPJ (básico)
            const cnpjLimpo = cnpj.replace(/\D/g, "");
            if (cnpjLimpo.length !== 14) {
                alert("CNPJ deve ter 14 dígitos.");
                return;
            }
            
            // Validar coordenadas
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                alert("Coordenadas inválidas. Latitude deve estar entre -90 e 90, longitude entre -180 e 180.");
                return;
            }
            
            // Mostrar loading
            spinner.style.display = "inline-block";
            btnSalvar.disabled = true;
            
            try {
                // Verificar se o CNPJ já existe
                const pontosExistentes = await fetchData("pontos_coleta");
                if (pontosExistentes && pontosExistentes.some(ponto => ponto.cnpj === cnpj)) {
                    alert("Este CNPJ já está cadastrado. Tente fazer login ou use outro CNPJ.");
                    return;
                }
                
                // Criar objeto do ponto de coleta
                const novoPontoColeta = {
                    nome_estabelecimento: nome,
                    cnpj: cnpj,
                    endereco: endereco,
                    latitude: lat,
                    longitude: lng,
                    telefone: telefone,
                    horario_funcionamento: horario,
                    descricao: descricao || null,
                    foto_estabelecimento: foto || null,
                    tipo: "ponto_coleta",
                    data_cadastro: new Date().toISOString(),
                    ativo: true
                };
                
                // Salvar no db.json
                const resultado = await postData("pontos_coleta", novoPontoColeta);
                
                if (resultado) {
                    alert("Cadastro realizado com sucesso! Agora você pode fazer login como ponto de coleta.");
                    window.location.href = "pagina_login.html";
                } else {
                    throw new Error("Falha ao salvar ponto de coleta no servidor");
                }
                
            } catch (error) {
                console.error("Erro no cadastro:", error);
                alert("Erro ao realizar cadastro. Verifique sua conexão e tente novamente.");
            } finally {
                spinner.style.display = "none";
                btnSalvar.disabled = false;
            }
        });
    }
    
    // Funcionalidade para obter localização atual
    const btnObterLocalizacao = document.getElementById("btnObterLocalizacao");
    if (btnObterLocalizacao) {
        btnObterLocalizacao.addEventListener("click", function() {
            if (navigator.geolocation) {
                btnObterLocalizacao.disabled = true;
                btnObterLocalizacao.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Obtendo...';
                
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        // Sucesso
                        document.getElementById("latitudePontoColeta").value = position.coords.latitude.toFixed(6);
                        document.getElementById("longitudePontoColeta").value = position.coords.longitude.toFixed(6);
                        
                        btnObterLocalizacao.disabled = false;
                        btnObterLocalizacao.innerHTML = '<i class="bi bi-geo-alt"></i> Localização Obtida!';
                        
                        setTimeout(() => {
                            btnObterLocalizacao.innerHTML = '<i class="bi bi-geo-alt"></i> Obter Localização';
                        }, 2000);
                    },
                    function(error) {
                        // Erro
                        console.error("Erro ao obter localização:", error);
                        alert("Não foi possível obter sua localização. Por favor, insira manualmente.");
                        
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
                alert("Geolocalização não é suportada por este navegador.");
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


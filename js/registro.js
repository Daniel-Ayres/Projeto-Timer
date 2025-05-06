// Aguarda o carregamento completo do DOM antes de executar qualquer lógica
document.addEventListener("DOMContentLoaded", () => {

    // Recupera o nome do usuário e da tarefa ativos do localStorage
    const usuarioAtivo = localStorage.getItem("usuarioAtivo");
    const tarefaAtiva = localStorage.getItem("tarefaAtiva");
  
    // Verifica se ambos estão definidos; caso contrário, alerta e interrompe execução
    if (!usuarioAtivo || !tarefaAtiva) {
      alert("Usuário ou tarefa não definidos.");
      return;
    }
  
    // Busca os dados no arquivo JSON local
    fetch('./json/data.json')
      .then(res => res.json())
      .then(data => {
        const usuarios = data.usuarios || [];
  
        // Encontra o usuário correspondente (ignora maiúsculas/minúsculas e espaços)
        const usuario = usuarios.find(u =>
          u.nome.trim().toLowerCase() === usuarioAtivo.trim().toLowerCase()
        );
  
        // Se o usuário não existir, exibe mensagem na tela
        if (!usuario) {
          document.getElementById("registros-lista").innerHTML = "<p>Usuário não encontrado.</p>";
          return;
        }
  
        // Procura a tarefa do usuário ativo
        const tarefa = usuario.tarefas.find(t =>
          t.nome_tarefa.trim().toLowerCase() === tarefaAtiva.trim().toLowerCase()
        );
  
        // Se a tarefa não for encontrada, exibe mensagem
        if (!tarefa) {
          document.getElementById("registros-lista").innerHTML = "<p>Tarefa não encontrada.</p>";
          return;
        }
  
        // Exibe nome do usuário e tarefa ativa no elemento apropriado
        document.getElementById("descricao-tarefa").textContent = `${usuario.nome} - ${tarefa.nome_tarefa}`;
  
        const lista = document.getElementById("registros-lista");
  
        // Formata os registros com data e tempo convertidos para exibição amigável
        let registros = tarefa.registros.map(registro => {
          const dataFormatada = new Date(registro.data).toLocaleDateString('pt-BR');
          const tempoFormatado = formatarTempo(registro.tempo);
          return { ...registro, dataFormatada, tempoFormatado };
        });
  
        // Função para renderizar visualmente os registros no HTML
        const renderizarRegistros = (registros) => {
          lista.innerHTML = registros.map(registro => `
            <div class="pannel-box">
              <div class="box-content">
                <div class="_header-box">
                  <h3>Data: ${registro.dataFormatada}</h3>
                  <span><i class="bi bi-clock-history"></i></span>
                </div>
                <div class="_body-box">
                  <p><strong>Tempo registrado:</strong> ${registro.tempoFormatado}</p>
                </div>
              </div>
            </div>
          `).join('');
        };
  
        // Renderiza todos os registros ao carregar
        renderizarRegistros(registros);
  
        // Filtro por intervalo de datas
        document.getElementById("filtrar-data").addEventListener("click", () => {
          const dataInicio = document.getElementById("data-inicio").value;
          const dataFim = document.getElementById("data-fim").value;
  
          if (dataInicio && dataFim) {
            const dataInicioObj = new Date(dataInicio);
            const dataFimObj = new Date(dataFim);
  
            // Filtra registros que estão entre as datas selecionadas
            const registrosFiltrados = registros.filter(registro => {
              const registroData = new Date(registro.data);
              return registroData >= dataInicioObj && registroData <= dataFimObj;
            });
  
            renderizarRegistros(registrosFiltrados);
          } else {
            alert("Por favor, selecione ambas as datas.");
          }
        });
  
        // Ordenação: Data do mais antigo para o mais recente
        document.getElementById("ordenar-menor-maior").addEventListener("click", () => {
          registros.sort((a, b) => new Date(a.data) - new Date(b.data));
          renderizarRegistros(registros);
        });
  
        // Ordenação: Data do mais recente para o mais antigo
        document.getElementById("ordenar-maior-menor").addEventListener("click", () => {
          registros.sort((a, b) => new Date(b.data) - new Date(a.data));
          renderizarRegistros(registros);
        });
  
        // Ordenação: Tempo do maior para o menor
        document.getElementById("ordenar-tempo-maior-menor").addEventListener("click", () => {
          registros.sort((a, b) => tempoParaSegundos(b.tempo) - tempoParaSegundos(a.tempo));
          renderizarRegistros(registros);
        });
  
        // Ordenação: Tempo do menor para o maior
        document.getElementById("ordenar-tempo-menor-maior").addEventListener("click", () => {
          registros.sort((a, b) => tempoParaSegundos(a.tempo) - tempoParaSegundos(b.tempo));
          renderizarRegistros(registros);
        });
  
      });
  
    // Utilitário: formata string "H:M" em padrão HH:mm
    function formatarTempo(tempoStr) {
      const [h, m] = tempoStr.split(":");
      return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    }
  
    // Utilitário: converte tempo "H:M" em segundos para facilitar ordenação
    function tempoParaSegundos(t) {
      const [h, m] = t.split(":").map(Number);
      return h * 3600 + m * 60;
    }
  
  });
  
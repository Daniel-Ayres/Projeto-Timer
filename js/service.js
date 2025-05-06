/**
 * Este JavaScript implementa a lógica de carregamento, filtragem e exibição
 * de relatórios de produtividade de um usuário com base em registros de tempo
 * salvos em um arquivo JSON.
 * 
 * Ele é usado em um painel interativo de tarefas rastreadas, funcionando como parte
 * de um sistema de gestão de tempo ou dashboard de desempenho pessoal.
 *
 * Funcionalidades principais incluem:
 * - Verificação do usuário e tarefa ativos via localStorage.
 * - Carregamento de dados JSON de tarefas e registros.
 * - Filtro e exibição por períodos: diário, semanal e mensal.
 * - Cálculo de tempo rastreado e produtividade percentual.
 * - Exibição dinâmica de cartões (cards) com informações visuais.
 */



// Aguarda o DOM estar completamente carregado
document.addEventListener("DOMContentLoaded", () => {
  // Recupera dados do localStorage
  const usuarioAtivo = localStorage.getItem("usuarioAtivo");
  const tarefaAtiva = localStorage.getItem("tarefaAtiva");

  // Verifica se ambos estão disponíveis; se não, exibe alerta
  if (!usuarioAtivo || !tarefaAtiva) {
    alert("Usuário ou tarefa não definidos. Selecione uma linha na tela anterior.");
    return;
  }

  // Variáveis globais para dados e HTML
  let DATA = [];
  let boxContent = "";
  const content = document.querySelector(".user-pannel");

  // Botões por período
  const daily = document.getElementById("daily");
  const weekly = document.getElementById("weekly");
  const monthly = document.getElementById("monthly");

  // Links de período (mobile ou secundário)
  const diarioLink = document.getElementById("diario");
  const semanalLink = document.getElementById("semanal");
  const mensalLink = document.getElementById("mensal");

  // Carrega JSON dos dados e renderiza relatório semanal por padrão
  fetch('./json/data.json')
    .then(response => response.json())
    .then(json => {
      DATA = json.usuarios;
      renderReport('semanal');
    });

  // Eventos de clique para alternar períodos
  daily.addEventListener("click", () => renderReport("diario"));
  weekly.addEventListener("click", () => renderReport("semanal"));
  monthly.addEventListener("click", () => renderReport("mensal"));

  diarioLink.addEventListener("click", () => renderReport("diario"));
  semanalLink.addEventListener("click", () => renderReport("semanal"));
  mensalLink.addEventListener("click", () => renderReport("mensal"));

  // Função utilitária para zerar hora de uma data (deixa só Y/M/D)
  function zerarHorario(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // Converte tempo "HH:MM:SS" para segundos totais
  function tempoParaSegundos(str) {
    const [h, m, s] = str.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  }

  // Função principal que gera e exibe o relatório
  function renderReport(periodo) {
    if (!DATA.length) return;

    boxContent = "";

    // Remove qualquer botão marcado como ativo
    document.querySelector(".active")?.classList.remove("active");

    // Marca o botão atual como ativo
    const btnId = periodo === "diario" ? "daily" : periodo === "semanal" ? "weekly" : "monthly";
    document.getElementById(btnId).classList.add("active");

    // Busca usuário no JSON
    const usuario = DATA.find(u => u.nome.trim().toLowerCase() === usuarioAtivo.trim().toLowerCase());
    if (!usuario) {
      content.innerHTML = "<p>Usuário não encontrado.</p>";
      return;
    }

    // Busca a tarefa do usuário
    const tarefa = usuario.tarefas.find(t =>
      t.nome_tarefa.trim().toLowerCase() === tarefaAtiva.trim().toLowerCase()
    );
    if (!tarefa) {
      content.innerHTML = "<p>Tarefa não encontrada para esse usuário.</p>";
      return;
    }

    // Coleta os registros e define o intervalo de tempo do filtro
    const registros = tarefa.registros;
    const hoje = zerarHorario(new Date());
    let dataLimite;

    if (periodo === "diario") {
      dataLimite = hoje;
    } else if (periodo === "semanal") {
      dataLimite = new Date(hoje);
      dataLimite.setDate(dataLimite.getDate() - 6); // 7 dias incluindo hoje
    } else {
      dataLimite = new Date("1900-01-01"); // Mensal: inclui todos
    }

    // Acumula tempo dos registros dentro do período
    let totalSegundos = 0;
    registros.forEach(r => {
      const dataRegistro = zerarHorario(new Date(r.data + "T00:00:00"));
      const incluir = periodo === "diario"
        ? dataRegistro.getTime() === hoje.getTime()
        : dataRegistro >= dataLimite && dataRegistro <= hoje;

      if (incluir) {
        totalSegundos += tempoParaSegundos(r.tempo);
      }
    });

    // Converte total de segundos em tempo HH:MM:SS
    const h = String(Math.floor(totalSegundos / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSegundos % 3600) / 60)).padStart(2, "0");
    const s = String(totalSegundos % 60).padStart(2, "0");
    const tempoRastreado = `${h}:${m}:${s}`;

    // Busca meta com base no período
    const MAPA_PERIODOS = {
      diario: "diaria",
      semanal: "semanal",
      mensal: "mensal"
    };

    const chaveMeta = MAPA_PERIODOS[periodo];
    const meta = usuario.metas?.[chaveMeta] ?? "00:00:00";

    // Calcula produtividade como média comparada à meta diária
    const metaDiariaSeg = tempoParaSegundos(usuario.metas.diaria || "00:00:00");
    const diasTotais = periodo === "semanal" ? 7 : periodo === "mensal" ? 30 : 1;
    const mediaDiaria = totalSegundos / diasTotais;

    const produtividade = metaDiariaSeg > 0
      ? Math.round((mediaDiaria / metaDiariaSeg) * 100)
      : 0;

    // Atualiza título da tarefa
    document.querySelector(".titulo-card").textContent = tarefaAtiva;

    // Monta painel de tempo rastreado
    boxContent += `
      <div class="pannel-box">
        <div class="box-content">
          <div class="_header-box">
            <h3>Tempo Rastreado</h3>
            <span><i class="bi bi-clock-history"></i></span>
          </div>
          <div class="_body-box">
            <p><strong>${periodo.charAt(0).toUpperCase() + periodo.slice(1)}:</strong> ${tempoRastreado}</p>
          </div>
        </div>
      </div>`;

    // Painel de produtividade
    boxContent += `
      <div class="pannel-box">
        <div class="box-content">
          <div class="_header-box">
            <h3>Produtividade</h3>
            <span><i class="bi bi-graph-up-arrow"></i></span>
          </div>
          <div class="_body-box">
            <p><strong>${periodo.charAt(0).toUpperCase() + periodo.slice(1)}:</strong> ${produtividade}%</p>
          </div>
        </div>
      </div>`;

    // Painel de meta
    boxContent += `
      <div class="pannel-box">
        <div class="box-content">
          <div class="_header-box">
            <h3>Meta</h3>
            <span><i class="bi bi-flag-fill"></i></span>
          </div>
          <div class="_body-box">
            <p><strong>${periodo.charAt(0).toUpperCase() + periodo.slice(1)}:</strong> ${meta}</p>
          </div>
        </div>
      </div>`;

    // Atualiza conteúdo na tela
    content.innerHTML = boxContent;
  }
});

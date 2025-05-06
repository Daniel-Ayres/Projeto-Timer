/**
 * Este JavaScript implementa um painel de tarefas com funcionalidades completas
 * de listagem, controle de tempo (cronômetro), entrada manual e navegação.
 *
 * Funcionalidades principais:
 * ---------------------------------------------------
 *  Exibe tarefas de um usuário fixo (USUARIO_FIXO)
 *  Carrega dados do arquivo `data.json` e renderiza tarefas e registros
 *  Permite iniciar/pausar o cronômetro de uma tarefa por vez
 *  Atualiza os tempos em tempo real e envia para o backend (/salvar-tempo)
 *  Permite entrada manual de tempo via inputs de data/hora
 *  Preenche uma tabela agrupada por tarefa com tempos somados
 *  Marca a tarefa ativa no menu lateral
 *  Faz toggle do menu lateral
 *  Exibe nome do usuário na interface com `localStorage`
 *  Permite clicar em uma linha da tabela para salvar o contexto e navegar
 */


const USUARIO_FIXO = "Daniel"; //Defina Aqui o Usuario Cadastrada em data.Json

// MENU ATIVO
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
allSideMenu.forEach(item => {
  const li = item.parentElement;
  item.addEventListener('click', () => {
    allSideMenu.forEach(i => i.parentElement.classList.remove('active'));
    li.classList.add('active');
  });
});

// TOGGLE DO MENU
const menuBar = document.querySelector('#content nav .bi.bi-list');
const sidebar = document.getElementById('sidebar');
if (menuBar) {
  menuBar.addEventListener('click', () => {
    sidebar.classList.toggle('hide');
  });
}

// INICIAR AO CARREGAR A PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  fetch("./json/data.json")
    .then(res => res.json())
    .then(json => {
      const user = json.usuarios.find(u => u.nome.trim().toLowerCase() === USUARIO_FIXO.toLowerCase());
      if (!user) return;
      preencherListaDeTarefas(user);
      preencherTabelaDeRegistros(user);
    });
});

// LISTA DE TAREFAS
function preencherListaDeTarefas(user) {
  const todoList = document.querySelector(".todo-list");
  todoList.innerHTML = "";

  user.tarefas.forEach(tarefa => {
    const tempo = calcularTempoTotal(tarefa.registros);

    const li = document.createElement("li");
    li.className = "completed";
    li.innerHTML = `
      <p>${tarefa.nome_tarefa}</p>
      <span class="timer">${tempo}</span>
      <div class="actions">
        <button class="start-btn" title="Iniciar/Pausar"><i class="bi bi-play-circle-fill"></i></button>
      </div>
      <div class="manual-input" style="display: none;">
        <input type="date" />
        <input type="time" />
      </div>
    `;
    todoList.appendChild(li);
  });

  ativarTarefaBtns();
}

// TABELA AGRUPADA POR TAREFA
function preencherTabelaDeRegistros(user) {
  const tbody = document.querySelector(".order tbody");
  tbody.innerHTML = "";

  const tarefasAgrupadas = {};
  user.tarefas.forEach(tarefa => {
    const nome = tarefa.nome_tarefa;
    if (!tarefasAgrupadas[nome]) tarefasAgrupadas[nome] = [];
    tarefasAgrupadas[nome].push(...tarefa.registros);
  });

  Object.entries(tarefasAgrupadas).forEach(([nome_tarefa, registros]) => {
    const tempoTotal = calcularTempoTotal(registros);
    const tr = document.createElement("tr");
    tr.classList.add("row-clickable");
    tr.innerHTML = `
      <td><strong>${user.nome}</strong></td>
      <td>${nome_tarefa}</td>
      <td><span>${tempoTotal}</span></td>
    `;
    document.querySelector(".order tbody").appendChild(tr);
  });
}

// CALCULA TOTAL DE TEMPO
function calcularTempoTotal(registros) {
  let total = 0;
  registros.forEach(r => {
    const [h, m, s] = r.tempo.split(":").map(Number);
    total += h * 3600 + m * 60 + s;
  });
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// BOTÕES: CRONÔMETRO, MANUAL, ATUALIZAÇÃO
function ativarTarefaBtns() {
  const buttons = document.querySelectorAll('.start-btn');
  const timers = document.querySelectorAll('.timer');

  const states = Array.from(buttons).map((_, index) => {
    const [h, m, s] = timers[index].textContent.split(":").map(Number);
    return {
      seconds: h * 3600 + m * 60 + s,
      interval: null,
      running: false
    };
  });

  let activeTaskIndex = null;

  buttons.forEach((button, index) => {
    const icon = button.querySelector('i');
    const timerEl = timers[index];

    button.addEventListener('click', () => {
      const state = states[index];

      if (!state.running) {
        if (activeTaskIndex !== null && activeTaskIndex !== index) {
          alert("Só é permitido trabalhar em uma tarefa por vez.");
          return;
        }

        state.interval = setInterval(() => {
          state.seconds++;
          const hrs = String(Math.floor(state.seconds / 3600)).padStart(2, '0');
          const mins = String(Math.floor((state.seconds % 3600) / 60)).padStart(2, '0');
          const secs = String(state.seconds % 60).padStart(2, '0');
          timerEl.textContent = `${hrs}:${mins}:${secs}`;
        }, 1000);

        icon.classList.replace('bi-play-circle-fill', 'bi-pause-btn-fill');
        state.running = true;
        activeTaskIndex = index;

      } else {
        clearInterval(state.interval);
        state.interval = null;
        state.running = false;
        icon.classList.replace('bi-pause-btn-fill', 'bi-play-circle-fill');
        activeTaskIndex = null;

        const taskName = button.closest("li").querySelector("p").innerText.trim();
        const tableRows = document.querySelectorAll(".order tbody tr");

        tableRows.forEach(row => {
          const rowTask = row.querySelector("td:nth-child(2)")?.innerText.trim();
          if (rowTask === taskName) {
            row.querySelector("td:nth-child(3) span").textContent = timerEl.textContent;
          }
        });
      }
    });
  });

  document.querySelectorAll('.manual-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const todoItem = btn.closest('li');
      const manualInput = todoItem.querySelector('.manual-input');
      manualInput.style.display = manualInput.style.display === 'flex' ? 'none' : 'flex';
    });
  });

  document.querySelectorAll('.save-manual').forEach(btn => {
    btn.addEventListener('click', () => {
      const todoItem = btn.closest('li');
      const date = todoItem.querySelector('input[type="date"]').value;
      const time = todoItem.querySelector('input[type="time"]').value;
      if (!date || !time) {
        alert("Preencha a data e hora corretamente.");
        return;
      }
      alert(`Registrado manualmente:\nData: ${date}\nHora: ${time}`);
      todoItem.querySelector('.manual-input').style.display = 'none';
    });
  });
}

function ativarTarefaBtns() {
	const buttons = document.querySelectorAll('.start-btn');
	const timers = document.querySelectorAll('.timer');
  
	const states = Array.from(buttons).map((_, index) => {
	  const [h, m, s] = timers[index].textContent.split(":").map(Number);
	  return {
		seconds: h * 3600 + m * 60 + s,
		initialSeconds: h * 3600 + m * 60 + s,
		interval: null,
		running: false
	  };
	});
  
	let activeTaskIndex = null;
  
	buttons.forEach((button, index) => {
	  const icon = button.querySelector('i');
	  const timerEl = timers[index];
  
	  button.addEventListener('click', () => {
		const state = states[index];
		const taskName = button.closest("li").querySelector("p").innerText.trim();
  
		if (!state.running) {
		  if (activeTaskIndex !== null && activeTaskIndex !== index) {
			alert("Só é permitido trabalhar em uma tarefa por vez.");
			return;
		  }
  
  
		  state.initialSeconds = state.seconds;
		  state.interval = setInterval(() => {
			state.seconds++;
			const hrs = String(Math.floor(state.seconds / 3600)).padStart(2, '0');
			const mins = String(Math.floor((state.seconds % 3600) / 60)).padStart(2, '0');
			const secs = String(state.seconds % 60).padStart(2, '0');
			timerEl.textContent = `${hrs}:${mins}:${secs}`;
		  }, 1000);
  
		  icon.classList.replace('bi-play-circle-fill', 'bi-pause-btn-fill');
		  state.running = true;
		  activeTaskIndex = index;
  
		} else {
		  clearInterval(state.interval);
		  state.interval = null;
		  state.running = false;
		  icon.classList.replace('bi-pause-btn-fill', 'bi-play-circle-fill');
		  activeTaskIndex = null;
  
		  const tempoDecorrido = state.seconds - state.initialSeconds;
  
		  const tableRows = document.querySelectorAll(".order tbody tr");
		  tableRows.forEach(row => {
			const rowTask = row.querySelector("td:nth-child(2)")?.innerText.trim();
			if (rowTask === taskName) {
			  row.querySelector("td:nth-child(3) span").textContent = timerEl.textContent;
			}
		  });
  
		  if (tempoDecorrido > 0) {
			console.log('⏸️ Enviando tempo acumulado para backend:', {
			  usuario: USUARIO_FIXO,
			  tarefa: taskName,
			  segundos: tempoDecorrido
			});
  
			fetch('/salvar-tempo', {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify({
				usuario: USUARIO_FIXO,
				tarefa: taskName,
				segundos: tempoDecorrido
			  })
			})
			.then(res => res.json())
			.then(data => {
			  //console.log('✅ Tempo registrado com sucesso:', data);
			})
			.catch(err => {
			  //console.error('❌ Erro ao registrar tempo:', err);
			});
		  }
		}
	  });
	});
  
	document.querySelectorAll('.manual-btn').forEach(btn => {
	  btn.addEventListener('click', () => {
		const todoItem = btn.closest('li');
		const manualInput = todoItem.querySelector('.manual-input');
		manualInput.style.display = manualInput.style.display === 'flex' ? 'none' : 'flex';
	  });
	});
  
	document.querySelectorAll('.save-manual').forEach(btn => {
	  btn.addEventListener('click', () => {
		const todoItem = btn.closest('li');
		const date = todoItem.querySelector('input[type="date"]').value;
		const time = todoItem.querySelector('input[type="time"]').value;
		if (!date || !time) {
		  alert("Preencha a data e hora corretamente.");
		  return;
		}
		alert(`Registrado manualmente:\nData: ${date}\nHora: ${time}`);
		todoItem.querySelector('.manual-input').style.display = 'none';
	  });
	});
  }

  document.addEventListener("DOMContentLoaded", () => {
    const usuarioAtivo = localStorage.getItem("usuarioAtivo");
  
    if (usuarioAtivo) {
      const nomeExibido = document.getElementById("nome-exibido");
      if (nomeExibido) {
        nomeExibido.textContent = usuarioAtivo;
      }
    }
  });
  
  

// CLIQUE NAS LINHAS DA TABELA
document.addEventListener("click", (e) => {
  const row = e.target.closest(".row-clickable");
  if (!row) return;

  const user = row.querySelector("td:nth-child(1)")?.innerText.trim();
  const task = row.querySelector("td:nth-child(2)")?.innerText.trim();

  if (user && task) {
    localStorage.setItem("usuarioAtivo", user);
    localStorage.setItem("tarefaAtiva", task);
    window.location.href = "cards_list.html";
  }
});
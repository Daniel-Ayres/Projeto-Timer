/*
  Este código configura um servidor web utilizando o framework Express, que permite interagir com o painel de atividades do usuário,
  registrando e manipulando dados de tempo.

  Funcionalidade Principal:
  - O servidor disponibiliza rotas para servir arquivos estáticos (como HTML, CSS, JS e imagens).
  - Ele também possui uma rota específica para salvar o tempo de uma tarefa, permitindo registrar ou atualizar o tempo gasto em uma tarefa específica para o dia atual.
  
  As principais funcionalidades do código são:

  1. **Servidor Express**: 
     - O servidor é criado e configurado para rodar na porta 3000. Ele serve arquivos estáticos da pasta onde o script está localizado (por exemplo, arquivos HTML, CSS e JS).
  
  2. **Rota `/cards_list.html`**:
     - Esta rota garante que o arquivo `cards_list.html` seja servido corretamente quando acessado. Isso permite que o usuário visualize as informações sobre as tarefas em uma página HTML específica.
  
  3. **Rota para Salvar Tempo (`/salvar-tempo`)**:
     - Esta é uma rota POST que permite ao cliente (por exemplo, um painel de controle) enviar dados para o servidor. Os dados incluem o nome do **usuário**, o nome da **tarefa** e o **tempo** em segundos.
     - Se os dados fornecidos forem válidos (usuário e tarefa existem e o tempo é um número), o servidor vai:
       - Ler os dados do arquivo JSON (`data.json`) onde as informações dos usuários e tarefas são armazenadas.
       - Se a tarefa já tiver um registro de tempo para o dia atual, o tempo será atualizado. Caso contrário, um novo registro de tempo será adicionado para o dia.
       - O tempo é formatado corretamente (no formato `HH:mm:ss`) e o arquivo JSON é atualizado com o novo tempo registrado.
  
  4. **Erro de Validação**:
     - Caso os dados enviados pelo cliente sejam inválidos (por exemplo, se faltar o nome do usuário ou da tarefa, ou se o tempo não for um número), o servidor responderá com um erro (status 400).
     - Se houver algum erro ao processar os dados ou atualizar o arquivo, o servidor retornará um erro de servidor interno (status 500).
  
  5. **Execução do Servidor**:
     - O servidor é iniciado na porta 3000 e fica aguardando requisições HTTP.
     - Um log de console é exibido informando que o servidor está rodando corretamente.

  O código funciona como parte de um sistema para rastrear o tempo gasto em atividades ou tarefas específicas, e fornece um meio de registrar e atualizar esses tempos em um arquivo JSON para cada usuário e tarefa. O backend (Express) lida com a lógica de armazenamento e validação de dados, enquanto o frontend (não mostrado aqui) pode interagir com o servidor para exibir e manipular essas informações.
*/


const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS, imagens) da raiz do projeto
app.use(express.static(__dirname));

// Rota para garantir que cards_list.html seja acessível
app.get('/cards_list.html', (req, res) => {
  //console.log('Acessando /cards_list.html');
  res.sendFile(path.join(__dirname, 'cards_list.html'));
});

// Caminho do arquivo JSON com os dados
const DATA_PATH = path.join(__dirname, 'json', 'data.json');

// Função auxiliar para formatar tempo
const formatarTempo = totalSegundos => {
  const h = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSegundos % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// Rota para salvar tempo acumulado
app.post('/salvar-tempo', (req, res) => {
  const { usuario, tarefa, segundos } = req.body;


  if (!usuario || !tarefa || typeof segundos !== 'number') {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  try {
    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(rawData);

    const user = data.usuarios.find(u => u.nome === usuario);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }


    const tarefaObj = user.tarefas.find(t => t.nome_tarefa === tarefa);
    if (!tarefaObj) {
      console.warn(`❌ Tarefa "${tarefa}" não encontrada para o usuário ${usuario}.`);
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const hoje = new Date().toISOString().split('T')[0];
    //console.log(` Data atual: ${hoje}`);
    const registroExistente = tarefaObj.registros.find(r => r.data === hoje);

    if (registroExistente) {
      //console.log(' Atualizando tempo existente...');
      const [h, m, s] = registroExistente.tempo.split(':').map(Number);
      const totalSegundos = h * 3600 + m * 60 + s + segundos;
      registroExistente.tempo = formatarTempo(totalSegundos);
    } else {
      //console.log(' Criando novo registro para hoje...');
      tarefaObj.registros.push({ data: hoje, tempo: formatarTempo(segundos) });
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    //console.log(`Tempo salvo para ${usuario} em "${tarefa}": +${segundos} segundos`);

    return res.status(200).json({ message: 'Tempo registrado com sucesso!' });

  } catch (err) {
    //console.error(' Erro ao salvar tempo:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(` Servidor rodando em: http://localhost:${PORT}`);
});
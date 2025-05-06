# Painel de Registros de Tempo - Node.js

Este projeto é um servidor simples construído com **Node.js** que permite gerenciar registros de tempo para diferentes usuários e tarefas. Ele fornece uma API para registrar e atualizar o tempo dedicado a atividades, além de exibir esses registros por meio de uma interface web interativa.

## Tecnologias Utilizadas

- **Node.js**: Plataforma para construir o servidor web.
- **Express**: Framework para facilitar a criação de rotas e gerenciamento do servidor.
- **FS (File System)**: Utilizado para ler e gravar dados em arquivos JSON.
- **Bootstrap Icons**: Biblioteca de ícones para o frontend.
- **JSON**: Formato utilizado para armazenar dados de usuários e tarefas.

## Funcionalidades do Painel

O **Painel de Registros de Tempo** oferece uma maneira prática e eficiente de acompanhar quanto tempo foi dedicado a diferentes tarefas ou atividades ao longo do tempo. O sistema permite registrar, visualizar e analisar os tempos de forma simples e clara.

### Principais Funcionalidades:

- **Visualização de Tarefas e Tempos**: 
  - Veja todas as tarefas atribuídas a um usuário.
  - Confira o tempo total dedicado a cada tarefa.
  
- **Cronômetro**: 
  - Inicie um cronômetro para registrar o tempo automaticamente.
  - Pause e salve o tempo dedicado a uma tarefa ao final de cada sessão.
  
- **Filtragem e Organização**:
  - Filtre os registros por data (por exemplo, entre 01 e 07 de maio).
  - Organize os registros por data ou tempo (do mais antigo ao mais recente ou do menos tempo ao mais tempo).

- **Acompanhamento de Desempenho**:
  - Visualize o tempo total dedicado a tarefas diárias, semanais e mensais.
  
## Como Funciona

### 1. **Usuário Fixo**
O sistema começa com um usuário padrão (ex: “Daniel”). O nome do usuário ativo será exibido automaticamente na parte superior da tela, fazendo com que a interface inicial já pareça como se o usuário estivesse logado.

### 2. **Gerenciamento de Tarefas**
Cada usuário tem uma lista de tarefas (por exemplo, "Planejamento", "Suporte Técnico"). Cada tarefa mostrará o tempo total registrado até o momento.

### 3. **Registro de Tempo Automático**
Ao clicar no botão de iniciar, um cronômetro começa a contar o tempo. Ao clicar novamente, o tempo será automaticamente salvo e associado à tarefa e ao dia atual. O tempo registrado será exibido em tempo real na interface.

### 4. **Tabela de Registros**
A tela principal exibe uma tabela com todas as tarefas e o tempo total dedicado a cada uma delas. Ao clicar em uma tarefa, você verá todos os registros detalhados dessa atividade.

### 5. **Filtros e Organização**
Você pode aplicar filtros para visualizar os registros dentro de um intervalo de datas específico. Também é possível organizar os registros:
- Do mais antigo para o mais recente.
- Do tempo com menor duração para o maior tempo registrado (ou vice-versa).

## Armazenamento de Dados

Os dados são armazenados em um arquivo chamado **data.json**, onde ficam registrados:
- **Usuários**
- **Tarefas**
- **Tempos registrados**

Este arquivo é atualizado automaticamente à medida que você interage com o painel, mas também pode ser editado manualmente para ajustar informações.

## Como Usar

1. **Iniciar o Servidor**
   - Clone este repositório.
   - Instale as dependências com o comando: `npm install`.
   - Inicie o servidor com o comando: `npm start`.

2. **Acessar a Interface Web**
   - Abra seu navegador e acesse: `http://localhost:3000`.

## Observações Finais

- O painel é projetado para ser simples, direto e eficiente. Seu principal objetivo é proporcionar uma visão clara sobre como o tempo está sendo dedicado a diversas tarefas.
- Qualquer alteração no **data.json** (como adicionar usuários, tarefas ou atualizar tempos) pode ser feita manualmente ou por alguém com conhecimentos técnicos em **Node.js**.

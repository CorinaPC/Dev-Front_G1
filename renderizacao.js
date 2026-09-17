import { derivarTarefas } from "./estados.js";

let tarefasAtuaisVisiveis = [];
const STATUS_VALIDOS = ["a-fazer", "em-andamento", "em-revisao", "concluida"];

export function criarCartao(tarefa) {
  const artigo = document.createElement("article");
  artigo.className = "cartao";
  artigo.dataset.tarefaId = tarefa.id;
  artigo.setAttribute("aria-labelledby", `tarefa-${tarefa.id}-titulo`);

  const cabecalho = document.createElement("div");
  cabecalho.className = "cartao-cabecalho";

  const titulo = document.createElement("h4");
  titulo.className = "cartao-titulo";
  titulo.id = `tarefa-${tarefa.id}-titulo`;
  titulo.textContent = tarefa.titulo;

  const prioridade = document.createElement("p");
  prioridade.className = "cartao-prioridade";
  prioridade.textContent = `Prioridade: ${tarefa.prioridade}`;

  cabecalho.append(titulo, prioridade);

  const info = document.createElement("dl");
  info.className = "cartao-info";

  const dtProjeto = document.createElement("dt");
  dtProjeto.textContent = "Projeto";
  const ddProjeto = document.createElement("dd");
  ddProjeto.textContent = tarefa.projeto;

  const dtResponsavel = document.createElement("dt");
  dtResponsavel.textContent = "Responsável";
  const ddResponsavel = document.createElement("dd");
  ddResponsavel.textContent = tarefa.responsavel;

  info.append(dtProjeto, ddProjeto, dtResponsavel, ddResponsavel);

  const prazo = document.createElement("p");
  prazo.className = "cartao-prazo";
  prazo.append("Prazo: ", criarElementoTime(tarefa.prazo));

  const botaoDetalhes = document.createElement("button");
  botaoDetalhes.type = "button";
  botaoDetalhes.className = "cartao-acao";
  botaoDetalhes.dataset.acao = "ver-detalhes";
  const spanBotao = document.createElement("span");
  spanBotao.textContent = "Ver detalhes";
  botaoDetalhes.appendChild(spanBotao);

  artigo.append(cabecalho, info, prazo, botaoDetalhes);
  return artigo;
}

function criarElementoTime(dataISO) {
  const time = document.createElement("time");
  time.dateTime = dataISO;
  const [ano, mes, dia] = dataISO.split("-");
  time.textContent = `${dia}/${mes}/${ano}`;
  return time;
}

function criarItemVazio() {
  const li = document.createElement("li");
  li.className = "lista-vazia";
  li.textContent = "Nenhuma tarefa neste status.";
  return li;
}

// Atualiza os cartões dentro de cada coluna do quadro
function preencherQuadro(tarefas, quadro) {
  for (const status of STATUS_VALIDOS) {
    const lista = quadro.querySelector(`[data-lista-status="${status}"]`);
    if (!lista) continue;

    const tarefasDoStatus = tarefas.filter((tarefa) => tarefa.status === status);

    if (tarefasDoStatus.length === 0) {
      lista.replaceChildren(criarItemVazio());
      continue;
    }

    const itens = tarefasDoStatus.map((tarefa) => {
      const li = document.createElement("li");
      li.appendChild(criarCartao(tarefa));
      return li;
    });

    // replaceChildren limpa a renderização anterior e evita duplicações
    lista.replaceChildren(...itens);
  }
}

// Ponto principal de renderização que atende a todos os estados da aplicação
export function renderizar(estado, quadro, regiaoStatus) {
  // 1. Estado de Carregamento
  if (estado.carregamento) {
    quadro.hidden = true;
    regiaoStatus.textContent = "Carregando tarefas…";
    return;
  }

  // 2. Estado de Erro da Requisição/API
  if (estado.erro) {
    quadro.hidden = true;
    regiaoStatus.textContent = estado.erro;
    return;
  }

  // 3. Estado de Origem Vazia (o dados.json retornou array sem elementos)
  if (estado.tarefas.length === 0) {
    quadro.hidden = true;
    regiaoStatus.textContent = "Nenhuma tarefa cadastrada na base de dados.";
    return;
  }

  // 4. Derivação das tarefas visíveis a partir dos filtros ativos
  const tarefasVisiveis = derivarTarefas(estado);
  tarefasAtuaisVisiveis = tarefasVisiveis;

  const totalOriginal = estado.tarefas.length;
  const totalVisivel = tarefasVisiveis.length;

  // 5. Estado de Resultado Vazio (filtros ativos não encontraram correspondência)
  if (totalVisivel === 0) {
    quadro.hidden = false;
    preencherQuadro([], quadro);
    regiaoStatus.textContent = `0 de ${totalOriginal} tarefas. Nenhuma tarefa atende aos critérios selecionados. Tente ajustar ou limpar os filtros.`;
    return;
  }

  // 6. Estado de Sucesso com Resultados
  quadro.hidden = false;
  preencherQuadro(tarefasVisiveis, quadro);
  regiaoStatus.textContent = `Exibindo ${totalVisivel} de ${totalOriginal} tarefas.`;
}

// Instalação da delegação de eventos apenas uma vez na inicialização
export function instalarEventosDoQuadro(quadro) {
  quadro.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) return;

    const botao = evento.target.closest('button[data-acao="ver-detalhes"]');
    if (!botao || !quadro.contains(botao)) return;

    const cartao = botao.closest("[data-tarefa-id]");
    if (!cartao) return;

    const tarefa = tarefasAtuaisVisiveis.find(
      (item) => item.id === cartao.dataset.tarefaId,
    );
    if (!tarefa) return;

    console.log("Detalhes da tarefa:", tarefa);
  });
}
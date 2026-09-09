let tarefasAtuais = [];

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

  // Parte B da aula 5: botão de ação com data-acao, e um span interno
  // no texto — é esse span que a prática de delegação usa pra provar
  // que target aponta pro descendente, mesmo o clique sendo tratado
  // no quadro (currentTarget).
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

export function renderizarTarefas(tarefas, quadro) {
  tarefasAtuais = tarefas;

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

    // replaceChildren substitui a fotografia anterior inteira — chamar
    // renderizarTarefas de novo nunca duplica cartão nenhum.
    lista.replaceChildren(...itens);
  }
}

export function instalarEventosDoQuadro(quadro) {
  quadro.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) return;

    const botao = evento.target.closest('button[data-acao="ver-detalhes"]');
    if (!botao || !quadro.contains(botao)) return;

    const cartao = botao.closest("[data-tarefa-id]");
    if (!cartao) return;

    const tarefa = tarefasAtuais.find(
      (item) => item.id === cartao.dataset.tarefaId,
    );
    if (!tarefa) return;

    console.log("Detalhes da tarefa:", tarefa);
  });
}

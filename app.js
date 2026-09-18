import { carregarTarefas } from "./js/api.js";
import { estado } from "./js/estados.js";
import { renderizar, instalarEventosDoQuadro } from "./renderizacao.js";

// Elementos do DOM
const formFiltros = document.getElementById("form-filtros");
const inputBusca = document.getElementById("busca-titulo");
const selectOrdenacao = document.getElementById("ordenacao-prazo");
const btnLimpar = document.getElementById("btn-limpar-filtros");
const colunasQuadro = document.getElementById("colunas-quadro");
const regiaoStatus = document.getElementById("estado-quadro");
const STATUS = ["a-fazer", "em-andamento", "em-revisao", "concluida"];
const JANELA_CLIQUES_MS = 350;
let sequenciaCliques = null;

// Ponto central do ciclo de atualização: Estado -> Renderização
function atualizarInterface() {
  renderizar(estado, colunasQuadro, regiaoStatus);
  prepararCartoes();
}

function atualizarEstado(alteracoes) {
  Object.assign(estado, alteracoes);
  atualizarInterface();
}

function alterarStatusPorCliques(id, quantidade) {
  const tarefa = estado.tarefas.find((item) => item.id === id);
  if (!tarefa) return;

  const indiceAtual = STATUS.indexOf(tarefa.status);
  const proximoIndice = Math.max(
    0,
    Math.min(STATUS.length - 1, indiceAtual + quantidade),
  );

  if (indiceAtual !== proximoIndice) {
    tarefa.status = STATUS[proximoIndice];
    atualizarEstado({ tarefas: estado.tarefas });
  }
}

function prepararCartoes() {
  colunasQuadro?.querySelectorAll("[data-tarefa-id]").forEach((cartao) => {
    const tarefa = estado.tarefas.find(
      (item) => item.id === cartao.dataset.tarefaId,
    );
    if (!tarefa) return;

    cartao.draggable = true;
    cartao.tabIndex = 0;
    cartao.dataset.prioridade = tarefa.prioridade.toLowerCase();
    cartao.dataset.status = tarefa.status;
    cartao.setAttribute(
      "aria-label",
      `${tarefa.titulo}. Arraste para reorganizar visualmente.`,
    );
  });
}

function mostrarDetalhes(cartao) {
  const id = cartao.dataset.tarefaId;
  const tarefa = estado.tarefas.find((item) => item.id === id);
  if (!tarefa || cartao.querySelector("details.detalhes-tarefa")) return;

  const detalhes = document.createElement("details");
  detalhes.className = "detalhes-tarefa";
  detalhes.open = true;

  const resumo = document.createElement("summary");
  resumo.textContent = "Detalhes da tarefa";

  const descricao = document.createElement("p");
  descricao.textContent = tarefa.descricao;

  detalhes.append(resumo, descricao);
  cartao.appendChild(detalhes);
}

function inicializarDetalhesDosCartoes() {
  colunasQuadro?.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) return;
    const botao = evento.target.closest('button[data-acao="ver-detalhes"]');
    if (!botao || !colunasQuadro.contains(botao)) return;

    const cartao = botao.closest("[data-tarefa-id]");
    if (cartao) mostrarDetalhes(cartao);
  });
}

function inicializarInteracaoDosCartoes() {
  colunasQuadro?.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) return;
    if (evento.target.closest("button, details")) return;
    const cartao = evento.target.closest("[data-tarefa-id]");
    if (!cartao || !colunasQuadro.contains(cartao)) return;

    const id = cartao.dataset.tarefaId;
    if (sequenciaCliques?.id !== id) {
      sequenciaCliques = { id, quantidade: 0, timer: null };
    }

    sequenciaCliques.quantidade += 1;
    if (sequenciaCliques.quantidade === 3) {
      clearTimeout(sequenciaCliques.timer);
      alterarStatusPorCliques(id, -1);
      sequenciaCliques = null;
      return;
    }

    clearTimeout(sequenciaCliques.timer);
    sequenciaCliques.timer = setTimeout(() => {
      if (sequenciaCliques?.id !== id) return;
      if (sequenciaCliques.quantidade === 2) {
        alterarStatusPorCliques(id, 1);
      }
      sequenciaCliques = null;
    }, JANELA_CLIQUES_MS);
  });

  let cartaoArrastado = null;

  colunasQuadro?.addEventListener("dragstart", (evento) => {
    if (!(evento.target instanceof Element)) return;
    const cartao = evento.target.closest("[data-tarefa-id]");
    if (!cartao) return;
    cartaoArrastado = cartao;
    cartao.setAttribute("aria-grabbed", "true");
    evento.dataTransfer.effectAllowed = "move";
    evento.dataTransfer.setData("text/plain", cartao.dataset.tarefaId);
  });

  colunasQuadro?.addEventListener("dragover", (evento) => {
    if (!(evento.target instanceof Element)) return;
    const coluna = evento.target.closest(".coluna");
    if (!coluna || !cartaoArrastado) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = "move";
  });

  colunasQuadro?.addEventListener("drop", (evento) => {
    if (!(evento.target instanceof Element)) return;
    const coluna = evento.target.closest(".coluna");
    if (!coluna || !cartaoArrastado) return;
    evento.preventDefault();

    const lista = coluna.querySelector(".lista-cartoes");
    if (!lista) return;

    const alvo = evento.target.closest("[data-tarefa-id]");
    if (alvo && alvo !== cartaoArrastado && alvo.parentElement === lista) {
      const rect = alvo.getBoundingClientRect();
      const depois = evento.clientY > rect.top + rect.height / 2;
      lista.insertBefore(
        cartaoArrastado.parentElement,
        depois ? alvo.nextSibling : alvo,
      );
    } else if (!alvo || alvo.parentElement !== lista) {
      lista.appendChild(cartaoArrastado.parentElement);
    }
  });

  colunasQuadro?.addEventListener("dragend", (evento) => {
    if (!(evento.target instanceof Element)) return;
    const cartao = evento.target.closest("[data-tarefa-id]");
    if (cartao) cartao.setAttribute("aria-grabbed", "false");
    cartaoArrastado = null;
  });
}

function mensagemDeErro(erro) {
  if (erro.tipo === "rede") {
    return "Não foi possível conectar para carregar as tarefas. Verifique sua conexão com a internet e tente novamente.";
  }

  if (erro.tipo === "formato") {
    return "As tarefas vieram num formato inválido. Tente recarregar a página em instantes.";
  }

  if (erro.tipo === "protocolo") {
    return `Não foi possível carregar as tarefas (erro HTTP ${erro.status}).`;
  }

  return "Não foi possível carregar as tarefas. Tente novamente em instantes.";
}

function inicializarOuvintesEventos() {
  // A. Evento de Busca por Título (evento input)
  inputBusca?.addEventListener("input", (e) => {
    atualizarEstado({ busca: e.target.value });
  });

  // B. Evento de Filtro por Status (rádios)
  const radiosStatus = formFiltros?.querySelectorAll('input[name="filtro-status"]');
  radiosStatus?.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      atualizarEstado({ status: e.target.value });
    });
  });

  // C. Evento de Filtro por Prioridade (rádios)
  const radiosPrioridade = formFiltros?.querySelectorAll('input[name="filtro-prioridade"]');
  radiosPrioridade?.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      atualizarEstado({ prioridade: e.target.value });
    });
  });

  // D. Evento de Ordenação por Prazo (select)
  selectOrdenacao?.addEventListener("change", (e) => {
    atualizarEstado({ ordenacao: e.target.value });
  });

  // E. Evento do Botão Limpar Filtros
  btnLimpar?.addEventListener("click", () => {
    if (inputBusca) inputBusca.value = "";
    if (selectOrdenacao) selectOrdenacao.value = "padrao";

    const radioStatusTodos = document.getElementById("status-todos");
    if (radioStatusTodos) radioStatusTodos.checked = true;

    const radioPrioridadeTodas = document.getElementById("prioridade-todas");
    if (radioPrioridadeTodas) radioPrioridadeTodas.checked = true;

    atualizarEstado({
      busca: "",
      status: "todos",
      prioridade: "todas",
      ordenacao: "padrao",
    });
  });
}

async function iniciar() {
  // Delegação de eventos instalada apenas UMA VEZ
  instalarEventosDoQuadro(colunasQuadro);
  inicializarDetalhesDosCartoes();
  inicializarInteracaoDosCartoes();
  inicializarOuvintesEventos();

  // Início do carregamento
  estado.carregamento = true;
  estado.erro = null;
  atualizarInterface();

  try {
    const tarefas = await carregarTarefas();
    estado.tarefas = tarefas;
  } catch (erro) {
    estado.erro = mensagemDeErro(erro);
  } finally {
    estado.carregamento = false;
    atualizarInterface();
  }
}

iniciar();

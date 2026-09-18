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

// Ponto central do ciclo de atualização: Estado -> Renderização
function atualizarInterface() {
  renderizar(estado, colunasQuadro, regiaoStatus);
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
    estado.busca = e.target.value;
    atualizarInterface();
  });

  // B. Evento de Filtro por Status (rádios)
  const radiosStatus = formFiltros?.querySelectorAll('input[name="filtro-status"]');
  radiosStatus?.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      estado.status = e.target.value;
      atualizarInterface();
    });
  });

  // C. Evento de Filtro por Prioridade (rádios)
  const radiosPrioridade = formFiltros?.querySelectorAll('input[name="filtro-prioridade"]');
  radiosPrioridade?.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      estado.prioridade = e.target.value;
      atualizarInterface();
    });
  });

  // D. Evento de Ordenação por Prazo (select)
  selectOrdenacao?.addEventListener("change", (e) => {
    estado.ordenacao = e.target.value;
    atualizarInterface();
  });

  // E. Evento do Botão Limpar Filtros
  btnLimpar?.addEventListener("click", () => {
    // 1. Reseta o Objeto Estado para os valores iniciais
    estado.busca = "";
    estado.status = "todos";
    estado.prioridade = "todas";
    estado.ordenacao = "padrao";

    // 2. Sincroniza os controles visuais do formulário no DOM
    if (inputBusca) inputBusca.value = "";
    if (selectOrdenacao) selectOrdenacao.value = "padrao";

    const radioStatusTodos = document.getElementById("status-todos");
    if (radioStatusTodos) radioStatusTodos.checked = true;

    const radioPrioridadeTodas = document.getElementById("prioridade-todas");
    if (radioPrioridadeTodas) radioPrioridadeTodas.checked = true;

    // 3. Renderiza a tela limpa
    atualizarInterface();
  });
}

async function iniciar() {
  // Delegação de eventos instalada apenas UMA VEZ
  instalarEventosDoQuadro(colunasQuadro);
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

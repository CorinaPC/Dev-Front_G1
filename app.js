import { carregarTarefas } from "./api.js";
import { renderizarEstado } from "./estados.js";
import { instalarEventosDoQuadro } from "./renderizacao.js";

instalarEventosDoQuadro(document.getElementById("colunas-quadro"));

function mensagemDeErro(erro) {
  if (erro.name === "TypeError") {
    return "Não foi possível conectar para carregar as tarefas. Verifique sua conexão com a internet e tente novamente.";
  }

  if (erro.name === "SyntaxError") {
    return "As tarefas vieram num formato que não conseguimos entender. Isso deve ser passageiro — tente recarregar a página em instantes.";
  }

  return erro.status
    ? `Não foi possível carregar as tarefas (erro ${erro.status} do servidor). Tente novamente em instantes.`
    : "Não foi possível carregar as tarefas. Tente novamente em instantes.";
}

async function iniciar() {
  renderizarEstado("carregando");

  try {
    const tarefas = await carregarTarefas();

    if (tarefas.length === 0) {
      renderizarEstado("vazio");
      return;
    }

    renderizarEstado("sucesso", tarefas);
  } catch (erro) {
    renderizarEstado("erro", { mensagem: mensagemDeErro(erro) });
  }
}

iniciar();

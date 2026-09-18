export const estado = {
  tarefas: [],
  busca: "",
  status: "todos",
  prioridade: "todas",
  ordenacao: "padrao",
  carregamento: false,
  erro: null,
};

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function derivarTarefas(estadoAtual) {
  let resultado = [...estadoAtual.tarefas];

  if (estadoAtual.busca.trim() !== "") {
    const termo = normalizarTexto(estadoAtual.busca.trim());
    resultado = resultado.filter((tarefa) =>
      normalizarTexto(tarefa.titulo).includes(termo),
    );
  }

  if (estadoAtual.status !== "todos") {
    resultado = resultado.filter(
      (tarefa) => tarefa.status === estadoAtual.status,
    );
  }

  if (estadoAtual.prioridade !== "todas") {
    const prioridadeFiltro = normalizarTexto(estadoAtual.prioridade);
    resultado = resultado.filter(
      (tarefa) => normalizarTexto(tarefa.prioridade) === prioridadeFiltro,
    );
  }

  if (estadoAtual.ordenacao === "prazo-asc") {
    resultado.sort((a, b) => a.prazo.localeCompare(b.prazo));
  } else if (estadoAtual.ordenacao === "prazo-desc") {
    resultado.sort((a, b) => b.prazo.localeCompare(a.prazo));
  }

  return resultado;
}

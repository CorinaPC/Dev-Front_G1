// 1. Objeto de Estado Único (Fonte Canônica de Verdade)
export const estado = {
  tarefas: [],       // Lista original vinda da API / dados.json
  busca: "",         // Texto digitado na busca
  status: "todos",   // Filtro de status: "todos", "a-fazer", "em-andamento", "em-revisao", "concluida"
  prioridade: "todas", // Filtro de prioridade: "todas", "baixa", "media", "alta"
  ordenacao: "padrao", // Critério: "padrao", "prazo-asc", "prazo-desc"
  carregamento: false, // Booleano para spinner/mensagem de carregamento
  erro: null         // String com mensagem de erro ou null
};

// Auxiliary: Remove acentos e converte para minúsculas
function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// 2. Função Pura de Derivação
// Recebe o estado e retorna um NOVO array filtrado/ordenado
export function derivarTarefas(estadoAtual) {
  // CRUCIAL: Cópia rasa para NUNCA mutar estadoAtual.tarefas
  let resultado = [...estadoAtual.tarefas];

  // A. Aplica busca por título (case-insensitive)
  if (estadoAtual.busca.trim() !== "") {
    const termo = normalizarTexto(estadoAtual.busca.trim());
    resultado = resultado.filter((tarefa) =>
      normalizarTexto(tarefa.titulo).includes(termo)
    );
  }

  // B. Aplica filtro por status
  if (estadoAtual.status !== "todos") {
    resultado = resultado.filter(
      (tarefa) => tarefa.status === estadoAtual.status
    );
  }

  // C. Aplica filtro por prioridade
  if (estadoAtual.prioridade !== "todas") {
    const prioridadeFiltro = normalizarTexto(estadoAtual.prioridade);
    resultado = resultado.filter(
      (tarefa) => normalizarTexto(tarefa.prioridade) === prioridadeFiltro
    );
  }

  // D. Aplica ordenação por prazo
  if (estadoAtual.ordenacao === "prazo-asc") {
    resultado.sort((a, b) => a.prazo.localeCompare(b.prazo));
  } else if (estadoAtual.ordenacao === "prazo-desc") {
    resultado.sort((a, b) => b.prazo.localeCompare(a.prazo));
  }

  return resultado;
}
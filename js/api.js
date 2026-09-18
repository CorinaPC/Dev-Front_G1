const URL_DADOS = "./dados.json";

function criarErro(tipo, mensagem, status) {
  const erro = new Error(mensagem);
  erro.tipo = tipo;
  if (status !== undefined) erro.status = status;
  return erro;
}

export async function carregarTarefas() {
  let resposta;

  try {
    resposta = await fetch(URL_DADOS);
  } catch (erro) {
    throw criarErro(
      "rede",
      "Não foi possível conectar para carregar as tarefas.",
    );
  }

  if (!resposta.ok) {
    throw criarErro(
      "protocolo",
      `Não foi possível carregar as tarefas (HTTP ${resposta.status}).`,
      resposta.status,
    );
  }

  let corpo;
  try {
    corpo = await resposta.json();
  } catch (erro) {
    throw criarErro("formato", "A resposta de tarefas está em formato inválido.");
  }

  if (!corpo || !Array.isArray(corpo.tarefas)) {
    throw criarErro("formato", "A resposta de tarefas está em formato inválido.");
  }

  return corpo.tarefas;
}

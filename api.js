const URL_DADOS = "dados.json";

export async function carregarTarefas() {
  const resposta = await fetch(URL_DADOS);

  if (!resposta.ok) {
    const erro = new Error(
      `Não foi possível carregar as tarefas (HTTP ${resposta.status}).`,
    );
    erro.status = resposta.status;
    throw erro;
  }

  const corpo = await resposta.json();

  return corpo.tarefas;
}

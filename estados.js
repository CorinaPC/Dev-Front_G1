import { renderizarTarefas } from "./renderizacao.js";

const regiaoStatus = document.getElementById("estado-quadro");
const colunasQuadro = document.getElementById("colunas-quadro");

const MENSAGEM_CARREGANDO = "Carregando tarefas…";
const MENSAGEM_VAZIO =
  "Nenhuma tarefa cadastrada ainda. Assim que uma tarefa for criada, ela aparece aqui.";

export function renderizarEstado(estado, dados) {
  switch (estado) {
        case "carregando":
            colunasQuadro.hidden = true;
            regiaoStatus.textContent = MENSAGEM_CARREGANDO;
            break;

        case "vazio":
            colunasQuadro.hidden = true;
            regiaoStatus.textContent = MENSAGEM_VAZIO;
            break;

        case "erro":
            colunasQuadro.hidden = true;
            regiaoStatus.textContent = dados.mensagem;
            break;

        case "sucesso": {
            colunasQuadro.hidden = false;
            renderizarTarefas(dados, colunasQuadro);
            const quantidade = dados.length;
            regiaoStatus.textContent =
                quantidade === 1
                    ? "1 tarefa carregada."
                    : `${quantidade} tarefas carregadas.`;
            break;
        }

        default:
            throw new Error(`Estado desconhecido: ${estado}`);
    }
}

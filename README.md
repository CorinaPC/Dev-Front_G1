# Gerenciador de Tarefas Acadêmicas

## Diferencial: reorganização visual por arraste

Segure qualquer cartão e arraste-o para reorganizá-lo visualmente dentro de
qualquer coluna. O recurso usa arraste HTML5 e fallback por ponteiro para
mouse/touch; soltar sobre outro cartão posiciona antes/depois dele, e soltar em
uma área vazia coloca o cartão no fim da coluna. Essa operação é somente
visual: não persiste a ordem, não muda status ou dados canônicos e não permite
cadastro, edição ou exclusão.

Quadro Kanban acadêmico com busca por título, filtros combináveis por status e
prioridade, ordenação por prazo e mensagens acessíveis de carregamento, erro,
origem vazia e resultado filtrado.

## Funcionalidades

- Quatro colunas com cores distintas e cartões com prioridade visualizada por badge.
- Dois cliques avançam o cartão de status; três cliques retornam ao status anterior.
- O botão **Ver detalhes** abre uma descrição acessível dentro do cartão.
- Arrastar e soltar reorganiza visualmente os cartões; a ordem não é persistida e
  não altera status ou dados canônicos.
- A região de status usa `role="status"` e `aria-live="polite"`.

## Configuração e execução local

Não há dependências externas nem etapa de build. Abra a pasta do projeto e sirva
`index.html` por HTTP para que o `fetch("./dados.json")` funcione:

```powershell
python -m http.server 8000
```

Depois, acesse `http://127.0.0.1:8000/`.

## Limites do escopo

Os dados são carregados de `dados.json` e as mudanças de status existem apenas
durante a sessão. Não fazem parte desta entrega cadastro, edição, exclusão,
persistência em servidor ou publicação externa. O rearranjo por arrastar e soltar
é deliberadamente apenas visual e não persiste.

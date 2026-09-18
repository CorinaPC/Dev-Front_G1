# Gerenciador de Tarefas Acadêmicas

Quadro Kanban acadêmico com busca por título, filtros combináveis por status e
prioridade, ordenação por prazo e mensagens acessíveis de carregamento, erro,
origem vazia e resultado filtrado.

## Funcionalidades

- Quatro colunas com cores distintas e cartões com prioridade visualizada por badge.
- Dois cliques avançam o cartão de status; três cliques retornam ao status anterior.
- O botão **Ver detalhes** abre uma descrição acessível dentro do cartão.
- Arrastar e soltar apenas reorganiza visualmente os cartões na coluna. A ordem não
  é persistida, não altera status ou dados canônicos e não cadastra, edita ou exclui tarefas.
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

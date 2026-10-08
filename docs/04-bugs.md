# Report de bugs — VZS-142 Cupom de desconto e frete grátis

Bugs encontrados na execução manual dos casos de teste ([relatório](03-relatorio-de-execucao.md)). Severidade e prioridade seguem os critérios do [plano de teste](01-plano-de-teste.md#5-classificação-dos-bugs).

| ID | Título | Severidade | Prioridade | Status | Critério | Caso de teste |
|----|--------|-----------|-----------|--------|----------|---------------|
| [BUG-01](#bug-01--frete-cobrado-quando-o-subtotal-é-exatamente-r-20000) | Frete cobrado quando o subtotal é exatamente R$ 200,00 | Alta | Alta | Aberto | CA06, CA08 | CT-11, CT-13 |
| [BUG-02](#bug-02--api-aceita-mais-de-5-unidades-por-produto) | API aceita mais de 5 unidades por produto | Alta | Alta | Aberto | CA10 | CT-18 |
| [BUG-03](#bug-03--item-sem-produtoid-retorna-erro-inadequado) | Item sem `produtoId` retorna erro inadequado | Baixa | Baixa | Aberto | Contrato de erros | CT-25b |
| [BUG-04](#bug-04--checkout-aceita-nome-sem-letras-e-e-mail-com-pontos-consecutivos) | Checkout aceita nome sem letras e e-mail com pontos consecutivos | Baixa | Baixa | Aberto | Regras de checkout | CT-23c |

Dados comuns a todos os bugs:

| | |
|---|---|
| **Versão** | VZS-142 v2.3.0 |
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev |
| **Navegador e ferramentas** | Chrome (desktop) e Postman |
| **Encontrado em** | 07/10/2026 |
| **Frequência** | Sempre reproduz (100%) |

---

## BUG-01 — Frete cobrado quando o subtotal é exatamente R$ 200,00

| Severidade | Prioridade | Status | Camada | Critério violado | Caso de teste |
|---|---|---|---|---|---|
| Alta | Alta | Aberto | API (reflete na UI) | CA06 ("a partir de R$ 200,00, inclusive") e CA08 | CT-11, CT-13 |

**Pré-condição:** carrinho vazio.

**Passos para reproduzir**
1. Na vitrine, adicionar 2× "Mochila Urbana 20L" (R$ 100,00 cada).
2. Abrir o carrinho.

**Resultado esperado:** subtotal R$ 200,00, frete **Grátis**, total **R$ 200,00** e nenhuma mensagem de valor faltante.

**Resultado obtido:** subtotal R$ 200,00, frete **R$ 19,90**, total **R$ 219,90** e a mensagem **"Faltam R$ 0,00 para o frete grátis."**, que contradiz o próprio valor.

**Reprodução via API**
```http
POST /api/carrinho/calcular
{"itens":[{"produtoId":"P005","quantidade":2}]}
```
Resposta (trecho): `"subtotal":200, "frete":19.9, "freteGratis":false, "valorFaltanteFreteGratis":0, "total":219.9`

**Informações adicionais**
- Com o cupom BEMVINDO10, o total é R$ 199,90 (esperado R$ 180,00).
- Reproduz também com 4× Garrafa Térmica (R$ 50,00) e com 1× Mochila + 2× Garrafa.
- O pedido é **confirmado** com o frete indevido (VZ-014331, total R$ 219,90).
- Subtotais de R$ 199,80 e a partir de R$ 200,10 se comportam corretamente. O `valorFaltanteFreteGratis` (0) está certo, mas o frete não, o que indica uma comparação `subtotal > 200` em vez de `>= 200`.

**Impacto:** o cliente paga R$ 19,90 a mais exatamente no valor-limite anunciado no banner da loja ("Frete grátis a partir de R$ 200,00").

**Evidências:** [BUG-01-carrinho.jpg](05-evidencias/BUG-01-carrinho.jpg), [BUG-01-pedido-confirmado.jpg](05-evidencias/BUG-01-pedido-confirmado.jpg), [BUG-01-api.jpg](05-evidencias/BUG-01-api.jpg), [BUG-01-api-testes.jpg](05-evidencias/BUG-01-api-testes.jpg)

---

## BUG-02 — API aceita mais de 5 unidades por produto

| Severidade | Prioridade | Status | Camada | Critério violado | Caso de teste |
|---|---|---|---|---|---|
| Alta | Alta | Aberto | API | CA10 ("A regra vale para a interface e para a API") | CT-18 |

**Pré-condição:** nenhuma (requisições diretas à API).

**Passos para reproduzir**
1. Enviar:
   ```http
   POST /api/carrinho/calcular
   {"itens":[{"produtoId":"P006","quantidade":6}]}
   ```
2. Enviar:
   ```http
   POST /api/pedidos
   {"cliente":{"nome":"Maria Silva","email":"maria@exemplo.com","cep":"01310-100"},
    "itens":[{"produtoId":"P005","quantidade":6}]}
   ```

**Resultado esperado:** nas duas requisições, `422` com `"codigo":"QUANTIDADE_MAXIMA_EXCEDIDA"` e `"campo":"itens[0].quantidade"`.

**Resultado obtido:**
- `/calcular` → `200`, subtotal R$ 179,40.
- `/pedidos` → `201`, pedido criado com 6 mochilas, total R$ 600,00.

**Informações adicionais**
- Reproduz também com quantidade 7, 99 e **1.000.000.000** (a API calcula um total de R$ 59.900.000.000,00). Não existe teto de quantidade no back-end.
- A interface bloqueia corretamente em 5 (CT-17). A regra só falha no back-end, o que permite burlá-la com qualquer cliente HTTP.
- O código `QUANTIDADE_MAXIMA_EXCEDIDA` está na documentação, mas nunca é retornado.

**Impacto:** a regra de negócio do CA10 pode ser contornada, e pedidos com quantidades arbitrárias são confirmados.

**Evidências:** [BUG-02-pedido.jpg](05-evidencias/BUG-02-pedido.jpg), [BUG-02-pedido-testes.jpg](05-evidencias/BUG-02-pedido-testes.jpg), [BUG-02-calcular.jpg](05-evidencias/BUG-02-calcular.jpg), [BUG-02-calcular-testes.jpg](05-evidencias/BUG-02-calcular-testes.jpg)

---

## BUG-03 — Item sem `produtoId` retorna erro inadequado

| Severidade | Prioridade | Status | Camada | Critério violado | Caso de teste |
|---|---|---|---|---|---|
| Baixa | Baixa | Aberto | API | Contrato de erros (`ITEM_INVALIDO`) | CT-25b |

**Pré-condição:** nenhuma (requisição direta à API).

**Passos para reproduzir**
1. Enviar:
   ```http
   POST /api/carrinho/calcular
   {"itens":[{"quantidade":1}]}
   ```

**Resultado esperado:** `422 ITEM_INVALIDO`. A documentação define esse código para "um item não é um objeto com produtoId e quantidade".

**Resultado obtido:** `422 PRODUTO_NAO_ENCONTRADO`, com a mensagem **"Produto undefined não encontrado."**, que expõe `undefined` para quem consome a API.

**Informações adicionais**
- Item vazio `{}` → "Produto undefined não encontrado."
- `"produtoId": null` → "Produto null não encontrado."
- `"produtoId": ""` → "Produto  não encontrado." (com espaço duplo).
- Em todos os casos o item não informa um produto e deveria cair em `ITEM_INVALIDO`.

**Impacto:** sem efeito para o cliente final, mas o contrato de erros fica inconsistente com a documentação.

**Evidências:** [BUG-03-api.jpg](05-evidencias/BUG-03-api.jpg), [BUG-03-api-testes.jpg](05-evidencias/BUG-03-api-testes.jpg)

---

## BUG-04 — Checkout aceita nome sem letras e e-mail com pontos consecutivos

| Severidade | Prioridade | Status | Camada | Critério violado | Caso de teste |
|---|---|---|---|---|---|
| Baixa | Baixa | Aberto | API (reflete na UI) | Regras de checkout: "nome e sobrenome" e "e-mail em formato válido" | CT-23c |

**Pré-condição:** pelo menos um produto no carrinho.

**Passos para reproduzir**
1. Ir para o checkout.
2. Preencher **Nome completo** = `12345 67890`, **E-mail** = `maria@exemplo.com`, **CEP** = `01310100`.
3. Confirmar o pedido.

**Resultado esperado:** permanecer no checkout com a mensagem "Informe nome e sobrenome.".

**Resultado obtido:** o pedido é confirmado (VZ-934747) e a página exibe **"Obrigado, 12345."**.

**Informações adicionais**

| Campo | Valor | Resultado |
|---|---|---|
| nome | `12345 67890` | aceito (201) |
| nome | `@@@ ###` | aceito (201) |
| nome | `Maria 1` | recusado: "Informe nome e sobrenome." |
| e-mail | `maria@exemplo..com` | aceito (201), pedido VZ-221632 pela UI |
| e-mail | `maria@@exemplo.com` | recusado: "Informe um e-mail válido." |

A validação de nome confere só se há duas palavras com 2 ou mais caracteres, sem exigir letras. Por isso `Maria 1` é recusado e `12345 67890` passa. A validação de e-mail não rejeita pontos consecutivos no domínio.

**Impacto:** dados de entrega inválidos chegam ao pedido e aparecem na tela de confirmação.

**Evidências:** [BUG-04-pedido-nome-numerico.jpg](05-evidencias/BUG-04-pedido-nome-numerico.jpg) (UI), [BUG-04-api.jpg](05-evidencias/BUG-04-api.jpg), [BUG-04-api-testes.jpg](05-evidencias/BUG-04-api-testes.jpg), [BUG-04-email.jpg](05-evidencias/BUG-04-email.jpg), [BUG-04-email-testes.jpg](05-evidencias/BUG-04-email-testes.jpg) (Postman)

---

## Reprodução no Postman

A collection [`postman/VZS-142.postman_collection.json`](../postman/VZS-142.postman_collection.json) tem uma requisição por bug. Cada requisição tem asserções que descrevem o comportamento **esperado** pela documentação, então as asserções que falham correspondem aos bugs. Resultado em 08/10/2026 (3 de 17 asserções passaram):

| Requisição | Asserções que passaram |
|---|---|
| BUG-01 - Frete cobrado com subtotal R$ 200,00 | 2 de 4 (falham CA06 e total) |
| BUG-02a - Pedido confirmado com 6 unidades | 0 de 2 |
| BUG-02b - Cálculo do carrinho com 6 unidades | 0 de 2 |
| BUG-03 - Item sem produtoId retorna "Produto undefined" | 1 de 3 (falham código e mensagem) |
| BUG-04a - Pedido aceito com nome sem letras | 0 de 3 |
| BUG-04b - Pedido aceito com e-mail malformado | 0 de 3 |

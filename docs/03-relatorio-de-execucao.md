# Relatório de execução — VZS-142 (v2.3.0)

| | |
|---|---|
| **Card** | VZS-142 — Cupom de desconto e frete grátis |
| **Versão testada** | 2.3.0 (30/09/2026), reconferida em 08/10/2026 |
| **Período** | 07/10/2026 a 08/10/2026 |
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev |
| **Navegador e ferramentas** | Chrome (desktop), Postman, Playwright |
| **Massa de cliente** | Maria Silva / maria@exemplo.com / 01310-100 (dados fictícios) |
| **Plano de teste** | [`01-plano-de-teste.md`](01-plano-de-teste.md) |

## 1. Resumo executivo

**Conclusão: entrega reprovada.** Dois bugs de severidade alta violam critérios de aceite: o frete é cobrado quando o subtotal é exatamente R$ 200,00 (CA06 e CA08) e a API aceita mais de 5 unidades por produto (CA10). O critério de saída do plano ("nenhum bug crítico ou alto em aberto") não foi atendido. Recomendação: corrigir BUG-01 e BUG-02 e reexecutar CT-11, CT-13 e CT-18. BUG-03 e BUG-04 têm severidade baixa e podem seguir para o backlog.

| Casos de teste | ✅ Passou | ❌ Falhou | Critérios de aceite atendidos | Sessões exploratórias | Bugs |
|---|---|---|---|---|---|
| 31 | 26 (84%) | 5 (16%) | 8 de 11 | 9 (6 manuais, 3 com apoio de IA) | 4 (2 altos, 2 baixos) |

| Bug | Título | Severidade | Status |
|---|---|---|---|
| [BUG-01](04-bugs.md#bug-01--frete-cobrado-quando-o-subtotal-é-exatamente-r-20000) | Frete cobrado quando o subtotal é exatamente R$ 200,00 | Alta | Aberto |
| [BUG-02](04-bugs.md#bug-02--api-aceita-mais-de-5-unidades-por-produto) | API aceita mais de 5 unidades por produto | Alta | Aberto |
| [BUG-03](04-bugs.md#bug-03--item-sem-produtoid-retorna-erro-inadequado) | Item sem `produtoId` retorna erro inadequado | Baixa | Aberto |
| [BUG-04](04-bugs.md#bug-04--checkout-aceita-nome-sem-letras-e-e-mail-com-pontos-consecutivos) | Checkout aceita nome sem letras e e-mail com pontos consecutivos | Baixa | Aberto |

### Como os testes foram executados

| Etapa | Forma | O que cobre |
|---|---|---|
| Casos de teste | **Manual** | Os 31 casos de teste de [`02-casos-de-teste/`](02-casos-de-teste), executados um a um pela interface e pela API (Postman). Os 4 bugs foram encontrados nesta etapa. |
| Sessões exploratórias | **Manual** | EXP-02, EXP-03, EXP-04, EXP-07, EXP-08 e EXP-09: fluxos, navegação, persistência e layout. |
| Testes repetitivos | **Com apoio de IA** | EXP-01, EXP-05 e EXP-06: combinações em massa na API (produtos × quantidades × cupom e variações negativas), comparadas com o cálculo esperado em centavos. As chamadas foram feitas em sequência, uma por vez, para não gerar carga no ambiente compartilhado. |
| Regressão | Automática | 69 testes em Playwright que repetem os casos principais. |

Os testes com apoio de IA não encontraram bugs novos. Eles confirmaram os 4 bugs da execução manual em mais combinações, como a quantidade 1.000.000.000 do BUG-02 e as variações de `produtoId` do BUG-03.

## 2. Resultado por critério de aceite

| Critério | Descrição resumida | Casos de teste | Resultado |
|---|---|---|---|
| CA01 | BEMVINDO10 dá 10% sobre o subtotal dos produtos | CT-01, CT-09, CT-21, CT-24 | ✅ Atendido |
| CA02 | Cupom sem diferenciar caixa, ignorando espaços nas pontas | CT-02, CT-03 | ✅ Atendido |
| CA03 | Cupom inexistente: "Cupom inválido." e sem desconto | CT-03, CT-04, CT-22, CT-24 | ✅ Atendido |
| CA04 | Cupom expirado: "Cupom expirado." e sem desconto | CT-05, CT-22, CT-24 | ✅ Atendido |
| CA05 | Um cupom por vez | CT-07, CT-08 | ✅ Atendido |
| CA06 | Frete grátis a partir de R$ 200,00, inclusive | CT-11, CT-12, CT-13 | ❌ Não atendido (BUG-01) |
| CA07 | Frete de R$ 19,90 abaixo de R$ 200,00 e aviso de faltante | CT-10, CT-16 | ✅ Atendido |
| CA08 | Frete grátis pelo subtotal antes do desconto | CT-13, CT-14 | ❌ Não atendido (BUG-01) |
| CA09 | Desconto não incide sobre o frete | CT-15 | ✅ Atendido |
| CA10 | Máximo de 5 unidades por produto, na interface e na API | CT-17, CT-18 | ❌ Não atendido (BUG-02) |
| CA11 | Valores arredondados para 2 casas decimais | CT-01, EXP-01 | ✅ Atendido |
| Checkout | Nome e sobrenome, e-mail válido, CEP com 8 dígitos | CT-21 a CT-23c | ⚠️ Parcial (BUG-04) |
| Contrato da API | Códigos de erro documentados | CT-19, CT-20, CT-24, CT-25 a CT-25c | ⚠️ Parcial (BUG-03) |

## 3. Resultado dos casos de teste (execução manual)

| ID | Caso de teste | Camada | Resultado | Bug | Observação |
|----|---------------|--------|-----------|-----|-----------|
| CT-01 | Cupom válido BEMVINDO10 | UI + API | ✅ | — | 239,70 − 23,97 + 0 = 215,73 |
| CT-02 | Cupom sem diferenciar caixa / espaços nas pontas | UI + API | ✅ | — | `bemvindo10`, `BemVindo10`, `  bemvindo10  ` aplicam; UI normaliza para `BEMVINDO10` |
| CT-03 | Espaço no meio do código | UI | ✅ | — | `BEM VINDO10` → "Cupom inválido." |
| CT-04 | Cupom inexistente | UI + API | ✅ | — | `XPTO123`, `BEMVINDO1`, `BEMVINDO100` → "Cupom inválido." |
| CT-05 | Cupom expirado | UI + API | ✅ | — | `VERAO2026` e `verao2026` → "Cupom expirado." |
| CT-06 | Campo de cupom vazio | UI | ✅ | — | Mensagem "Informe um cupom.", sem chamada de desconto |
| CT-07 | Apenas um cupom por vez | UI | ✅ | — | Com cupom aplicado o campo some; só aparece "Remover cupom" |
| CT-08 | Remover cupom | UI | ✅ | — | Desconto volta a 0 e o campo reaparece |
| CT-09 | Desconto recalculado ao alterar carrinho | UI | ✅ | — | 1→3 Mochilas: desconto 10 → 30, frete passa a grátis |
| CT-10 | Frete abaixo de R$ 200 + faltante | UI + API | ✅ | — | 189,90 → frete 19,90, faltam 10,10; 199,80 → faltam 0,20 |
| CT-11 | Frete grátis com subtotal exatamente R$ 200,00 | UI + API | ❌ | BUG-01 | Cobra 19,90 e exibe "Faltam R$ 0,00 para o frete grátis." |
| CT-12 | Frete grátis acima de R$ 200 | UI + API | ✅ | — | 229,90 → "Grátis" |
| CT-13 | Frete grátis pelo subtotal antes do desconto | UI + API | ❌ | BUG-01 | 200 + cupom → total 199,90 (esperado 180,00) |
| CT-14 | Desconto que baixa de 200 não tira o frete grátis | UI + API | ✅ | — | 229,90 − 22,99 = 206,91, frete 0 |
| CT-15 | Desconto não incide sobre o frete | UI + API | ✅ | — | 100 − 10 + 19,90 = 109,90 |
| CT-16 | Faltante atualiza ao remover item | UI | ✅ | — | Remover a Calça: 259,70 → 119,80, faltam 80,20 |
| CT-17 | Limite de 5 unidades na UI | UI | ✅ | — | Botão da vitrine e "+" desabilitados no 5; mensagem "Limite de 5 unidades atingido." |
| CT-17b | Quantidade mínima 1 no carrinho | UI | ✅ | — | Botão "−" desabilitado em 1 |
| CT-18 | Limite de 5 unidades na API | API | ❌ | BUG-02 | qtd 6 e 7 aceitas em `/calcular` (200) e `/pedidos` (201) |
| CT-19 | Quantidades inválidas (0, −1, 1.5, "2", null) | API | ✅ | — | 422 QUANTIDADE_INVALIDA |
| CT-20 | Item duplicado | API | ✅ | — | 422 ITEM_DUPLICADO em `itens[1].produtoId` |
| CT-21 | Finalizar pedido com cupom | UI + API | ✅ | — | VZ-641530, total 127,72 igual ao carrinho; carrinho zera após confirmar |
| CT-21b | Checkout com carrinho vazio | UI | ✅ | — | Redireciona para o carrinho |
| CT-22 | Pedido com cupom inválido/expirado | API | ✅ | — | 422 CUPOM_INVALIDO / CUPOM_EXPIRADO |
| CT-23 | Validação de nome, e-mail e CEP | UI + API | ✅ | — | Ver detalhamento abaixo |
| CT-23b | CEP com e sem hífen | UI + API | ✅ | — | Ambos aceitos |
| CT-23c | Nome sem letras e e-mail malformado | UI + API | ❌ | BUG-04 | `12345 67890` e `maria@exemplo..com` geram pedido |
| CT-24 | Listar/consultar produtos (inclui 24b–24d) | API | ✅ | — | 8 produtos, preços iguais à documentação; P999 → 404; exemplo da doc reproduzido |
| CT-25 | Erros genéricos da API | API | ✅ | — | 400/404/405/422 corretos |
| CT-25b | Item sem `produtoId` | API | ❌ | BUG-03 | Retorna PRODUTO_NAO_ENCONTRADO "Produto undefined..." |
| CT-25c | DADOS_INVALIDOS lista os campos | API | ✅ | — | nome, email, cep |

### CT-23 — detalhamento

| Entrada | UI | API |
|---|---|---|
| nome vazio / só espaços | "Informe o nome completo." | idem |
| `Maria`, `Maria `, `Maria 1`, `M S` | "Informe nome e sobrenome." | 422 |
| e-mail `maria@`, `maria@exemplo`, `maria @exemplo.com` | "Informe um e-mail válido." | 422 |
| CEP `1310-100`, `013101000`, `abcde-fgh`, `01310 100`, `013-10100` | "Informe um CEP com 8 dígitos." | 422 |
| CEP `01310100` e `01310-100` | aceito | 201, CEP normalizado para `01310100` |

## 4. Sessões exploratórias manuais

| ID | Data | Missão | Resultado |
|----|------|--------|-----------|
| EXP-02 | 07/10 | Persistência do carrinho e cupom | O carrinho e o cupom sobrevivem ao F5 na mesma aba. "Esvaziar carrinho" também remove o cupom. Acessar `/checkout` com carrinho vazio redireciona para `/carrinho` |
| EXP-03 | 07/10 | A UI calcula sozinha ou usa a API? | Toda alteração no carrinho chama `POST /api/carrinho/calcular`; os valores da tela, do checkout e da confirmação batem com a API |
| EXP-04 | 07/10 | Robustez do contrato | `itens` como objeto → ITENS_OBRIGATORIOS; corpo `[]` ou `"x"` → JSON_INVALIDO; `cupom: ""`/`null` → sem cupom; `cupom: 10` → "Cupom inválido."; `DADOS_INVALIDOS` traz a lista `campos` corretamente |
| EXP-07 | 08/10 | Interface com todos os produtos | Vitrine com os 8 produtos e preços iguais aos da API. 8 produtos → R$ 849,40; "+" trava em 5 e "−" em 1 em todos; 5 de cada → R$ 4.247,00, cupom via **Enter** → R$ 3.822,30; remoção item a item com frete e faltante corretos; BUG-01 visível com 4× Garrafa e 1× Mochila + 2× Garrafa |
| EXP-08 | 08/10 | Fluxos de navegação e pedido | Pedido com cupom + frete grátis (Jaqueta) → R$ 206,91 correto; links do cabeçalho, banner, "Ver as regras", "Voltar ao carrinho" e "Continuar comprando" funcionam; rota inexistente mostra "Página não encontrada"; carrinho isolado por aba (outra aba abre vazia) |
| EXP-09 | 08/10 | Layout em tela de celular (390 px) | Vitrine, carrinho e checkout sem rolagem horizontal; no celular o cabeçalho mostra só o logo e o carrinho (Produtos/Documentação ficam acessíveis pelo logo e pelo banner) |

## 5. Testes repetitivos com apoio de IA

| ID | Data | Missão | Resultado |
|----|------|--------|-----------|
| EXP-01 | 07/10 | Comparar os cálculos da API com o cálculo esperado em centavos: 8 produtos × 1 a 5 unidades com cupom (40 combinações) e 28 pares + carrinho cheio, com e sem cupom (58 combinações) | Arredondamento e somas corretos (CA11). As **únicas** divergências são as combinações com subtotal exatamente 200,00 (P005×2, P008×4, P005+P008×2), que confirmam o BUG-01 |
| EXP-05 | 08/10 | Regressão da API: 8 produtos × 1–5 unidades, com e sem cupom (80); 28 pares × 2 quantidades × com/sem cupom; carrinho com todos os produtos (1 e 5 de cada); 13 pedidos (~330 chamadas sequenciais) | Preços, totais por item, desconto, arredondamento e frete corretos, **exceto** subtotal = R$ 200,00 (BUG-01, em `/calcular` e `/pedidos`) |
| EXP-06 | 08/10 | Testes negativos: 19 variações de cupom (caixa, espaço, tab/quebra de linha, letra cirílica, tipos errados, 500 caracteres), 12 de quantidade, 8 de id, estrutura de itens, corpo inválido, 50 casos de cliente, métodos e rotas | Conforme documentação, exceto: quantidade 99 e 1.000.000.000 aceitas (BUG-02), `{}`/`null`/`""` em `produtoId` (BUG-03) e nome/e-mail permissivos (BUG-04) |

## 6. Regressão automatizada

| Data | Testes | Resultado |
|---|---|---|
| 08/10/2026 | 69 (34 de interface, 35 de API) | Todos verdes. Os 12 testes marcados com `@bug` falham de propósito enquanto os bugs existirem. |

Como rodar: [README, seção Automação](../README.md#automação).

## 7. Observações (não reportadas como bug)

- `GET /api` devolve a página HTML da loja em vez de JSON.
- A API aceita `Content-Type: text/plain` e barra final na URL.
- Rota inexistente da interface responde HTTP 200 com a página "não encontrada" (comportamento normal de SPA).
- Comportamentos descritos em "Sobre este ambiente" na documentação: carrinho por aba, pedido fictício que não é armazenado (`/pedido-confirmado` mostra o último pedido da aba), ausência de e-mail e pagamento.
- Ids de produto diferenciam maiúsculas (`p001` → 404), ver interpretação [I-09](01-plano-de-teste.md#8-interpretações-da-documentação).

Testes de carga, estresse e segurança não foram executados (fora do escopo, ver [plano de teste](01-plano-de-teste.md#fora-do-escopo)).

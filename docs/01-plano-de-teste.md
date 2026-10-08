# Plano de teste — VZS-142 Cupom de desconto e frete grátis

| | |
|---|---|
| **Card** | VZS-142 — Cupom de desconto e frete grátis |
| **Versão** | 2.3.0 (publicada em 30/09/2026) |
| **Status do card** | Pronto para teste |
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev |
| **Documentação** | https://verzel-store.qa-test-verzel-store.workers.dev/documentacao |
| **Período de teste** | 07/10/2026 a 08/10/2026 |

## 1. Objetivo

Validar se a entrega VZS-142 atende aos critérios de aceite CA01 a CA11 e às regras de checkout que já existiam, na interface e na API, e reportar os desvios encontrados.

## 2. Escopo

### Dentro do escopo

| Área | O que é testado | Critérios |
|---|---|---|
| Cupom de desconto | Cupom válido, caixa e espaços, inválido, expirado, campo vazio, um cupom por vez, recálculo | CA01 a CA05, CA11 |
| Frete | Frete fixo abaixo de R$ 200,00, frete grátis a partir de R$ 200,00, subtotal antes do desconto, desconto fora do frete, aviso de faltante | CA06 a CA09 |
| Quantidade | Limite de 5 unidades por produto na interface e na API, quantidades inválidas, item duplicado | CA10 |
| Checkout | Pedido com cupom de ponta a ponta, validação de nome, e-mail e CEP | Regras pré-existentes |
| API | `GET /api/produtos`, `GET /api/produtos/{id}`, `POST /api/carrinho/calcular`, `POST /api/pedidos` e códigos de erro | Seção "API" da documentação |

### Fora do escopo

- Testes de carga, estresse e segurança: proibidos pelas regras do teste técnico, porque o ambiente é compartilhado entre candidatos.
- Login, cadastro de clientes, pagamento online e consulta de pedidos: fora do escopo segundo a própria documentação.
- Comportamentos listados em "Sobre este ambiente", que a documentação define como esperados (ver I-11).

## 3. Estratégia

| Tipo de teste | Forma de execução | Ferramenta | Entregável |
|---|---|---|---|
| Funcional pela interface | Manual | Chrome (desktop) | [Casos de teste](02-casos-de-teste/) e [relatório](03-relatorio-de-execucao.md) |
| Funcional e contrato da API | Manual | Postman | [Casos de teste](02-casos-de-teste/), [relatório](03-relatorio-de-execucao.md) e [collection](../postman) |
| Exploratório | Manual, por sessões com missão definida | Chrome e Postman | [Relatório, seção 4](03-relatorio-de-execucao.md#4-sessões-exploratórias-manuais) |
| Combinações em massa na API | Com apoio de IA, chamadas sequenciais comparadas com o cálculo esperado em centavos | Assistente de IA | [Relatório, seção 5](03-relatorio-de-execucao.md#5-testes-repetitivos-com-apoio-de-ia) |
| Regressão automatizada | Automática | Playwright + TypeScript | [`automation/`](../automation) |

Técnicas usadas no desenho dos casos: partição de equivalência (cupom válido, inválido e expirado), análise de valor limite (subtotal de R$ 199,80, R$ 200,00 e R$ 200,10; quantidade 0, 1, 5 e 6) e tabela de decisão (frete × cupom).

## 4. Ambiente e massa de dados

| Item | Valor |
|---|---|
| Navegador | Chrome (desktop) e viewport de 390 px para layout mobile |
| Cliente fictício | Maria Silva / maria@exemplo.com / 01310-100 |
| Produtos | P001 a P008, preços fixos da documentação |
| Cupons | `BEMVINDO10` (válido, 10%) e `VERAO2026` (expirado) |

## 5. Classificação dos bugs

| Severidade | Quando usar |
|---|---|
| Crítica | Impede a compra e não há contorno. |
| Alta | Viola um critério de aceite, com impacto no valor cobrado ou em uma regra de negócio. |
| Média | Funcionalidade secundária com comportamento incorreto, mas com contorno. |
| Baixa | Validação permissiva, mensagem ou contrato de erro inconsistente, sem impacto financeiro. |

A prioridade indica a ordem de correção sugerida e segue a severidade, salvo indicação no bug.

## 6. Critérios de entrada e saída

| | Critério | Situação |
|---|---|---|
| Entrada | Card em "Pronto para teste" e ambiente acessível | ✅ Atendido |
| Saída | 100% dos casos de teste executados | ✅ Atendido (31 de 31) |
| Saída | Nenhum bug de severidade crítica ou alta em aberto | ❌ Não atendido (BUG-01 e BUG-02) |

## 7. Riscos

| Risco | Mitigação |
|---|---|
| Ambiente compartilhado com outros candidatos | Execução sequencial, sem paralelismo, na automação e nas chamadas de API |
| Documentação com pontos ambíguos | Interpretações registradas na seção 8 |
| Regras validadas só no front-end | Cada regra testada também direto na API |

## 8. Interpretações da documentação

Pontos em que a documentação deixa margem para leitura e a interpretação adotada em cada um.

| # | Ponto da documentação | Interpretação adotada |
|---|-----------------------|-----------------------|
| I-01 | CA06: frete grátis "a partir de R$ 200,00, inclusive" | Subtotal **igual** a R$ 200,00 já tem frete grátis. |
| I-02 | CA08: frete grátis considera o subtotal antes do desconto | Com subtotal de R$ 200,00 e cupom de 10%, o total é R$ 180,00 com frete R$ 0,00, mesmo que o valor pago fique abaixo de R$ 200,00. |
| I-03 | CA10: "no máximo 5 unidades por pedido" | O limite é por produto. Como itens repetidos são bloqueados (`ITEM_DUPLICADO`), na prática vale por linha do carrinho. |
| I-04 | CA10: a regra vale "para a interface e para a API" | Os **dois** endpoints (`/carrinho/calcular` e `/pedidos`) devem retornar `QUANTIDADE_MAXIMA_EXCEDIDA` acima de 5. |
| I-05 | `/carrinho/calcular` com cupom inválido ou expirado responde 200 | Comportamento documentado, **não é bug**. Apenas `/pedidos` retorna 422. |
| I-06 | CA02: ignora espaços "no início e no fim" | Espaço no meio do código (`BEM VINDO10`) torna o cupom inválido. Tab e quebra de linha nas pontas são tratados como espaço. |
| I-07 | CA05: para trocar de cupom, o cliente remove o atual | Regra de interface (o campo some com um cupom aplicado). Na API o campo `cupom` é uma string única. |
| I-08 | Checkout: "nome e sobrenome" | Pelo menos duas palavras **com letras**. Nome composto só de números ou símbolos é inválido (base do BUG-04). |
| I-09 | Id de produto em minúsculas (`p001` → 404) | A documentação não especifica; não tratado como bug. |
| I-10 | No 201 o CEP volta sem hífen (`01310100`) | Normalização esperada, conforme o exemplo da própria documentação. |
| I-11 | Seção "Sobre este ambiente" | Não são bugs: carrinho guardado só na aba, pedido fictício e não armazenado, ausência de e-mail e cobrança, produtos/preços/cupons fixos, API sem estado. |
| I-12 | Regras do teste técnico: carga, estresse e segurança fora do escopo | Não executados, porque o ambiente é compartilhado entre candidatos. A execução da API foi feita com chamadas sequenciais, uma por vez. |

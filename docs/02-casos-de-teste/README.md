# Casos de teste — VZS-142

31 casos de teste escritos em Gherkin (português), divididos por funcionalidade:

| Arquivo | Funcionalidade | Casos |
|---|---|---|
| [`01-cupom.feature`](01-cupom.feature) | Cupom de desconto | CT-01 a CT-09 |
| [`02-frete.feature`](02-frete.feature) | Frete grátis | CT-10 a CT-16 |
| [`03-quantidade.feature`](03-quantidade.feature) | Limite de unidades | CT-17 a CT-20 |
| [`04-checkout.feature`](04-checkout.feature) | Finalização do pedido | CT-21 a CT-23c |
| [`05-api-contrato.feature`](05-api-contrato.feature) | Contrato da API | CT-24 a CT-25c |

Nos arquivos `.feature`, `Cenário` e `Esquema do Cenário` são palavras-chave do Gherkin. Cada um é um caso de teste, identificado pela tag `@CT-xx`. As outras tags indicam o critério de aceite (`@CA06`), a camada (`@ui`, `@api`), os casos de fumaça (`@smoke`) e os casos que reproduzem bugs (`@bug @BUG-01`).

## Índice

| ID | Caso de teste | Critério | Camada | Prioridade |
|----|---------------|----------|--------|-----------|
| CT-01 | Aplicar o cupom válido BEMVINDO10 | CA01, CA11 | UI + API | Alta |
| CT-02 | Cupom aceito sem diferenciar caixa e com espaços nas pontas | CA02 | UI + API | Alta |
| CT-03 | Espaço no meio do código invalida o cupom | CA02, CA03 | UI | Média |
| CT-04 | Cupom inexistente não aplica desconto | CA03 | UI + API | Alta |
| CT-05 | Cupom expirado não aplica desconto | CA04 | UI + API | Alta |
| CT-06 | Aplicar cupom com o campo vazio | — | UI | Baixa |
| CT-07 | Não é possível aplicar um segundo cupom | CA05 | UI | Média |
| CT-08 | Remover o cupom aplicado | CA05 | UI | Média |
| CT-09 | Desconto recalculado quando a quantidade muda | CA01 | UI | Média |
| CT-10 | Frete cobrado abaixo de R$ 200,00 com aviso de faltante | CA07 | UI + API | Alta |
| CT-11 | Frete grátis com subtotal exatamente R$ 200,00 | CA06 | UI + API | Alta |
| CT-12 | Frete grátis com subtotal acima de R$ 200,00 | CA06 | UI + API | Alta |
| CT-13 | Frete grátis avaliado pelo subtotal antes do desconto (no limite) | CA06, CA08 | UI + API | Alta |
| CT-14 | Desconto que reduz o valor abaixo de R$ 200,00 mantém o frete grátis | CA08 | UI + API | Alta |
| CT-15 | Desconto do cupom não incide sobre o frete | CA09 | UI + API | Alta |
| CT-16 | Frete e faltante atualizados ao remover um item | CA07 | UI | Média |
| CT-17 | Interface impede a 6ª unidade de um produto | CA10 | UI | Alta |
| CT-17b | Quantidade mínima no carrinho é 1 | — | UI | Baixa |
| CT-18 | API rejeita quantidade acima de 5 | CA10 | API | Alta |
| CT-19 | API rejeita quantidade inválida | — | API | Média |
| CT-20 | API rejeita o mesmo produto repetido | — | API | Média |
| CT-21 | Confirmar pedido com dados válidos e cupom aplicado | CA01, checkout | UI + API | Alta |
| CT-21b | Acessar o checkout com o carrinho vazio | Checkout | UI | Baixa |
| CT-22 | API rejeita pedido com cupom inválido ou expirado | CA03, CA04 | API | Alta |
| CT-23 | Validação de nome, e-mail e CEP | Checkout | UI + API | Média |
| CT-23b | CEP aceito com ou sem hífen | Checkout | UI + API | Média |
| CT-23c | Nome sem letras e e-mail malformado são recusados | Checkout | UI + API | Média |
| CT-24 | Produtos e cálculo do exemplo da documentação (inclui CT-24b a CT-24d) | CA01, CA03, CA04 | API | Média |
| CT-25 | Erros genéricos da API | Contrato | API | Baixa |
| CT-25b | Item sem `produtoId` é tratado como item inválido | Contrato | API | Baixa |
| CT-25c | Dados de cliente ausentes listam todos os campos | Contrato | API | Baixa |

## Matriz de rastreabilidade

| Critério | Descrição resumida | Casos de teste |
|---|---|---|
| CA01 | BEMVINDO10 dá 10% sobre o subtotal dos produtos | CT-01, CT-09, CT-21, CT-24 |
| CA02 | Cupom sem diferenciar caixa, ignorando espaços nas pontas | CT-02, CT-03 |
| CA03 | Cupom inexistente: "Cupom inválido." e sem desconto | CT-03, CT-04, CT-22, CT-24 |
| CA04 | Cupom expirado: "Cupom expirado." e sem desconto | CT-05, CT-22, CT-24 |
| CA05 | Um cupom por vez | CT-07, CT-08 |
| CA06 | Frete grátis a partir de R$ 200,00, inclusive | CT-11, CT-12, CT-13 |
| CA07 | Frete de R$ 19,90 abaixo de R$ 200,00 e aviso de faltante | CT-10, CT-16 |
| CA08 | Frete grátis pelo subtotal antes do desconto | CT-13, CT-14 |
| CA09 | Desconto não incide sobre o frete | CT-15 |
| CA10 | Máximo de 5 unidades por produto, na interface e na API | CT-17, CT-18 |
| CA11 | Valores arredondados para 2 casas decimais | CT-01 (e sessão exploratória EXP-01) |
| Checkout | Nome e sobrenome, e-mail válido, CEP com 8 dígitos | CT-21, CT-21b, CT-23, CT-23b, CT-23c |
| Contrato da API | Códigos de erro documentados | CT-19, CT-20, CT-24, CT-25, CT-25b, CT-25c |

O resultado de cada critério está no [relatório de execução](../03-relatorio-de-execucao.md#2-resultado-por-critério-de-aceite).

# Verzel Store — QA da entrega VZS-142

Validação da entrega **VZS-142 – Cupom de desconto e frete grátis** (v2.3.0) da [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/), feita para o teste técnico de QA Júnior da Verzel.

## Onde está cada entrega

| # | Entrega | Local |
|---|---|---|
| # | Entrega | Local |
|---|---|---|
| 1 | Plano de teste (escopo, estratégia, critérios e interpretações da documentação) | [`docs/01-plano-de-teste.md`](docs/01-plano-de-teste.md) |
| 2 | Casos de teste em Gherkin, com índice e matriz de rastreabilidade | [`docs/02-casos-de-teste/`](docs/02-casos-de-teste) |
| 3 | Relatório de execução (manual, exploratória e com apoio de IA) | [`docs/03-relatorio-de-execucao.md`](docs/03-relatorio-de-execucao.md) |
| 4 | Report de bugs | [`docs/04-bugs.md`](docs/04-bugs.md) |
| 5 | Evidências (prints da loja e do Postman) | [`docs/05-evidencias/`](docs/05-evidencias) |
| 6 | Collection Postman dos bugs de API | [`postman/`](postman) |
| 7 | Automação com Playwright | [`automation/`](automation) |

## Resultado

**Entrega reprovada:** 2 bugs de severidade alta violam os critérios de aceite CA06/CA08 e CA10. Detalhes no [relatório de execução](docs/03-relatorio-de-execucao.md#1-resumo-executivo).

| Casos de teste | ✅ Passou | ❌ Falhou | Critérios de aceite atendidos | Bugs |
|---|---|---|---|---|
| 31 (execução manual) | 26 | 5 | 8 de 11 | 4 (2 altos, 2 baixos) |

Além dos casos de teste, foram feitas 9 sessões exploratórias. Seis foram manuais e três, com combinações repetitivas em massa na API, foram feitas com apoio de IA.

| Bug | Descrição | Severidade |
|---|---|---|
| [BUG-01](docs/04-bugs.md#bug-01--frete-cobrado-quando-o-subtotal-é-exatamente-r-20000) | Frete cobrado quando o subtotal é exatamente R$ 200,00 (CA06/CA08) | Alta |
| [BUG-02](docs/04-bugs.md#bug-02--api-aceita-mais-de-5-unidades-por-produto) | API aceita mais de 5 unidades por produto (CA10) | Alta |
| [BUG-03](docs/04-bugs.md#bug-03--item-sem-produtoid-retorna-erro-inadequado) | Item sem `produtoId` retorna "Produto undefined não encontrado." | Baixa |
| [BUG-04](docs/04-bugs.md#bug-04--checkout-aceita-nome-sem-letras-e-e-mail-com-pontos-consecutivos) | Checkout aceita nome sem letras e e-mail com pontos consecutivos | Baixa |

## Automação

### Pré-requisitos

- Node.js 18 ou superior

### Como rodar

```bash
cd automation
npm install
npx playwright install chromium
npm test
```

| Comando | O que faz |
|---|---|
| `npm test` | Roda todos os testes (UI + API) |
| `npm run test:ui` | Só os testes de interface |
| `npm run test:api` | Só os testes de API |
| `npm run test:headed` | Testes de interface com o navegador visível |
| `npm run test:bugs` | Só os testes que reproduzem os bugs |
| `npm run report` | Abre o relatório HTML da última execução |
| `npx playwright test -g "CT-11"` | Roda só os testes cujo nome contém o ID informado |
| `npx playwright test -g "CT-21 " --project=ui --debug` | Abre o navegador e o Playwright Inspector para executar um teste passo a passo |

Para apontar para outro ambiente:

| Terminal | Comando |
|---|---|
| Bash (Linux, macOS, Git Bash) | `BASE_URL=https://outro-endereco npm test` |
| PowerShell (Windows) | `$env:BASE_URL="https://outro-endereco"; npm test` |

Para usar o Google Chrome instalado na máquina no lugar do Chromium do Playwright, defina `PW_CHANNEL=chrome` (ou `msedge` para o Edge), do mesmo jeito que o `BASE_URL`. Isso resolve o erro `browserType.launch: spawn UNKNOWN` que aparece em algumas máquinas Windows ao rodar com o navegador visível. No PowerShell:

| Para | Comando |
|---|---|
| Ver o Chrome executando os testes de interface | `$env:PW_CHANNEL="chrome"; npm run test:headed` |
| Executar um teste passo a passo (botão **Step over** do Inspector) | `$env:PW_CHANNEL="chrome"; npx playwright test -g "CT-21 " --project=ui --debug` |

### Como ler o resultado

- **Tudo verde é o resultado esperado.** Os 12 testes `@bug` falham de propósito enquanto os bugs existirem, e o Playwright conta essa falha como esperada (ver [Testes de bugs conhecidos](#testes-de-bugs-conhecidos)).
- **`expected to fail, but passed`** em um teste `@bug` quer dizer que o bug foi corrigido na loja.
- **Teste vermelho** é uma falha de verdade. O Playwright guarda print, vídeo e trace em `test-results/`, e eles aparecem no relatório aberto por `npm run report`.

### Cobertura

69 testes, organizados pelos IDs dos casos de teste (`CT-xx`):

| Arquivo | Cobre |
|---|---|
| `tests/ui/cupom.spec.ts` | Cupom válido, caixa e espaços, inválido, expirado, campo vazio, um cupom por vez, recálculo |
| `tests/ui/frete.spec.ts` | Frete abaixo/acima de R$ 200,00, limite exato, desconto x frete, aviso de faltante |
| `tests/ui/quantidade.spec.ts` | Limite de 5 unidades na vitrine e no carrinho, para todos os produtos |
| `tests/ui/checkout.spec.ts` | Pedido com cupom de ponta a ponta, validações de nome/e-mail/CEP, carrinho vazio |
| `tests/api/carrinho-api.spec.ts` | Cálculo para os 8 produtos × 1–5 unidades com e sem cupom, validações, pedidos e contrato de erros |

### Testes de bugs conhecidos

Os testes que reproduzem bugs estão marcados com a tag `@bug` e com `test.fail()`. Eles descrevem o comportamento **esperado** pela documentação, então hoje falham — e o Playwright reporta essa falha como esperada, mantendo a suíte verde.

Quando um bug for corrigido, o teste correspondente passa a ser reportado como *"expected to fail, but passed"*. Esse é o sinal para remover o `test.fail()` e transformá-lo em teste de regressão.

### Decisões

- **Execução sequencial (`workers: 1`)**: o ambiente é compartilhado entre candidatos; os testes não geram carga.
- **Page Objects** em `pages/` e massa de dados em `fixtures/`.
- **Oráculo de cálculo** (`fixtures/calculo.ts`): o valor esperado é calculado em centavos a partir das regras da documentação, independente da implementação.
- **Seletores por papel e rótulo acessível** (`getByRole`, `getByLabel`), com `data-valor` apenas para os valores do resumo.
- Trace, screenshot e vídeo são guardados apenas quando um teste falha.

## Postman

Importe os dois arquivos de [`postman/`](postman) no Postman, selecione o ambiente **Verzel Store** e rode a collection. Cada requisição tem testes que descrevem o comportamento esperado, então as falhas correspondem aos bugs.

Pelo terminal:

```bash
npx newman run postman/VZS-142.postman_collection.json -e postman/verzel-store.postman_environment.json
```

## Fora do escopo

Testes de carga, estresse e segurança não foram executados, conforme as regras do teste técnico (ambiente compartilhado). O escopo completo está no [plano de teste](docs/01-plano-de-teste.md#2-escopo).

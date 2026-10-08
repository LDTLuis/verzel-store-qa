import { test, expect, APIRequestContext } from '@playwright/test';
import { PRODUTOS, TODOS_PRODUTOS, CUPOM_VALIDO, CUPOM_EXPIRADO, CUPOM_INEXISTENTE, CLIENTE_VALIDO } from '../../fixtures/dados';
import { calcularEsperado, ItemCarrinho } from '../../fixtures/calculo';

const CALCULAR = '/api/carrinho/calcular';
const PEDIDOS = '/api/pedidos';

const corpo = (itens: ItemCarrinho[], cupom?: string) => ({
  itens: itens.map(i => ({ produtoId: i.produto.id, quantidade: i.quantidade })),
  ...(cupom !== undefined ? { cupom } : {}),
});

async function calcular(request: APIRequestContext, data: unknown) {
  const resposta = await request.post(CALCULAR, { data });
  return { status: resposta.status(), json: await resposta.json() };
}

test.describe('API - produtos', () => {
  test('CT-24 lista os 8 produtos com os preços da documentação', { tag: ['@smoke'] }, async ({ request }) => {
    const resposta = await request.get('/api/produtos');
    expect(resposta.status()).toBe(200);

    const produtos: Array<{ id: string; nome: string; preco: number }> = await resposta.json();
    expect(produtos).toHaveLength(8);
    for (const esperado of TODOS_PRODUTOS) {
      expect(produtos).toContainEqual(expect.objectContaining({
        id: esperado.id, nome: esperado.nome, preco: esperado.precoCentavos / 100,
      }));
    }
  });

  test('CT-24b produto inexistente retorna 404', async ({ request }) => {
    const resposta = await request.get('/api/produtos/P999');
    expect(resposta.status()).toBe(404);
    expect((await resposta.json()).erro.codigo).toBe('PRODUTO_NAO_ENCONTRADO');
  });
});

test.describe('API - cálculo do carrinho', () => {
  for (const produto of TODOS_PRODUTOS) {
    test(`regras de cálculo para ${produto.id} de 1 a 5 unidades, com e sem cupom`, { tag: ['@CA01', '@CA06', '@CA07', '@CA11'] }, async ({ request }) => {
      for (let quantidade = 1; quantidade <= 5; quantidade++) {
        for (const cupom of [undefined, CUPOM_VALIDO]) {
          const itens = [{ produto, quantidade }];
          const esperado = calcularEsperado(itens, !!cupom);
          if (esperado.subtotal === 200) continue;

          const { status, json } = await calcular(request, corpo(itens, cupom));

          expect.soft(status, `${produto.id} x${quantidade} ${cupom ?? ''}`).toBe(200);
          expect.soft(json, `${produto.id} x${quantidade} ${cupom ?? ''}`).toMatchObject(esperado);
        }
      }
    });
  }

  test('CT-24c reproduz o exemplo da documentação', async ({ request }) => {
    const { status, json } = await calcular(request, corpo(
      [{ produto: PRODUTOS.calca, quantidade: 1 }, { produto: PRODUTOS.bone, quantidade: 2 }], CUPOM_VALIDO,
    ));

    expect(status).toBe(200);
    expect(json).toMatchObject({ subtotal: 239.7, desconto: 23.97, frete: 0, freteGratis: true, total: 215.73 });
    expect(json.cupom).toEqual({ codigo: CUPOM_VALIDO, aplicado: true, mensagem: 'Cupom aplicado: 10% de desconto nos produtos.' });
  });

  for (const [codigo, mensagem] of [[CUPOM_INEXISTENTE, 'Cupom inválido.'], [CUPOM_EXPIRADO, 'Cupom expirado.']]) {
    test(`CT-24d cupom ${codigo} não gera desconto nem erro no cálculo`, { tag: ['@CA03', '@CA04'] }, async ({ request }) => {
      const { status, json } = await calcular(request, corpo([{ produto: PRODUTOS.camiseta, quantidade: 1 }], codigo));

      expect(status).toBe(200);
      expect(json.desconto).toBe(0);
      expect(json.cupom).toMatchObject({ aplicado: false, mensagem });
    });
  }

  for (const subtotal200 of [
    [{ produto: PRODUTOS.mochila, quantidade: 2 }],
    [{ produto: PRODUTOS.garrafa, quantidade: 4 }],
  ]) {
    test(`CT-11 frete grátis com subtotal R$ 200,00 (${subtotal200[0].produto.id} x${subtotal200[0].quantidade})`, {
      tag: ['@CA06', '@bug'],
      annotation: { type: 'bug', description: 'BUG-01 - frete cobrado com subtotal igual a R$ 200,00' },
    }, async ({ request }) => {
      test.fail();
      const { json } = await calcular(request, corpo(subtotal200));

      expect(json).toMatchObject({ subtotal: 200, frete: 0, freteGratis: true, total: 200 });
    });
  }
});

test.describe('API - validações de itens', () => {
  for (const quantidade of [0, -1, 1.5, '2', null]) {
    test(`CT-19 quantidade ${JSON.stringify(quantidade)} é recusada`, async ({ request }) => {
      const { status, json } = await calcular(request, { itens: [{ produtoId: 'P006', quantidade }] });

      expect(status).toBe(422);
      expect(json.erro).toMatchObject({ codigo: 'QUANTIDADE_INVALIDA', campo: 'itens[0].quantidade' });
    });
  }

  test('CT-20 produto repetido na lista é recusado', async ({ request }) => {
    const { status, json } = await calcular(request, {
      itens: [{ produtoId: 'P006', quantidade: 3 }, { produtoId: 'P006', quantidade: 3 }],
    });

    expect(status).toBe(422);
    expect(json.erro).toMatchObject({ codigo: 'ITEM_DUPLICADO', campo: 'itens[1].produtoId' });
  });

  for (const [endpoint, quantidade] of [[CALCULAR, 6], [CALCULAR, 99], [PEDIDOS, 6]] as const) {
    test(`CT-18 ${endpoint} recusa quantidade ${quantidade}`, {
      tag: ['@CA10', '@bug'],
      annotation: { type: 'bug', description: 'BUG-02 - API aceita mais de 5 unidades por produto' },
    }, async ({ request }) => {
      test.fail();
      const resposta = await request.post(endpoint, {
        data: { cliente: CLIENTE_VALIDO, itens: [{ produtoId: 'P005', quantidade }] },
      });

      expect(resposta.status()).toBe(422);
      expect((await resposta.json()).erro?.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
    });
  }

  test('CT-25b item sem produtoId é tratado como item inválido', {
    tag: ['@bug'],
    annotation: { type: 'bug', description: 'BUG-03 - retorna "Produto undefined não encontrado."' },
  }, async ({ request }) => {
    test.fail();
    const { status, json } = await calcular(request, { itens: [{ quantidade: 1 }] });

    expect(status).toBe(422);
    expect(json.erro.codigo).toBe('ITEM_INVALIDO');
    expect(json.erro.mensagem).not.toContain('undefined');
  });
});

test.describe('API - pedidos', () => {
  test('cria pedido com cupom e devolve o CEP normalizado', { tag: ['@smoke'] }, async ({ request }) => {
    const resposta = await request.post(PEDIDOS, {
      data: { cliente: CLIENTE_VALIDO, ...corpo([{ produto: PRODUTOS.camiseta, quantidade: 2 }], CUPOM_VALIDO) },
    });

    expect(resposta.status()).toBe(201);
    const pedido = await resposta.json();
    expect(pedido.numero).toMatch(/^VZ-\d{6}$/);
    expect(pedido.cliente.cep).toBe('01310100');
    expect(pedido).toMatchObject({ subtotal: 119.8, desconto: 11.98, frete: 19.9, total: 127.72 });
  });

  for (const [cupom, codigo] of [[CUPOM_INEXISTENTE, 'CUPOM_INVALIDO'], [CUPOM_EXPIRADO, 'CUPOM_EXPIRADO']]) {
    test(`CT-22 pedido com cupom ${cupom} é recusado`, { tag: ['@CA03', '@CA04'] }, async ({ request }) => {
      const resposta = await request.post(PEDIDOS, {
        data: { cliente: CLIENTE_VALIDO, ...corpo([{ produto: PRODUTOS.camiseta, quantidade: 1 }], cupom) },
      });

      expect(resposta.status()).toBe(422);
      expect((await resposta.json()).erro.codigo).toBe(codigo);
    });
  }

  test('CT-25c cliente ausente lista todos os campos obrigatórios', async ({ request }) => {
    const resposta = await request.post(PEDIDOS, { data: corpo([{ produto: PRODUTOS.camiseta, quantidade: 1 }]) });

    expect(resposta.status()).toBe(422);
    const { erro } = await resposta.json();
    expect(erro.codigo).toBe('DADOS_INVALIDOS');
    expect(erro.campos.map((c: { campo: string }) => c.campo)).toEqual(
      expect.arrayContaining(['cliente.nome', 'cliente.email', 'cliente.cep']),
    );
  });

  for (const [campo, valor] of [['nome', '12345 67890'], ['email', 'maria@exemplo..com']]) {
    test(`CT-23c cliente.${campo} "${valor}" deveria ser recusado`, {
      tag: ['@bug'],
      annotation: { type: 'bug', description: 'BUG-04 - checkout aceita nome sem letras e e-mail malformado' },
    }, async ({ request }) => {
      test.fail();
      const resposta = await request.post(PEDIDOS, {
        data: { cliente: { ...CLIENTE_VALIDO, [campo]: valor }, ...corpo([{ produto: PRODUTOS.camiseta, quantidade: 1 }]) },
      });

      expect(resposta.status()).toBe(422);
      expect((await resposta.json()).erro?.campos?.map((c: { campo: string }) => c.campo)).toContain(`cliente.${campo}`);
    });
  }
});

test.describe('API - contrato de erros', () => {
  test('CT-25 JSON inválido retorna 400', async ({ request }) => {
    const resposta = await request.post(CALCULAR, { headers: { 'Content-Type': 'application/json' }, data: '{x' });
    expect(resposta.status()).toBe(400);
    expect((await resposta.json()).erro.codigo).toBe('JSON_INVALIDO');
  });

  test('CT-25 método não permitido retorna 405', async ({ request }) => {
    const resposta = await request.get(CALCULAR);
    expect(resposta.status()).toBe(405);
    expect((await resposta.json()).erro.codigo).toBe('METODO_NAO_PERMITIDO');
  });

  test('CT-25 rota inexistente retorna 404', async ({ request }) => {
    const resposta = await request.get('/api/rota-inexistente');
    expect(resposta.status()).toBe(404);
    expect((await resposta.json()).erro.codigo).toBe('ROTA_NAO_ENCONTRADA');
  });

  test('CT-25 lista de itens vazia retorna 422', async ({ request }) => {
    const { status, json } = await calcular(request, { itens: [] });
    expect(status).toBe(422);
    expect(json.erro.codigo).toBe('ITENS_OBRIGATORIOS');
  });
});

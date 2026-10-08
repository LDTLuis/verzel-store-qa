import { test, expect } from '@playwright/test';
import { VitrinePage } from '../../pages/VitrinePage';
import { CarrinhoPage } from '../../pages/CarrinhoPage';
import { PRODUTOS, CUPOM_VALIDO } from '../../fixtures/dados';
import { calcularEsperado, ItemCarrinho } from '../../fixtures/calculo';

test.describe('Frete grátis a partir de R$ 200,00', () => {
  let vitrine: VitrinePage;
  let carrinho: CarrinhoPage;

  test.beforeEach(async ({ page }) => {
    vitrine = new VitrinePage(page);
    carrinho = new CarrinhoPage(page);
    await vitrine.abrir();
  });

  async function montarCarrinho(itens: ItemCarrinho[]) {
    for (const item of itens) await vitrine.adicionar(item.produto, item.quantidade);
    await vitrine.irParaCarrinho();
  }

  const abaixoDoLimite = [
    { itens: [{ produto: PRODUTOS.tenis, quantidade: 1 }], faltante: 'R$ 10,10' },
    { itens: [{ produto: PRODUTOS.calca, quantidade: 1 }, { produto: PRODUTOS.camiseta, quantidade: 1 }], faltante: 'R$ 0,20' },
    { itens: [{ produto: PRODUTOS.meias, quantidade: 1 }], faltante: 'R$ 170,10' },
  ];

  for (const caso of abaixoDoLimite) {
    const descricao = caso.itens.map(i => `${i.quantidade}x ${i.produto.nome}`).join(' + ');
    test(`CT-10 cobra frete e informa o faltante: ${descricao}`, { tag: ['@CA07'] }, async () => {
      await montarCarrinho(caso.itens);

      await carrinho.resumo.validar(calcularEsperado(caso.itens, false));
      await expect(carrinho.resumo.avisoFreteGratis).toHaveText(`Faltam ${caso.faltante} para o frete grátis.`);
    });
  }

  test('CT-12 frete grátis acima de R$ 200,00', { tag: ['@CA06'] }, async () => {
    await montarCarrinho([{ produto: PRODUTOS.jaqueta, quantidade: 1 }]);

    await expect(carrinho.resumo.frete).toHaveText('Grátis');
    await expect(carrinho.resumo.avisoFreteGratis).toHaveCount(0);
  });

  test('CT-11 frete grátis com subtotal exatamente R$ 200,00', {
    tag: ['@CA06', '@bug'],
    annotation: { type: 'bug', description: 'BUG-01 - frete cobrado com subtotal igual a R$ 200,00' },
  }, async () => {
    test.fail();
    await montarCarrinho([{ produto: PRODUTOS.mochila, quantidade: 2 }]);

    await carrinho.resumo.validar({ subtotal: 200, desconto: 0, frete: 0, total: 200 });
    await expect(carrinho.resumo.avisoFreteGratis).toHaveCount(0);
  });

  test('CT-13 frete grátis usa o subtotal antes do desconto (limite)', {
    tag: ['@CA08', '@bug'],
    annotation: { type: 'bug', description: 'BUG-01 - frete cobrado com subtotal igual a R$ 200,00' },
  }, async () => {
    test.fail();
    await montarCarrinho([{ produto: PRODUTOS.mochila, quantidade: 2 }]);
    await carrinho.aplicarCupom(CUPOM_VALIDO);

    await carrinho.resumo.validar({ subtotal: 200, desconto: 20, frete: 0, total: 180 });
  });

  test('CT-14 desconto que leva abaixo de R$ 200,00 mantém o frete grátis', { tag: ['@CA08'] }, async () => {
    await montarCarrinho([{ produto: PRODUTOS.jaqueta, quantidade: 1 }]);
    await carrinho.aplicarCupom(CUPOM_VALIDO);

    await carrinho.resumo.validar({ subtotal: 229.9, desconto: 22.99, frete: 0, total: 206.91 });
  });

  test('CT-15 desconto não incide sobre o frete', { tag: ['@CA09'] }, async () => {
    await montarCarrinho([{ produto: PRODUTOS.mochila, quantidade: 1 }]);
    await carrinho.aplicarCupom(CUPOM_VALIDO);

    await carrinho.resumo.validar({ subtotal: 100, desconto: 10, frete: 19.9, total: 109.9 });
  });

  test('CT-16 frete e faltante são atualizados ao remover item', { tag: ['@CA07'] }, async () => {
    await montarCarrinho([
      { produto: PRODUTOS.calca, quantidade: 1 },
      { produto: PRODUTOS.camiseta, quantidade: 2 },
    ]);
    await expect(carrinho.resumo.frete).toHaveText('Grátis');

    await carrinho.remover(PRODUTOS.calca);

    await carrinho.resumo.validar({ subtotal: 119.8, desconto: 0, frete: 19.9, total: 139.7 });
    await expect(carrinho.resumo.avisoFreteGratis).toHaveText('Faltam R$ 80,20 para o frete grátis.');
  });
});

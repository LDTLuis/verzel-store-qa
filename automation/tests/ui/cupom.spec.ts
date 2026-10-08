import { test, expect } from '@playwright/test';
import { VitrinePage } from '../../pages/VitrinePage';
import { CarrinhoPage } from '../../pages/CarrinhoPage';
import { PRODUTOS, CUPOM_VALIDO, CUPOM_EXPIRADO, CUPOM_INEXISTENTE } from '../../fixtures/dados';
import { calcularEsperado } from '../../fixtures/calculo';

test.describe('Cupom de desconto', () => {
  let vitrine: VitrinePage;
  let carrinho: CarrinhoPage;

  test.beforeEach(async ({ page }) => {
    vitrine = new VitrinePage(page);
    carrinho = new CarrinhoPage(page);
    await vitrine.abrir();
  });

  test('CT-01 aplica BEMVINDO10 com 10% sobre o subtotal', { tag: ['@smoke', '@CA01', '@CA11'] }, async () => {
    await vitrine.adicionar(PRODUTOS.calca);
    await vitrine.adicionar(PRODUTOS.bone, 2);
    await vitrine.irParaCarrinho();

    await carrinho.aplicarCupom(CUPOM_VALIDO);

    await expect(carrinho.cupomAplicado).toHaveText(`Cupom ${CUPOM_VALIDO} aplicado.`);
    await carrinho.resumo.validar({ subtotal: 239.7, desconto: 23.97, frete: 0, total: 215.73 });
  });

  for (const codigo of ['bemvindo10', 'BemVindo10', '  BEMVINDO10  ']) {
    test(`CT-02 aceita o cupom digitado como "${codigo}"`, { tag: ['@CA02'] }, async () => {
      await vitrine.adicionar(PRODUTOS.camiseta);
      await vitrine.irParaCarrinho();

      await carrinho.aplicarCupom(codigo);

      await expect(carrinho.cupomAplicado).toHaveText(`Cupom ${CUPOM_VALIDO} aplicado.`);
      await expect(carrinho.resumo.desconto).toHaveText('- R$ 5,99');
    });
  }

  const recusados = [
    { id: 'CT-03', codigo: 'BEM VINDO10', mensagem: 'Cupom inválido.', tag: '@CA03' },
    { id: 'CT-04', codigo: CUPOM_INEXISTENTE, mensagem: 'Cupom inválido.', tag: '@CA03' },
    { id: 'CT-05', codigo: CUPOM_EXPIRADO, mensagem: 'Cupom expirado.', tag: '@CA04' },
    { id: 'CT-06', codigo: '', mensagem: 'Informe um cupom.', tag: '@CA03' },
  ];

  for (const caso of recusados) {
    test(`${caso.id} recusa o cupom "${caso.codigo}" com "${caso.mensagem}"`, { tag: [caso.tag] }, async () => {
      await vitrine.adicionar(PRODUTOS.camiseta);
      await vitrine.irParaCarrinho();

      await carrinho.aplicarCupom(caso.codigo);

      await expect(carrinho.mensagemCupom).toHaveText(caso.mensagem);
      await expect(carrinho.cupomAplicado).toHaveCount(0);
      await carrinho.resumo.validar({ subtotal: 59.9, desconto: 0, frete: 19.9, total: 79.8 });
    });
  }

  test('CT-07/CT-08 só permite um cupom por vez e volta ao valor cheio ao remover', { tag: ['@CA05'] }, async () => {
    await vitrine.adicionar(PRODUTOS.mochila);
    await vitrine.irParaCarrinho();
    await carrinho.aplicarCupom(CUPOM_VALIDO);
    await expect(carrinho.cupomAplicado).toBeVisible();

    await expect(carrinho.campoCupom).toHaveCount(0);
    await expect(carrinho.botaoAplicarCupom).toHaveCount(0);

    await carrinho.removerCupom();

    await carrinho.resumo.validar({ subtotal: 100, desconto: 0, frete: 19.9, total: 119.9 });
  });

  test('CT-09 recalcula o desconto quando a quantidade muda', { tag: ['@CA01'] }, async () => {
    await vitrine.adicionar(PRODUTOS.mochila);
    await vitrine.irParaCarrinho();
    await carrinho.aplicarCupom(CUPOM_VALIDO);
    await expect(carrinho.resumo.desconto).toHaveText('- R$ 10,00');

    await carrinho.aumentar(PRODUTOS.mochila);
    await carrinho.aumentar(PRODUTOS.mochila);

    await carrinho.resumo.validar(calcularEsperado([{ produto: PRODUTOS.mochila, quantidade: 3 }], true));
  });
});

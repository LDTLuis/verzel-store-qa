import { test, expect } from '@playwright/test';
import { VitrinePage } from '../../pages/VitrinePage';
import { CarrinhoPage } from '../../pages/CarrinhoPage';
import { PRODUTOS, TODOS_PRODUTOS, LIMITE_POR_PRODUTO } from '../../fixtures/dados';
import { calcularEsperado } from '../../fixtures/calculo';

test.describe('Limite de 5 unidades por produto', () => {
  test('CT-17 vitrine bloqueia a 6ª unidade', { tag: ['@CA10'] }, async ({ page }) => {
    const vitrine = new VitrinePage(page);
    await vitrine.abrir();

    await vitrine.adicionar(PRODUTOS.mochila, LIMITE_POR_PRODUTO);

    await expect(vitrine.botaoAdicionar(PRODUTOS.mochila)).toBeDisabled();
    await expect(vitrine.avisoLimite(PRODUTOS.mochila)).toHaveText('Limite de 5 unidades atingido.');
    expect(await vitrine.quantidadeNoCarrinho()).toBe(LIMITE_POR_PRODUTO);
  });

  test('CT-17 carrinho trava em 5 e em 1 para todos os produtos', { tag: ['@CA10'] }, async ({ page }) => {
    const vitrine = new VitrinePage(page);
    const carrinho = new CarrinhoPage(page);
    await vitrine.abrir();
    for (const produto of TODOS_PRODUTOS) await vitrine.adicionar(produto);
    await vitrine.irParaCarrinho();

    for (const produto of TODOS_PRODUTOS) {
      await expect(carrinho.botaoDiminuir(produto)).toBeDisabled();
      while (Number(await carrinho.quantidade(produto).innerText()) < LIMITE_POR_PRODUTO) {
        await carrinho.aumentar(produto);
      }
      await expect(carrinho.botaoAumentar(produto)).toBeDisabled();
    }

    const esperado = calcularEsperado(TODOS_PRODUTOS.map(produto => ({ produto, quantidade: 5 })), false);
    await carrinho.resumo.validar(esperado);
  });
});

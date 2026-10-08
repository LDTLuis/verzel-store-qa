import { test, expect, Page } from '@playwright/test';
import { VitrinePage } from '../../pages/VitrinePage';
import { CarrinhoPage } from '../../pages/CarrinhoPage';
import { CheckoutPage, ConfirmacaoPage } from '../../pages/CheckoutPage';
import { PRODUTOS, CUPOM_VALIDO, CLIENTE_VALIDO } from '../../fixtures/dados';

async function irParaCheckoutCom(page: Page, cupom?: string) {
  const vitrine = new VitrinePage(page);
  const carrinho = new CarrinhoPage(page);
  await vitrine.abrir();
  await vitrine.adicionar(PRODUTOS.camiseta, 2);
  await vitrine.irParaCarrinho();
  if (cupom) {
    await carrinho.aplicarCupom(cupom);
    await expect(carrinho.cupomAplicado).toBeVisible();
  }
  await carrinho.irParaCheckout();
  return new CheckoutPage(page);
}

test.describe('Finalização do pedido', () => {
  test('CT-21 confirma pedido com cupom e mantém os valores do carrinho', { tag: ['@smoke'] }, async ({ page }) => {
    const checkout = await irParaCheckoutCom(page, CUPOM_VALIDO);

    await checkout.confirmar(CLIENTE_VALIDO);

    const confirmacao = new ConfirmacaoPage(page);
    await confirmacao.aguardar();
    await expect(confirmacao.agradecimento).toContainText('Obrigado, Maria.');
    await confirmacao.resumo.validar({ subtotal: 119.8, desconto: 11.98, frete: 19.9, total: 127.72 });
    expect(await new VitrinePage(page).quantidadeNoCarrinho()).toBe(0);
  });

  test('CT-21b checkout com carrinho vazio volta para o carrinho', async ({ page }) => {
    await page.goto('/checkout');

    await expect(page).toHaveURL(/\/carrinho$/);
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();
  });

  const invalidos = [
    { campo: 'nome', valor: '', mensagem: 'Informe o nome completo.' },
    { campo: 'nome', valor: 'Maria', mensagem: 'Informe nome e sobrenome.' },
    { campo: 'email', valor: 'maria@', mensagem: 'Informe um e-mail válido.' },
    { campo: 'email', valor: 'maria@exemplo', mensagem: 'Informe um e-mail válido.' },
    { campo: 'cep', valor: '1310-100', mensagem: 'Informe um CEP com 8 dígitos.' },
    { campo: 'cep', valor: '013101000', mensagem: 'Informe um CEP com 8 dígitos.' },
    { campo: 'cep', valor: 'abcde-fgh', mensagem: 'Informe um CEP com 8 dígitos.' },
  ] as const;

  for (const caso of invalidos) {
    test(`CT-23 ${caso.campo} "${caso.valor}" é recusado`, async ({ page }) => {
      const checkout = await irParaCheckoutCom(page);

      await checkout.confirmar({ ...CLIENTE_VALIDO, [caso.campo]: caso.valor });

      const erro = { nome: checkout.erroNome, email: checkout.erroEmail, cep: checkout.erroCep }[caso.campo];
      await expect(erro).toHaveText(caso.mensagem);
      await expect(page).toHaveURL(/\/checkout$/);
    });
  }

  for (const cep of ['01310100', '01310-100']) {
    test(`CT-23b aceita CEP "${cep}"`, async ({ page }) => {
      const checkout = await irParaCheckoutCom(page);

      await checkout.confirmar({ ...CLIENTE_VALIDO, cep });

      await new ConfirmacaoPage(page).aguardar();
    });
  }

  const bug04 = [
    { campo: 'nome', valor: '12345 67890', erro: 'Informe nome e sobrenome.' },
    { campo: 'email', valor: 'maria@exemplo..com', erro: 'Informe um e-mail válido.' },
  ] as const;

  for (const caso of bug04) {
    test(`CT-23c ${caso.campo} "${caso.valor}" deveria ser recusado`, {
      tag: ['@bug'],
      annotation: { type: 'bug', description: 'BUG-04 - checkout aceita nome sem letras e e-mail malformado' },
    }, async ({ page }) => {
      test.fail();
      const checkout = await irParaCheckoutCom(page);

      await checkout.confirmar({ ...CLIENTE_VALIDO, [caso.campo]: caso.valor });

      const erro = caso.campo === 'nome' ? checkout.erroNome : checkout.erroEmail;
      await expect(erro).toHaveText(caso.erro, { timeout: 5_000 });
    });
  }
});

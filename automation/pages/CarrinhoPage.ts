import { expect, Locator, Page } from '@playwright/test';
import { Produto } from '../fixtures/dados';
import { ResumoPedido } from './ResumoPedido';

export class CarrinhoPage {
  readonly resumo: ResumoPedido;
  readonly campoCupom: Locator;
  readonly botaoAplicarCupom: Locator;
  readonly botaoRemoverCupom: Locator;
  readonly mensagemCupom: Locator;
  readonly cupomAplicado: Locator;
  readonly finalizarCompra: Locator;

  constructor(private readonly page: Page) {
    this.resumo = new ResumoPedido(page);
    this.campoCupom = page.getByLabel('Cupom de desconto');
    this.botaoAplicarCupom = page.getByRole('button', { name: 'Aplicar cupom' });
    this.botaoRemoverCupom = page.getByRole('button', { name: 'Remover cupom' });
    this.mensagemCupom = page.locator('#mensagem-cupom');
    this.cupomAplicado = page.getByText(/^Cupom .+ aplicado\.$/);
    this.finalizarCompra = page.getByRole('link', { name: 'Finalizar compra' });
  }

  async abrir() {
    await this.page.goto('/carrinho');
  }

  quantidade(produto: Produto): Locator {
    return this.page.getByRole('group', { name: `Quantidade de ${produto.nome}` }).locator('output');
  }

  botaoAumentar(produto: Produto): Locator {
    return this.page.getByRole('button', { name: `Aumentar quantidade de ${produto.nome}` });
  }

  botaoDiminuir(produto: Produto): Locator {
    return this.page.getByRole('button', { name: `Diminuir quantidade de ${produto.nome}` });
  }

  async aumentar(produto: Produto) {
    const atual = Number(await this.quantidade(produto).innerText());
    await this.botaoAumentar(produto).click();
    await expect(this.quantidade(produto)).toHaveText(String(atual + 1));
  }

  async remover(produto: Produto) {
    await this.page.getByRole('button', { name: `Remover ${produto.nome} do carrinho` }).click();
    await expect(this.page.getByRole('heading', { name: produto.nome })).toHaveCount(0);
  }

  async aplicarCupom(codigo: string) {
    await this.campoCupom.fill(codigo);
    await this.botaoAplicarCupom.click();
  }

  async removerCupom() {
    await this.botaoRemoverCupom.click();
    await expect(this.campoCupom).toBeVisible();
  }

  async irParaCheckout() {
    await this.finalizarCompra.click();
    await expect(this.page).toHaveURL(/\/checkout$/);
  }
}

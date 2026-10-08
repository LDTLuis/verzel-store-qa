import { expect, Locator, Page } from '@playwright/test';
import { Produto } from '../fixtures/dados';

export class VitrinePage {
  readonly contadorCarrinho: Locator;

  constructor(private readonly page: Page) {
    this.contadorCarrinho = page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: /Carrinho/ });
  }

  async abrir() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Produtos' })).toBeVisible();
  }

  card(produto: Produto): Locator {
    return this.page.getByRole('article', { name: produto.nome });
  }

  botaoAdicionar(produto: Produto): Locator {
    return this.card(produto).getByRole('button', { name: 'Adicionar ao carrinho' });
  }

  avisoLimite(produto: Produto): Locator {
    return this.page.locator(`#aviso-${produto.id}`);
  }

  async adicionar(produto: Produto, quantidade = 1) {
    for (let i = 0; i < quantidade; i++) {
      const antes = await this.quantidadeNoCarrinho();
      await this.botaoAdicionar(produto).click();
      await expect.poll(() => this.quantidadeNoCarrinho()).toBe(antes + 1);
    }
  }

  async quantidadeNoCarrinho(): Promise<number> {
    const texto = (await this.contadorCarrinho.innerText()).replace(/\D/g, '');
    return Number(texto || 0);
  }

  async irParaCarrinho() {
    await this.contadorCarrinho.click();
    await expect(this.page).toHaveURL(/\/carrinho$/);
  }
}

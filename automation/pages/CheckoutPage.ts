import { expect, Locator, Page } from '@playwright/test';
import { ResumoPedido } from './ResumoPedido';

export type DadosCliente = { nome: string; email: string; cep: string };

export class CheckoutPage {
  readonly nome: Locator;
  readonly email: Locator;
  readonly cep: Locator;
  readonly erroNome: Locator;
  readonly erroEmail: Locator;
  readonly erroCep: Locator;
  readonly confirmarPedido: Locator;

  constructor(private readonly page: Page) {
    this.nome = page.getByLabel('Nome completo');
    this.email = page.getByLabel('E-mail');
    this.cep = page.getByLabel('CEP');
    this.erroNome = page.locator('#campo-nome-erro');
    this.erroEmail = page.locator('#campo-email-erro');
    this.erroCep = page.locator('#campo-cep-erro');
    this.confirmarPedido = page.getByRole('button', { name: 'Confirmar pedido' });
  }

  async preencher(dados: DadosCliente) {
    await this.nome.fill(dados.nome);
    await this.email.fill(dados.email);
    await this.cep.fill(dados.cep);
  }

  async confirmar(dados: DadosCliente) {
    await this.preencher(dados);
    await this.confirmarPedido.click();
  }
}

export class ConfirmacaoPage {
  readonly numeroPedido: Locator;
  readonly agradecimento: Locator;
  readonly resumo: ResumoPedido;

  constructor(private readonly page: Page) {
    this.numeroPedido = page.getByRole('heading', { level: 1 });
    this.agradecimento = page.getByText(/^Obrigado, /);
    this.resumo = new ResumoPedido(page);
  }

  async aguardar() {
    await expect(this.page).toHaveURL(/\/pedido-confirmado$/);
    await expect(this.numeroPedido).toHaveText(/VZ-\d{6}/);
  }
}

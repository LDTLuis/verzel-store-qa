import { expect, Locator, Page } from '@playwright/test';
import { brl, ResumoEsperado } from '../fixtures/calculo';

export class ResumoPedido {
  readonly subtotal: Locator;
  readonly desconto: Locator;
  readonly frete: Locator;
  readonly total: Locator;
  readonly avisoFreteGratis: Locator;

  constructor(page: Page) {
    const resumo = page.locator('section[aria-labelledby="titulo-resumo"]');
    this.subtotal = resumo.locator('[data-valor="subtotal"]');
    this.desconto = resumo.locator('[data-valor="desconto"]');
    this.frete = resumo.locator('[data-valor="frete"]');
    this.total = resumo.locator('[data-valor="total"]');
    this.avisoFreteGratis = resumo.getByText(/^Faltam R\$ .* para o frete grátis\.$/);
  }

  async validar(esperado: Pick<ResumoEsperado, 'subtotal' | 'desconto' | 'frete' | 'total'>) {
    await expect(this.subtotal).toHaveText(brl(esperado.subtotal));
    await expect(this.desconto).toHaveText(esperado.desconto > 0 ? `- ${brl(esperado.desconto)}` : brl(0));
    await expect(this.frete).toHaveText(esperado.frete === 0 ? 'Grátis' : brl(esperado.frete));
    await expect(this.total).toHaveText(brl(esperado.total));
  }
}

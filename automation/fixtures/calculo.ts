import { FRETE_CENTAVOS, FRETE_GRATIS_A_PARTIR_CENTAVOS, Produto } from './dados';

export type ItemCarrinho = { produto: Produto; quantidade: number };

export type ResumoEsperado = {
  subtotal: number;
  desconto: number;
  frete: number;
  freteGratis: boolean;
  valorFaltanteFreteGratis: number;
  total: number;
};

export function calcularEsperado(itens: ItemCarrinho[], comCupom: boolean): ResumoEsperado {
  const subtotal = itens.reduce((soma, i) => soma + i.produto.precoCentavos * i.quantidade, 0);
  const desconto = comCupom ? Math.round(subtotal * 0.1) : 0;
  const frete = subtotal >= FRETE_GRATIS_A_PARTIR_CENTAVOS ? 0 : FRETE_CENTAVOS;
  return {
    subtotal: subtotal / 100,
    desconto: desconto / 100,
    frete: frete / 100,
    freteGratis: frete === 0,
    valorFaltanteFreteGratis: Math.max(0, FRETE_GRATIS_A_PARTIR_CENTAVOS - subtotal) / 100,
    total: (subtotal - desconto + frete) / 100,
  };
}

export function brl(valor: number): string {
  const [inteiro, centavos] = Math.abs(valor).toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
}

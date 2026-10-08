export type Produto = { id: string; nome: string; precoCentavos: number };

export const PRODUTOS = {
  camiseta: { id: 'P001', nome: 'Camiseta Essencial', precoCentavos: 5990 },
  calca:    { id: 'P002', nome: 'Calça Jeans Slim', precoCentavos: 13990 },
  tenis:    { id: 'P003', nome: 'Tênis Casual Urbano', precoCentavos: 18990 },
  bone:     { id: 'P004', nome: 'Boné Aba Curva', precoCentavos: 4990 },
  mochila:  { id: 'P005', nome: 'Mochila Urbana 20L', precoCentavos: 10000 },
  meias:    { id: 'P006', nome: 'Kit 3 Pares de Meias', precoCentavos: 2990 },
  jaqueta:  { id: 'P007', nome: 'Jaqueta Corta-Vento', precoCentavos: 22990 },
  garrafa:  { id: 'P008', nome: 'Garrafa Térmica 750ml', precoCentavos: 5000 },
} satisfies Record<string, Produto>;

export const TODOS_PRODUTOS: Produto[] = Object.values(PRODUTOS);

export const CUPOM_VALIDO = 'BEMVINDO10';
export const CUPOM_EXPIRADO = 'VERAO2026';
export const CUPOM_INEXISTENTE = 'XPTO123';

export const FRETE_CENTAVOS = 1990;
export const FRETE_GRATIS_A_PARTIR_CENTAVOS = 20000;
export const LIMITE_POR_PRODUTO = 5;

export const CLIENTE_VALIDO = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  cep: '01310-100',
};

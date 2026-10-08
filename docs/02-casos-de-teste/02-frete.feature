# language: pt
# Card: VZS-142 v2.3.0 | Critérios: CA06, CA07, CA08, CA09

@frete
Funcionalidade: Frete grátis a partir de R$ 200,00
  Como cliente da Verzel Store
  Quero ganhar frete grátis em compras maiores
  Para pagar menos nas minhas compras

  Regras:
    - Subtotal >= R$ 200,00 → frete R$ 0,00
    - Subtotal <  R$ 200,00 → frete fixo R$ 19,90 e aviso de quanto falta
    - A regra usa o subtotal ANTES do desconto do cupom
    - O desconto do cupom não incide sobre o frete
    - total = subtotal - desconto + frete

  Contexto:
    Dado que estou na página do carrinho com o carrinho vazio

  @CT-10 @CA07 @ui @api
  Esquema do Cenário: Frete cobrado abaixo de R$ 200,00 com aviso de faltante
    Dado que o carrinho contém <produtos>
    Então o subtotal deve ser de R$ <subtotal>
    E o frete deve ser de R$ 19,90
    E devo ver a mensagem "Faltam R$ <faltante> para o frete grátis."
    E o total deve ser de R$ <total>

    Exemplos:
      | produtos                                   | subtotal | faltante | total  |
      | 1 "Tênis Casual Urbano"                    | 189,90   | 10,10    | 209,80 |
      | 1 "Calça Jeans Slim" e 1 "Camiseta Essencial" | 199,80 | 0,20    | 219,70 |
      | 1 "Kit 3 Pares de Meias"                   | 29,90    | 170,10   | 49,80  |

  @CT-11 @CA06 @ui @api @bug @BUG-01
  Esquema do Cenário: Frete grátis com subtotal exatamente R$ 200,00 (limite inclusivo)
    Dado que o carrinho contém <produtos>
    Então o subtotal deve ser de R$ 200,00
    E o frete deve ser "Grátis"
    E não devo ver mensagem de valor faltante para o frete grátis
    E o total deve ser de R$ 200,00

    Exemplos:
      | produtos                                          |
      | 2 "Mochila Urbana 20L"                            |
      | 4 "Garrafa Térmica 750ml"                         |
      | 1 "Mochila Urbana 20L" e 2 "Garrafa Térmica 750ml" |

  @CT-12 @CA06 @ui @api
  Cenário: Frete grátis com subtotal acima de R$ 200,00
    Dado que o carrinho contém 1 unidade de "Jaqueta Corta-Vento"
    Então o frete deve ser "Grátis"
    E o total deve ser de R$ 229,90

  @CT-13 @CA06 @CA08 @ui @api @bug @BUG-01
  Cenário: Frete grátis é avaliado pelo subtotal antes do desconto (no limite)
    Dado que o carrinho contém 2 unidades de "Mochila Urbana 20L"
    Quando eu aplico o cupom "BEMVINDO10"
    Então o resumo do pedido deve exibir:
      | subtotal | desconto | frete  | total  |
      | 200,00   | 20,00    | Grátis | 180,00 |

  @CT-14 @CA08 @ui @api
  Cenário: Desconto que reduz o valor abaixo de R$ 200,00 mantém o frete grátis
    Dado que o carrinho contém 1 unidade de "Jaqueta Corta-Vento"
    Quando eu aplico o cupom "BEMVINDO10"
    Então o resumo do pedido deve exibir:
      | subtotal | desconto | frete  | total  |
      | 229,90   | 22,99    | Grátis | 206,91 |

  @CT-15 @CA09 @ui @api
  Cenário: Desconto do cupom não incide sobre o frete
    Dado que o carrinho contém 1 unidade de "Mochila Urbana 20L"
    Quando eu aplico o cupom "BEMVINDO10"
    Então o resumo do pedido deve exibir:
      | subtotal | desconto | frete | total  |
      | 100,00   | 10,00    | 19,90 | 109,90 |

  @CT-16 @CA07 @ui
  Cenário: Frete e faltante são atualizados ao remover um item
    Dado que o carrinho contém os produtos:
      | produto            | quantidade |
      | Calça Jeans Slim   | 1          |
      | Camiseta Essencial | 2          |
    E o frete é "Grátis"
    Quando eu removo o produto "Calça Jeans Slim"
    Então o subtotal deve ser de R$ 119,80
    E o frete deve ser de R$ 19,90
    E devo ver a mensagem "Faltam R$ 80,20 para o frete grátis."

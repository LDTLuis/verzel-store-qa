# language: pt
# Card: VZS-142 v2.3.0 | Critérios: CA01, CA02, CA03, CA04, CA05, CA11

@cupom
Funcionalidade: Aplicação de cupom de desconto no carrinho
  Como cliente da Verzel Store
  Quero aplicar um cupom de desconto no carrinho
  Para pagar menos nas minhas compras

  Regras:
    - BEMVINDO10 concede 10% sobre o subtotal dos produtos
    - O código ignora maiúsculas/minúsculas e espaços no início e no fim
    - Apenas um cupom pode estar aplicado por vez
    - Valores arredondados para 2 casas decimais

  Contexto:
    Dado que estou na página do carrinho com o carrinho vazio

  @CT-01 @CA01 @CA11 @ui @api @smoke
  Cenário: Aplicar o cupom válido BEMVINDO10
    Dado que o carrinho contém os produtos:
      | produto          | quantidade |
      | Calça Jeans Slim | 1          |
      | Boné Aba Curva   | 2          |
    Quando eu aplico o cupom "BEMVINDO10"
    Então devo ver a mensagem de cupom aplicado
    E o resumo do pedido deve exibir:
      | subtotal | desconto | frete  | total    |
      | 239,70   | 23,97    | Grátis | 215,73   |

  @CT-02 @CA02 @ui @api
  Esquema do Cenário: Cupom aceito independentemente de caixa e espaços nas pontas
    Dado que o carrinho contém 1 unidade de "Camiseta Essencial"
    Quando eu aplico o cupom "<codigo digitado>"
    Então o cupom "BEMVINDO10" deve constar como aplicado
    E o desconto deve ser de R$ 5,99

    Exemplos:
      | codigo digitado  |
      | bemvindo10       |
      | BemVindo10       |
      |   BEMVINDO10     |
      | BEMVINDO10       |

  @CT-03 @CA02 @CA03 @ui
  Cenário: Espaço no meio do código invalida o cupom
    Dado que o carrinho contém 1 unidade de "Camiseta Essencial"
    Quando eu aplico o cupom "BEM VINDO10"
    Então devo ver a mensagem "Cupom inválido."
    E o desconto deve ser de R$ 0,00

  @CT-04 @CA03 @ui @api
  Esquema do Cenário: Cupom inexistente não aplica desconto
    Dado que o carrinho contém 1 unidade de "Camiseta Essencial"
    Quando eu aplico o cupom "<codigo>"
    Então devo ver a mensagem "Cupom inválido."
    E o desconto deve ser de R$ 0,00
    E o total deve ser de R$ 79,80

    Exemplos:
      | codigo      |
      | XPTO123     |
      | BEMVINDO1   |
      | BEMVINDO100 |

  @CT-05 @CA04 @ui @api
  Esquema do Cenário: Cupom expirado não aplica desconto
    Dado que o carrinho contém 1 unidade de "Camiseta Essencial"
    Quando eu aplico o cupom "<codigo>"
    Então devo ver a mensagem "Cupom expirado."
    E o desconto deve ser de R$ 0,00

    Exemplos:
      | codigo    |
      | VERAO2026 |
      | verao2026 |

  @CT-06 @ui
  Cenário: Tentar aplicar cupom com o campo vazio
    Dado que o carrinho contém 1 unidade de "Camiseta Essencial"
    Quando eu clico em "Aplicar cupom" sem informar um código
    Então devo ver a mensagem "Informe um cupom."
    E o desconto deve ser de R$ 0,00

  @CT-07 @CA05 @ui
  Cenário: Não é possível aplicar um segundo cupom enquanto há um aplicado
    Dado que o carrinho contém 1 unidade de "Camiseta Essencial"
    E o cupom "BEMVINDO10" está aplicado
    Então o campo de cupom não deve estar disponível
    E devo ver apenas a opção "Remover cupom"

  @CT-08 @CA05 @ui
  Cenário: Remover o cupom aplicado
    Dado que o carrinho contém 1 unidade de "Mochila Urbana 20L"
    E o cupom "BEMVINDO10" está aplicado
    Quando eu removo o cupom
    Então o desconto deve ser de R$ 0,00
    E o total deve ser de R$ 119,90
    E o campo de cupom deve estar disponível novamente

  @CT-09 @CA01 @ui
  Cenário: Desconto é recalculado quando a quantidade muda
    Dado que o carrinho contém 1 unidade de "Mochila Urbana 20L"
    E o cupom "BEMVINDO10" está aplicado
    Quando eu aumento a quantidade de "Mochila Urbana 20L" para 3
    Então o resumo do pedido deve exibir:
      | subtotal | desconto | frete  | total  |
      | 300,00   | 30,00    | Grátis | 270,00 |

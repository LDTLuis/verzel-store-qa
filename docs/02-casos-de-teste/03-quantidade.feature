# language: pt
# Card: VZS-142 v2.3.0 | Critério: CA10

@quantidade
Funcionalidade: Limite de 5 unidades por produto
  Como loja
  Quero limitar cada produto a no máximo 5 unidades por pedido
  Para controlar o volume de cada item vendido

  Regra: o limite vale para a interface e para a API

  @CT-17 @CA10 @ui
  Cenário: Interface impede adicionar a 6ª unidade de um produto
    Dado que estou na vitrine com o carrinho vazio
    Quando eu adiciono "Mochila Urbana 20L" ao carrinho 5 vezes
    Então o botão "Adicionar ao carrinho" de "Mochila Urbana 20L" deve ficar desabilitado
    E devo ver a mensagem "Limite de 5 unidades atingido."
    E o carrinho deve indicar 5 itens
    Quando eu acesso o carrinho
    Então o botão de aumentar a quantidade de "Mochila Urbana 20L" deve estar desabilitado

  @CT-17b @ui
  Cenário: Quantidade mínima no carrinho é 1
    Dado que o carrinho contém 1 unidade de "Kit 3 Pares de Meias"
    Então o botão de diminuir a quantidade de "Kit 3 Pares de Meias" deve estar desabilitado

  @CT-18 @CA10 @api @bug @BUG-02
  Esquema do Cenário: API rejeita quantidade acima de 5
    Quando eu envio um POST para "<endpoint>" com o item "<produto>" e quantidade <quantidade>
    Então o status da resposta deve ser <status>
    E o código de erro deve ser "<codigo>"

    Exemplos:
      | endpoint               | produto | quantidade | status | codigo                     |
      | /api/carrinho/calcular | P006    | 5          | 200    |                            |
      | /api/carrinho/calcular | P006    | 6          | 422    | QUANTIDADE_MAXIMA_EXCEDIDA |
      | /api/carrinho/calcular | P006    | 7          | 422    | QUANTIDADE_MAXIMA_EXCEDIDA |
      | /api/carrinho/calcular | P001    | 99         | 422    | QUANTIDADE_MAXIMA_EXCEDIDA |
      | /api/carrinho/calcular | P001    | 1000000000 | 422    | QUANTIDADE_MAXIMA_EXCEDIDA |
      | /api/pedidos           | P005    | 6          | 422    | QUANTIDADE_MAXIMA_EXCEDIDA |

  @CT-19 @api
  Esquema do Cenário: API rejeita quantidade inválida
    Quando eu envio um POST para "/api/carrinho/calcular" com o item "P006" e quantidade <quantidade>
    Então o status da resposta deve ser 422
    E o código de erro deve ser "QUANTIDADE_INVALIDA"
    E o campo do erro deve ser "itens[0].quantidade"

    Exemplos:
      | quantidade |
      | 0          |
      | -1         |
      | 1.5        |
      | "2"        |
      | null       |

  @CT-20 @api
  Cenário: API rejeita o mesmo produto repetido na lista
    Quando eu envio um POST para "/api/carrinho/calcular" com os itens:
      | produtoId | quantidade |
      | P006      | 3          |
      | P006      | 3          |
    Então o status da resposta deve ser 422
    E o código de erro deve ser "ITEM_DUPLICADO"
    E o campo do erro deve ser "itens[1].produtoId"

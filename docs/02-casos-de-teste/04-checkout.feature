# language: pt
# Card: VZS-142 v2.3.0 | Regras de checkout pré-existentes + integração com cupom/frete

@checkout
Funcionalidade: Finalização do pedido
  Como cliente da Verzel Store
  Quero confirmar meu pedido com os dados de entrega
  Para receber os produtos e pagar na entrega

  Regras:
    - Nome precisa ter nome e sobrenome
    - E-mail precisa ter formato válido
    - CEP precisa ter 8 dígitos, com ou sem hífen
    - Pagamento na entrega (sem etapa de pagamento online)

  Contexto:
    Dado que o carrinho contém 2 unidades de "Camiseta Essencial"
    E o cupom "BEMVINDO10" está aplicado
    E estou na página de checkout

  @CT-21 @ui @api @smoke
  Cenário: Confirmar pedido com dados válidos e cupom aplicado
    Quando eu preencho os dados de entrega:
      | nome        | email             | cep       |
      | Maria Silva | maria@exemplo.com | 01310-100 |
    E confirmo o pedido
    Então devo ser direcionado para a página de pedido confirmado
    E o número do pedido deve seguir o formato "VZ-000000"
    E o resumo do pedido confirmado deve exibir:
      | subtotal | desconto | frete | total  |
      | 119,80   | 11,98    | 19,90 | 127,72 |
    E o carrinho deve ficar vazio

  @CT-21b @ui
  Cenário: Acessar o checkout com o carrinho vazio
    Dado que o carrinho está vazio
    Quando eu acesso a página "/checkout"
    Então devo ser redirecionado para o carrinho
    E devo ver a mensagem "Seu carrinho está vazio"

  @CT-22 @CA03 @CA04 @api
  Esquema do Cenário: API rejeita pedido com cupom inválido ou expirado
    Quando eu envio um pedido válido para "/api/pedidos" com o cupom "<cupom>"
    Então o status da resposta deve ser 422
    E o código de erro deve ser "<codigo>"

    Exemplos:
      | cupom     | codigo         |
      | XPTO123   | CUPOM_INVALIDO |
      | VERAO2026 | CUPOM_EXPIRADO |

  @CT-23 @ui @api
  Esquema do Cenário: Validação dos dados do cliente
    Quando eu preencho os dados de entrega:
      | nome   | email   | cep   |
      | <nome> | <email> | <cep> |
    E confirmo o pedido
    Então devo permanecer na página de checkout
    E devo ver a mensagem "<mensagem>"

    Exemplos: Nome
      | nome    | email             | cep      | mensagem                  |
      |         | maria@exemplo.com | 01310100 | Informe o nome completo.  |
      | Maria   | maria@exemplo.com | 01310100 | Informe nome e sobrenome. |
      | Maria 1 | maria@exemplo.com | 01310100 | Informe nome e sobrenome. |

    Exemplos: E-mail
      | nome        | email         | cep      | mensagem                  |
      | Maria Silva |               | 01310100 | Informe o e-mail.         |
      | Maria Silva | maria@        | 01310100 | Informe um e-mail válido. |
      | Maria Silva | maria@exemplo | 01310100 | Informe um e-mail válido. |

    Exemplos: CEP
      | nome        | email             | cep       | mensagem                      |
      | Maria Silva | maria@exemplo.com |           | Informe o CEP.                |
      | Maria Silva | maria@exemplo.com | 1310-100  | Informe um CEP com 8 dígitos. |
      | Maria Silva | maria@exemplo.com | 013101000 | Informe um CEP com 8 dígitos. |
      | Maria Silva | maria@exemplo.com | abcde-fgh | Informe um CEP com 8 dígitos. |

  @CT-23b @ui @api
  Esquema do Cenário: CEP aceito com ou sem hífen
    Quando eu preencho os dados de entrega:
      | nome        | email             | cep   |
      | Maria Silva | maria@exemplo.com | <cep> |
    E confirmo o pedido
    Então devo ser direcionado para a página de pedido confirmado

    Exemplos:
      | cep       |
      | 01310100  |
      | 01310-100 |

  @CT-23c @ui @api @bug @BUG-04
  Esquema do Cenário: Nome sem letras e e-mail malformado são recusados
    Quando eu preencho os dados de entrega:
      | nome   | email   | cep      |
      | <nome> | <email> | 01310100 |
    E confirmo o pedido
    Então devo permanecer na página de checkout
    E devo ver a mensagem "<mensagem>"

    Exemplos:
      | nome        | email              | mensagem                  |
      | 12345 67890 | maria@exemplo.com  | Informe nome e sobrenome. |
      | @@@ ###     | maria@exemplo.com  | Informe nome e sobrenome. |
      | Maria Silva | maria@exemplo..com | Informe um e-mail válido. |

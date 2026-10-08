# language: pt
# Card: VZS-142 v2.3.0 | Contrato da API (seção "API" e "Códigos de erro" da documentação)

@api @contrato
Funcionalidade: Contrato da API da Verzel Store
  Como consumidor da API
  Quero respostas e erros padronizados
  Para integrar a loja de forma previsível

  @CT-24 @smoke
  Cenário: Listar todos os produtos
    Quando eu envio um GET para "/api/produtos"
    Então o status da resposta deve ser 200
    E a resposta deve conter 8 produtos com id, nome, descricao, categoria e preco

  @CT-24b
  Esquema do Cenário: Consultar produto por id
    Quando eu envio um GET para "/api/produtos/<id>"
    Então o status da resposta deve ser <status>

    Exemplos:
      | id   | status |
      | P001 | 200    |
      | P999 | 404    |

  @CT-24c
  Cenário: Cálculo do carrinho conforme o exemplo da documentação
    Quando eu envio um POST para "/api/carrinho/calcular" com:
      """
      {
        "itens": [
          { "produtoId": "P002", "quantidade": 1 },
          { "produtoId": "P004", "quantidade": 2 }
        ],
        "cupom": "BEMVINDO10"
      }
      """
    Então o status da resposta deve ser 200
    E a resposta deve conter:
      | subtotal | desconto | frete | freteGratis | valorFaltanteFreteGratis | total  |
      | 239.7    | 23.97    | 0     | true        | 0                        | 215.73 |

  @CT-24d @CA03 @CA04
  Esquema do Cenário: Cálculo com cupom inválido ou expirado não gera erro
    Quando eu envio um POST para "/api/carrinho/calcular" com o item "P001" e o cupom "<cupom>"
    Então o status da resposta deve ser 200
    E o desconto deve ser 0
    E "cupom.aplicado" deve ser false
    E "cupom.mensagem" deve ser "<mensagem>"

    Exemplos:
      | cupom     | mensagem         |
      | XPTO123   | Cupom inválido.  |
      | VERAO2026 | Cupom expirado.  |

  @CT-25
  Esquema do Cenário: Erros genéricos da API
    Quando eu envio <requisicao>
    Então o status da resposta deve ser <status>
    E o código de erro deve ser "<codigo>"

    Exemplos:
      | requisicao                                                   | status | codigo                 |
      | um POST para "/api/carrinho/calcular" com o corpo "{x"       | 400    | JSON_INVALIDO          |
      | um POST para "/api/carrinho/calcular" com o corpo "[]"       | 400    | JSON_INVALIDO          |
      | um GET para "/api/carrinho/calcular"                         | 405    | METODO_NAO_PERMITIDO   |
      | um GET para "/api/pedidos"                                   | 405    | METODO_NAO_PERMITIDO   |
      | um GET para "/api/rota-inexistente"                          | 404    | ROTA_NAO_ENCONTRADA    |
      | um POST para "/api/carrinho/calcular" com "itens" vazio      | 422    | ITENS_OBRIGATORIOS     |
      | um POST para "/api/carrinho/calcular" com o item "P999"      | 422    | PRODUTO_NAO_ENCONTRADO |
      | um POST para "/api/carrinho/calcular" com o item "P001" como texto | 422 | ITEM_INVALIDO       |

  @CT-25b @bug @BUG-03
  Esquema do Cenário: Item sem produtoId válido é tratado como item inválido
    Quando eu envio um POST para "/api/carrinho/calcular" com o item <item>
    Então o status da resposta deve ser 422
    E o código de erro deve ser "ITEM_INVALIDO"
    Mas a mensagem de erro não deve conter "<valor exposto>"

    Exemplos:
      | item                                  | valor exposto |
      | { "quantidade": 1 }                   | undefined     |
      | {}                                    | undefined     |
      | { "produtoId": null, "quantidade": 1 } | null          |

  @CT-25c
  Cenário: Pedido com dados de cliente ausentes lista todos os campos inválidos
    Quando eu envio um POST para "/api/pedidos" sem o objeto "cliente"
    Então o status da resposta deve ser 422
    E o código de erro deve ser "DADOS_INVALIDOS"
    E a lista "campos" deve conter "cliente.nome", "cliente.email" e "cliente.cep"

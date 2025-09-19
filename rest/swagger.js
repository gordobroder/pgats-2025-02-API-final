module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'API Checkout Demo',
    version: '1.0.0',
    description: 'API para registro, login e checkout com boleto ou cartão.'
  },
  paths: {
    '/api/users/register': {
      post: {
        summary: 'Registrar usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['name', 'email', 'password']
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuário registrado' },
          400: { description: 'Email já cadastrado' }
        }
      }
    },
    '/api/users/login': {
      post: {
        summary: 'Login do usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: { description: 'Login bem-sucedido' },
          401: { description: 'Credenciais inválidas' }
        }
      }
    },
    '/api/checkout': {
      post: {
        summary: 'Realizar checkout',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'integer' },
                        quantity: { type: 'integer' }
                      },
                      required: ['productId', 'quantity']
                    }
                  },
                  freight: { type: 'number' },
                  paymentMethod: { type: 'string', enum: ['boleto', 'credit_card'] },
                  cardData: {
                    type: 'object',
                    properties: {
                      number: { type: 'string' },
                      name: { type: 'string' },
                      expiry: { type: 'string' },
                      cvv: { type: 'string' }
                    }
                  }
                },
                required: ['items', 'freight', 'paymentMethod']
              }
            }
          }
        },
        responses: {
          200: { description: 'Checkout realizado' },
          401: { description: 'Token inválido' },
          400: { description: 'Erro no checkout' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};
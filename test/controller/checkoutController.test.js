const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

// Aplicação
const app = require('../../rest/app');

// Mock
const checkoutService = require('../../src/services/checkoutService');
const userService = require('../../src/services/userService');

// Testes
describe('Checkout Controller', () => {
    describe('POST api/checkout', () => {

        before(async () => {
            const respostaRegister = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'gustavo',
                    email: 'gustavo.schmidt@live.com',
                    password: '123456'
                });
        });

        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'gustavo.schmidt@live.com',
                    password: '123456'
                });

            token = respostaLogin.body.token;
        });

        it('Usando Mock: Checkout realizado com sucesso retorna 200', async () => {
            const checkoutServiceStub = sinon.stub(checkoutService, 'checkout');
            checkoutServiceStub.returns({
                valorFinal: 1050,
                userId: 1,
                items: [
                    {
                        productId: 1,
                        quantity: 10
                    }
                ],
                freight: 50,
                paymentMethod: "boleto",
                total: 1050
            });

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "items": [
                        {
                            "productId": 1,
                            "quantity": 10
                        }
                    ],
                    "freight": 50,
                    "paymentMethod": "boleto",
                    "cardData": {
                        "number": "12345678",
                        "name": "Gustavo Schmidt",
                        "expiry": "12/30",
                        "cvv": "545"
                    }
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('valorFinal', 1050);
        });

        it('Usando Mock: Checkout com token inválido retorna 401', async () => {
            const userServiceStub = sinon.stub(userService, 'verifyToken');
            userServiceStub.returns(null)

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}+1`)
                .send({
                    "items": [
                        {
                            "productId": 1,
                            "quantity": 10
                        }
                    ],
                    "freight": 50,
                    "paymentMethod": "boleto",
                    "cardData": {
                        "number": "12345678",
                        "name": "Gustavo Schmidt",
                        "expiry": "12/30",
                        "cvv": "545"
                    }
                });

            expect(resposta.status).to.equal(401);
            expect(resposta.body).to.have.property('error', 'Token inválido');
        });

        it('Usando Mock: Erro no Checkout retorna 400', async () => {
            const checkoutServiceStub = sinon.stub(checkoutService, 'checkout');
            checkoutServiceStub.throws(new Error('Produto não encontrado'));

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "items": [
                        {
                            "productId": 3,
                            "quantity": 10
                        }
                    ],
                    "freight": 50,
                    "paymentMethod": "boleto",
                    "cardData": {
                        "number": "12345678",
                        "name": "Gustavo Schmidt",
                        "expiry": "12/30",
                        "cvv": "545"
                    }
                });

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Produto não encontrado');
        });

        afterEach(() => {
            sinon.restore();
        })
    });

});

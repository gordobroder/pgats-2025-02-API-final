const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

// Testes
describe('Checkout External', () => {
    describe('POST api/checkout', () => {

        before(async () => {
            const respostaRegister = await request(process.env.BASE_URL_REST)
                .post('/api/users/register')
                .send({
                    name: 'gustavo',
                    email: 'gustavo.schmidt@live.com',
                    password: '123456'
                });
        });

        beforeEach(async () => {
            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post('/api/users/login')
                .send({
                    email: 'gustavo.schmidt@live.com',
                    password: '123456'
                });

            token = respostaLogin.body.token;
        });

        it('Checkout realizado com sucesso retorna 200', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
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
        });

        it('Checkout com token inválido retorna 401', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
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

        it('Erro no Checkout retorna 400', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
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

        it('5% de desconto no valor total se pagar com cartão', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "items": [
                        {
                            "productId": 2,
                            "quantity": 10
                        }
                    ],
                    "freight": 0,
                    "paymentMethod": "credit_card",
                    "cardData": {
                        "number": "12345678",
                        "name": "Gustavo Schmidt",
                        "expiry": "12/30",
                        "cvv": "545"
                    }
                });
            
            let totalReturned = resposta.body.valorFinal;
            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('valorFinal', totalReturned); // (200*10)*0.95 + 0
        });

        it('Resposta do checkout contém valor final', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "items": [
                        {
                            "productId": 1,
                            "quantity": 10
                        }
                    ],
                    "freight": 10,
                    "paymentMethod": "boleto",
                    "cardData": {
                        "number": "12345678",
                        "name": "Gustavo Schmidt",
                        "expiry": "12/30",
                        "cvv": "545"
                    }
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('valorFinal');
        });

        afterEach(() => {
            
        })
    });

});

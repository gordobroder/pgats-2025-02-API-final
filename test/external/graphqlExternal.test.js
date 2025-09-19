const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

// Testes GraphQL
describe('GraphQL External', () => {
    let token;

    before(async () => {
        // Register user via GraphQL
        const registerMutation = `
            mutation {
                register(name: "warlley", email: "warlley.freitas@live.com", password: "123456") {
                    name
                    email
                }
            }
        `;

        await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .send({
                query: registerMutation
            });
    });

    beforeEach(async () => {
        // Login user via GraphQL
        const loginMutation = `
            mutation {
                login(email: "warlley.freitas@live.com", password: "123456") {
                    user {
                        name
                        email
                    }
                    token
                }
            }
        `;

        const respostaLogin = await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .send({
                query: loginMutation
            });

        token = respostaLogin.body.data.login.token;
    });

    describe('Checkout Mutation', () => {
        it('Checkout realizado com sucesso retorna dados corretos', async () => {
            const checkoutMutation = `
                mutation {
                    checkout(
                        items: [{ productId: 1, quantity: 10 }],
                        freight: 50,
                        paymentMethod: "boleto",
                        cardData: {
                            number: "12345678",
                            name: "Warlley Freitas",
                            expiry: "12/30",
                            cvv: "545"
                        }
                    ) {
                        userId
                        valorFinal
                        paymentMethod
                        freight
                        items {
                            productId
                            quantity
                        }
                    }
                }
            `;

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    query: checkoutMutation
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.checkout).to.have.property('valorFinal');
            expect(resposta.body.data.checkout).to.have.property('userId');
            expect(resposta.body.data.checkout).to.have.property('paymentMethod', 'boleto');
            expect(resposta.body.data.checkout).to.have.property('freight', 50);
        });

        it('Checkout com token inválido retorna erro', async () => {
            const checkoutMutation = `
                mutation {
                    checkout(
                        items: [{ productId: 1, quantity: 10 }],
                        freight: 50,
                        paymentMethod: "boleto",
                        cardData: {
                            number: "12345678",
                            name: "Warlley Freitas",
                            expiry: "12/30",
                            cvv: "545"
                        }
                    ) {
                        userId
                        valorFinal
                        paymentMethod
                        freight
                        items {
                            productId
                            quantity
                        }
                    }
                }
            `;

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}+1`)
                .send({
                    query: checkoutMutation
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('errors');
            expect(resposta.body.errors[0].message).to.equal('Token inválido');
        });

        it('Checkout com produto inexistente retorna erro', async () => {
            const checkoutMutation = `
                mutation {
                    checkout(
                        items: [{ productId: 3, quantity: 10 }],
                        freight: 50,
                        paymentMethod: "boleto",
                        cardData: {
                            number: "12345678",
                            name: "Warlley Freitas",
                            expiry: "12/30",
                            cvv: "545"
                        }
                    ) {
                        userId
                        valorFinal
                        paymentMethod
                        freight
                        items {
                            productId
                            quantity
                        }
                    }
                }
            `;

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    query: checkoutMutation
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('errors');
            expect(resposta.body.errors[0].message).to.equal('Produto não encontrado');
        });

        it('5% de desconto no valor total se pagar com cartão', async () => {
            const checkoutMutation = `
                mutation {
                    checkout(
                        items: [{ productId: 2, quantity: 10 }],
                        freight: 0,
                        paymentMethod: "credit_card",
                        cardData: {
                            number: "12345678",
                            name: "Warlley Freitas",
                            expiry: "12/30",
                            cvv: "545"
                        }
                    ) {
                        userId
                        valorFinal
                        paymentMethod
                        freight
                        items {
                            productId
                            quantity
                        }
                    }
                }
            `;

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    query: checkoutMutation
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.checkout).to.have.property('valorFinal');
            expect(resposta.body.data.checkout).to.have.property('paymentMethod', 'credit_card');
            // Verify discount was applied (product 2 costs 200, so 200*10*0.95 = 1900)
            expect(resposta.body.data.checkout.valorFinal).to.equal(1900);
        });
    });

    describe('Users Query', () => {
        it('Query users retorna lista de usuários', async () => {
            const usersQuery = `
                query {
                    users {
                        name
                        email
                    }
                }
            `;

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .send({
                    query: usersQuery
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.users).to.be.an('array');
            expect(resposta.body.data.users.length).to.be.greaterThan(0);
        });
    });

    describe('Authentication Mutations', () => {
        it('Register mutation cria novo usuário', async () => {
            const uniqueEmail = `test${Date.now()}@example.com`;
            const registerMutation = `
                mutation {
                    register(name: "Test User", email: "${uniqueEmail}", password: "123456") {
                        name
                        email
                    }
                }
            `;

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .send({
                    query: registerMutation
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.register).to.have.property('name', 'Test User');
            expect(resposta.body.data.register).to.have.property('email', uniqueEmail);
        });

        it('Login mutation retorna token e dados do usuário', async () => {
            // First register a user for this test
            const uniqueEmail = `login${Date.now()}@example.com`;
            const registerMutation = `
                mutation {
                    register(name: "Login Test User", email: "${uniqueEmail}", password: "123456") {
                        name
                        email
                    }
                }
            `;

            await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .send({
                    query: registerMutation
                });

            // Now test login
            const loginMutation = `
                mutation {
                    login(email: "${uniqueEmail}", password: "123456") {
                        user {
                            name
                            email
                        }
                        token
                    }
                }
            `;

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .send({
                    query: loginMutation
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.login).to.have.property('token');
            expect(resposta.body.data.login.user).to.have.property('name', 'Login Test User');
            expect(resposta.body.data.login.user).to.have.property('email', uniqueEmail);
        });

        it('Login com credenciais inválidas retorna erro', async () => {
            const loginMutation = `
                mutation {
                    login(email: "invalid@example.com", password: "wrongpassword") {
                        user {
                            name
                            email
                        }
                        token
                    }
                }
            `;

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .send({
                    query: loginMutation
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('errors');
            expect(resposta.body.errors[0].message).to.equal('Credenciais inválidas');
        });
    });
});

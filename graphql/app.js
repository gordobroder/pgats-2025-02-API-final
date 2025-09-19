const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const app = express();
const userService = require('../src/services/userService');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const auth = req.headers.authorization || '';
    let userData = null;
    if (auth.startsWith('Bearer ')) {
      const token = auth.replace('Bearer ', '');
      userData = userService.verifyToken(token);
    }
    return { userData };
  }
});

async function startApollo() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}

startApollo();

module.exports = app;
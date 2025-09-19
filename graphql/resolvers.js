const users = require('../src/models/user');
const userService = require('../src/services/userService');
const checkoutService = require('../src/services/checkoutService');

module.exports = {
  Query: {
    users: () => users
  },
  Mutation: {
    register: (_, { name, email, password }) => {
      const user = userService.registerUser(name, email, password);
      if (!user) throw new Error('Email já cadastrado');
      return user;
    },
    login: (_, { email, password }) => {
      const result = userService.authenticate(email, password);
      if (!result) throw new Error('Credenciais inválidas');
      return result;
    },
    checkout: (_, { items, freight, paymentMethod, cardData }, context) => {
      const { userData } = context;
      if (!userData) throw new Error('Token inválido');
      const result = checkoutService.checkout(userData.id, items, freight, paymentMethod, cardData);
      return { ...result, valorFinal: result.total };
    }
  }
};
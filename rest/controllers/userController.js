const userService = require('../../src/services/userService');

exports.register = (req, res) => {
  const { name, email, password } = req.body;
  const user = userService.registerUser(name, email, password);
  if (!user) return res.status(400).json({ error: 'Email já cadastrado' });
  res.status(201).json({ user });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const result = userService.authenticate(email, password);
  if (!result) return res.status(401).json({ error: 'Credenciais inválidas' });
  res.json(result);
};
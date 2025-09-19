const users = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET = 'supersecret';

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

function registerUser(name, email, password) {
  if (findUserByEmail(email)) return null;
  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);
  return { name: newUser.name, email: newUser.email };
}

function authenticate(email, password) {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
    return { 
      user: { name: user.name, email: user.email }, 
      token 
    };
  }
  return null;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { findUserByEmail, registerUser, authenticate, verifyToken };
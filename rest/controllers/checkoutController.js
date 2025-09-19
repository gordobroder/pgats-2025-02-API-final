const checkoutService = require('../../src/services/checkoutService');
const userService = require('../../src/services/userService');

exports.checkout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userData = userService.verifyToken(token);
  if (!userData) return res.status(401).json({ error: 'Token inválido' });

  const { items, freight, paymentMethod, cardData } = req.body;
  try {
    const result = checkoutService.checkout(userData.id, items, freight, paymentMethod, cardData);
    res.json({ valorFinal: result.total, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
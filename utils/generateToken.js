const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const token = jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  return token;
};

module.exports = generateToken;

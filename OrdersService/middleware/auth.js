const { expressjwt: jwt } = require('express-jwt');

const checkJwt = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  audience: process.env.OAUTH_AUDIENCE,
  issuer: process.env.OAUTH_ISSUER
});

module.exports = checkJwt;

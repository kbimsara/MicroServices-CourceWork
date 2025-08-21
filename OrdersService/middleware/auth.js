const { expressjwt: jwt } = require("express-jwt");

// For local dev: use HS256 with a shared secret only.
const checkJwt = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

module.exports = checkJwt;

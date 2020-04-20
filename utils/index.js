const passport = require('passport');
const path = require("path");

const authUserFromJWT = (req, res) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', (err, user, info) => {      
      if (err) reject(err);
      if (user) resolve(user);
    })(req, res)
  })
}

module.exports = {
  authUserFromJWT
}
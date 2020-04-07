const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const {User} = require("../models");

passport.use(new LocalStrategy({
  usernameField: "user[email]",
  passwordField: "user[password]"
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ where: {email: email} });
    if (!user || !user.validatePassword(password)) {
      return done(null, false, {
        errors: {
          "email or password": "is invalid" 
        }
      })
    }
    return done(null, user);
  } catch {
    return done(null, false)
  }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_KEY,
  },
  (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired');
    }

    return done(null, jwtPayload);
  }
));
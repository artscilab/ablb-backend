const passport = require('passport');
const router = require('express').Router();
const Joi = require("@hapi/joi");
const passportOptions = {session: false}

const User = require("../../models/user");

router.post("/", async (req, res, next) => {
  const { body: { user } } = req;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.ref('password'),
    school: Joi.string().min(2).required(),
    role: Joi.string().min(2),
    name: Joi.string().min(2).required()
  }).with('password', 'confirmPassword');
  
  const { error, value } = schema.validate();

  if (error !== undefined) {
    res.status(400).json(error);
    return;
  }

  const finalUser = new User(user)
  finalUser.setPassword(user.password);
  
  return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }))
    .catch((e) => res.status(400).json({
      "error": "email already registered"
    }));
})

router.post("/login", async (req, res, next) => {
  const { body: { user } } = req;
  
  if (!user) {
    return res.status(422).json({
      "message": "invalid"
    })
  }

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required"
      }
    })
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required"
      }
    })
  }

  return passport.authenticate('local', passportOptions, (err, pUser, info) => {
    if (err) return next(err);

    if (pUser) {
      const user = pUser;
      user.token = pUser.generateJWT();
      
      req.login(user.token, passportOptions, (err) => {
        if (err) {
          res.status(400).send({ error })
        }

        res.json({ user: user.toAuthJSON(user.token) })
      })

      return
    }

    return res.status(400).json({
      error: {
        "email or password": "incorrect"
      }
    })
  })(req, res, next);
})

router.get('/current', passport.authenticate('jwt', passportOptions), (req, res, next) => {
  const {id} = req.user;

  return User.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = router;

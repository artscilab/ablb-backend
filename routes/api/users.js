const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const passportOptions = {session: false}

const User = require("../../models/user");

router.use(bodyParser.json())

router.post("/", async (req, res, next) => {
  const { body: { user } } = req;
  
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.ref('password'),
    school: Joi.string().min(2).required(),
    role: Joi.string().min(2).default("user"),
    name: Joi.string().min(2).required()
  }).with('password', 'confirmPassword');
  
  const { error, value } = schema.validate(user);
  
  if (error !== undefined) {
    res.status(400).json(error);
    return;
  }

  const { password, email, school, role, name } = value;
  const { salt, hash } = User.generateHashes(password);
  try {
    const newUser = await User.create({
      email, school, role, name, salt, hash  
    })
    res.json({ user: newUser.toAuthJSON() })
  } catch(e) {
    res.status(400).json({
      "error": "email already exists"
    });
  }
})

router.post("/login", async (req, res, next) => {
  const { body: { user } } = req;
  
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })

  const { error, value } = schema.validate(user);

  if (error !== undefined) {
    res.status(400).json({
      "error": error
    })
    return
  }

  return passport.authenticate('local', passportOptions, (err, pUser, info) => {
    if (err) return next(err);

    if (pUser) {
      const user = pUser;
      user.token = User.generateJWT(user.email, user.id);
      
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

router.get('/current', passport.authenticate('jwt', passportOptions), async (req, res, next) => {
  const {email} = req.user;

  const user = await User.findOne({
    where: {
      email: email
    }
  })
  return res.json({ user: user.toAuthJSON() });
});

module.exports = router;

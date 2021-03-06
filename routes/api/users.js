const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const passportOptions = {session: false}
const { authUserFromJWT } = require("../../utils")
const { User } = require("../../models");
const { adminRoute } = require("../../utils/middleware");

router.use(bodyParser.json())

router.get("/", passport.authenticate("jwt", passportOptions), adminRoute, async (req, res) => {
  try {
    const users = await User.findAll();
    const mapped = users.map((u) => {
      return u.toSafeJSON();
    })
    res.json(mapped);
  } catch(e) {
    res.status(500).json(e)
  }
})

router.post("/", async (req, res, next) => {
  const { body: { user } } = req;
  
  if (user === undefined) {
    res.status(400).json({
      "error": "please provide user details"
    });
    return;
  }

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.ref('password'),
    school: Joi.string().min(2).required(),
    role: Joi.string().min(2).default("user"),
    name: Joi.string().min(2).required()
  }).with('password', 'confirmPassword');
  
  let { error, value } = schema.validate(user);
  if (error !== undefined) {
    res.status(400).json(error);
    return;
  }

  if (value.role === "admin") {
    try {
      const requestUser = await authUserFromJWT(req, res);
      const user = await User.findOne({
        where: {
          email: requestUser.email
        }
      });
      console.log(user)
      if (!user || user.role !== "admin") {
        res.status(401).json({
          "error": "You must be an admin to create an admin user."
        });
      }
    } catch(e) {
      console.error(e);
      
      res.status(401).json({
        "error": "You must be logged in to create an admin user."
      });
    } 
  }

  const { password, email, school, role, name } = value;
  const { salt, hash } = User.generateHashes(password);
  try {
    console.log("here, ", salt, hash);
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

router.patch("/:id", passport.authenticate("jwt", passportOptions), async (req, res) => {
  const { id: userId } = req.user;
  const { user } = req.body;
  const { id: paramId } = req.params;
  
  // disallow changing other users' settings
  let adminRequest = false;
  let idToUpdate = userId;

  // allow changing other users' settings if admin
  if (paramId !== "" || paramId !== undefined) {
    const user = await User.findByPk(userId);
    if (user.role === "admin") {
      idToUpdate = paramId;
      adminRequest = true;
    }
  }

  const schema = Joi.object({
    password: Joi.string().min(8).optional().allow(""),
    confirmPassword: Joi.ref('password'),
    school: Joi.string().min(2).optional(),
    name: Joi.string().min(2).required(),
    role: Joi.string().optional().default("user"),
  }).with('password', 'confirmPassword');
  
  const { error, value } = schema.validate(user, {
    allowUnknown: true
  });

  if (error !== undefined) {
    return res.status(400).json(error)
  }

  const { password, school, name } = value;
  
  const newValues = {
    school, name
  }

  if (adminRequest) {
    newValues["role"] = value.role
  }

  console.log(value);

  if (password !== "") {
    const { salt, hash } = User.generateHashes(password);
    newValues.salt = salt;
    newValues.hash = hash;
  }

  try {
    await User.update(newValues, {
      where: {
        id: idToUpdate
      }
    })
    return res.status(200).json({
      message: "Successfully updated user."
    })
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "Could not update user."
    })
  }
})

router.get('/refresh', passport.authenticate('jwt', passportOptions), async (req, res, next) => {
  const {email} = req.user;

  const user = await User.findOne({
    where: {
      email: email
    }
  })
  return res.json({ user: user.toAuthJSON() });
});

router.get("/authorize", passport.authenticate("jwt", passportOptions), adminRoute, async (req, res) => {
  const { email, id } = req.user;

  const user = await User.findByPk(id);

  return res.json({
    user: user.toSafeJSON()
  })
})

module.exports = router;

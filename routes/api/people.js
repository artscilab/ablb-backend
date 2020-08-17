const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const { adminRoute } = require("../../utils/middleware");
const multer = require("multer");
const path = require("path")
const pOptions = {session: false}
const { Person } = require("../../models")

router.use(bodyParser.json());

router.get("/", async (req, res) => {
  try {
    let people = await Person.findAll();
    return res.json(people);
  } catch (e) {
    return res.status(500).json({
      error: "Failed to get people."
    })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const person = await Person.findByPk(id);
    if (person === null) {
      throw "couldn't find that person"
    }
    res.json(person)
  } catch (e) {
    res.status(500).json({
      error: "failed to get that person"
    })
  }
})

// create one 
router.post("/", passport.authenticate("jwt", pOptions), adminRoute, async (req, res, next) => {
  const { user, body: { people } } = req;

  if (people === undefined) {
    res.status(400).json({
      error: "please provide person data to create a new person"
    })
    return
  }

  const personSchema = Joi.object({
    name: Joi.string().required(),
    school: Joi.string().optional(),
    bio: Joi.string().optional(),
    personalLink: Joi.string().uri().optional()
  })
  
  const { error, value } = personSchema.validate(people, {
    allowUnknown: true
  })
  
  if (error !== undefined) {
    res.status(400).json(error)
    return
  }
  
  const { name, school, bio, personalLink } = value;

  try {
    const personToCreate = await Person.create({
      name, school, bio, personalLink, createdBy: user.id
    });
    res.json(personToCreate)
  } catch (e) {
    res.status(500).json({
      error: "failed to add person"
    })
  }
});

// edit one 
router.patch("/:id", passport.authenticate("jwt", pOptions), adminRoute, async(req, res) => {
  const { params: { id: pId }, body: { people } } = req;
  
  if (people === undefined) {
    res.status(400).json({
      error: "please provide person data to edit person"
    })
    return
  }

  const personSchema = Joi.object({
    id: Joi.optional(),
    name: Joi.string(),
    school: Joi.string(),
    bio: Joi.string(),
    personalLink: Joi.string().uri().optional(),
    imageurl: Joi.string().optional().allow(null),
    createdAt: Joi.optional(),
    updatedAt: Joi.optional(),
    createdBy: Joi.optional()
  })

  const { error, value } = personSchema.validate(people)

  if (error !== undefined) {
    res.status(400).json(error);
    return
  }

  const {
    name, school, bio, personalLink
  } = value;

  try {
    await Person.update({
      name, school, bio, personalLink
    }, {
      where: {
        id: pId
      }
    })
    res.status(200).json({
      message: "updated person."
    })
  } catch (e) {
    res.status(404).json({
      error: "failed to find or update that record"
    })
  }
})

const upload = multer({
  storage: multer.diskStorage({
  filename: function (req, file, cb) {
    const basename = path.basename(file.originalname);
    const ext = path.extname(file.originalname);

    const stripped = basename.replace(/\s/g,'');
      cb(null, stripped + '-' + Date.now() + ext)
    },
    destination: function (req, file, cb) {
      cb(null, `./${process.env.PICTURE_FILEPATH}`)
    },
  })
})

router.post("/:id/upload", passport.authenticate("jwt", pOptions), adminRoute, upload.single("profilePicture"), async (req, res) => {
  const id = req.params.id;
  console.log("attempting to upload picture")
  
  const picture = req.file;

  try {
    await Person.update({
      imageurl: `${process.env.PICTURE_FILEPATH}/${picture.filename}`
    }, {
      where: {id: id}
    })

    return res.status(200).json({
      message: "file uploaded"
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      error: "error updating person"
    })  
  }
})

// delete one 
router.delete("/:id", passport.authenticate("jwt", pOptions), adminRoute, async (req, res) => {
  const { params: { id: tId } } = req;

  try {
    await Person.destroy({
      where: {
        id: tId
      }
    });

    res.json({
      "message": `Person with id ${tId} deleted`
    })
  } catch (err) {
    res.status(500).json({
      "error": `failed to delete person with id ${tId}`
    })
  }
})

module.exports = router;
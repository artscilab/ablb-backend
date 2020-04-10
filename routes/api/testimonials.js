const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const pOptions = {session: false}
const { adminRoute } = require("../../utils/middleware");

const { Testimonial } = require("../../models");

router.use(bodyParser.json())

// list all
router.get("/", async (req, res, next) => {
  try {
    const testimonials = await Testimonial.findAll();
    res.json(testimonials)
  } catch (e) {
    res.status(500).json({
      errors: "failed to get testimonials"
    })
  }
})

// get one
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const testimonial = await Testimonial.findByPk(id);

    res.json(testimonial)
  } catch (e) {
    res.status(500).json({
      errors: "failed to get that testimoial"
    })
  }
})

// create one 
router.post("/", passport.authenticate("jwt", pOptions), adminRoute, async (req, res, next) => {
  const { user, body: { testimonial } } = req;

  if (testimonial === undefined) {
    res.status(400).json({
      error: "please provide testimonial data to create a new testimonial"
    })
    return
  }

  const testimonialSchema = Joi.object({
    text: Joi.string().required(),
    name: Joi.string().required(),
    school: Joi.string()
  })
  
  const { error, value } = testimonialSchema.validate(testimonial)
  
  if (error !== undefined) {
    res.status(400).json(error)
    return
  }
  
  const { text, name, school } = value;

  try {
    const testimonialToSave = await Testimonial.create({
      text, name, school, createdBy: user.id
    });
    res.json(testimonialToSave)
  } catch (e) {
    res.status(500).json({
      error: "failed to create testimonial"
    })
  }
})

// edit one 
router.patch("/:id", passport.authenticate("jwt", pOptions), adminRoute, async(req, res) => {
  const { params: { id: tId }, body: { testimonial } } = req;
  
  if (testimonial === undefined) {
    res.status(400).json({
      error: "please provide testimonial data to edit testimonial"
    })
    return
  }

  const testimonialSchema = Joi.object({
    text: Joi.string(),
    name: Joi.string(),
    school: Joi.string()
  })

  const { error, value } = testimonialSchema.validate(testimonial)

  if (error !== undefined) {
    res.status(400).json(error);
    return
  }

  try {
    await Testimonial.update(value, {
      where: {
        id: tId
      }
    })
    res.status(200).json({
      message: "updated testimonial."
    })
  } catch (e) {
    console.log(e);
    res.status(404).json({
      error: "failed to find or update that record"
    })
  }
})

// delete one 
router.delete("/:id", passport.authenticate("jwt", pOptions), adminRoute, async (req, res) => {
  const { params: { id: tId } } = req;

  try {
    await Testimonial.destroy({
      where: {
        id: tId
      }
    });

    res.json({
      "message": `Testimonial with id ${tId} deleted`
    })
  } catch (err) {
    res.status(500).json({
      "error": `failed to delete testimonial with id ${tId}`
    })
  }
})

module.exports = router;
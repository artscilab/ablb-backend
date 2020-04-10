const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const pOptions = {session: false}
const { adminRoute } = require("../../utils/middleware");

const User = require("../../models/user");
const Testimonial = require("../../models/testimonial");

router.use(bodyParser.json())

router.get("/", async (req, res, next) => {
  const testimonials = await Testimonial.findAll();
  
  res.json(testimonials)
})

router.post("/", passport.authenticate("jwt", pOptions), adminRoute, async (req, res, next) => {
  const { user, body: { testimonial } } = req;

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
  const testimonialToSave = await Testimonial.create({
    text, name, school, createdBy: user.id
  });

  res.json(testimonialToSave)
})

router.delete("/:id", passport.authenticate("jwt", pOptions), adminRoute, async (req, res) => {
  const { user, params: { id: tId } } = req;

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

router.patch("/:id", passport.authenticate("jwt", pOptions), adminRoute, async(req, res) => {
  const { params: { id: tId }, body: { testimonial } } = req;
  
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

module.exports = router;
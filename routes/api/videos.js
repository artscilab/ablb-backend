const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const { adminRoute } = require("../../utils/middleware");
const pOptions = {session: false}

const { Video } = require("../../models")

router.use(bodyParser.json());

// get all 
router.get("/", async (req, res) => {
  try {
    const videos = await Video.findAll();
    res.json(videos);
  } catch(e) {
    res.status(500).json({
      errors: "failed to get any videos"
    })
  }
})

// get one
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const video = Video.findByPk(id);

    if (video === null) {
      throw "Could't find that video"
    }
  } catch (e) {
    res.status(500).json({
      errors: "failed to get that video"
    })
  } 
})

// create one 
router.post("/", passport.authenticate("jwt", pOptions), adminRoute, async (req, res) => {
  const { user, body: { video }} = req;

  if (video === undefined) {
    res.status(400).json({
      error: "please provide video data to create a video"
    })
    return
  }

  const videoSchema = Joi.object({
    description: Joi.string().required(),
    title: Joi.string().required(),
    partNumber: Joi.number().required(),
    lessonId: Joi.number().required()
  })

  const { error, value } = videoSchema.validate(video);

  if (error !== undefined) {
    res.status(400).json({
      error: error
    })
    return;
  }
  
  const { description, title, partNumber, lessonId } = value;

  try {
    const videoToSave = await Video.create({
      description, title, partNumber, lessonId, createdBy: user.id
    })
    res.json(videoToSave)
  } catch (e) {
    res.status(500).json({
      error: "failed to create video"
    })
  }
})

router.patch("/:id", passport.authenticate('jwt', pOptions), adminRoute, async (req, res) => {
  const { params: { id }, body: { video } } = req;

  if (video === undefined) {
    res.status(400).json({
      error: "please provide video data to edit it"
    })
    return
  }

  const videoSchema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    partNumber: Joi.number(),
    videoLink: Joi.string(),
    lessonId: Joi.number(),
  })

  const { error, value } = videoSchema.validate(video);
  if (error !== undefined) {
    res.status(400).json(error);
    return
  }

  try {
    await Video.update(value, {
      where: {
        id: id
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

router.delete("/:id", passport.authenticate("jwt", pOptions), adminRoute, async (req, res) => {
  const { params: { id: tId } } = req;

  try {
    await Video.destroy({
      where: {
        id: tId
      }
    });

    res.json({
      "message": `Video with id ${tId} deleted`
    })
  } catch (err) {
    res.status(500).json({
      "error": `failed to delete video with id ${tId}`
    })
  }
})

module.exports = router
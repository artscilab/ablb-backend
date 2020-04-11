const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const { adminRoute } = require("../../utils/middleware");
const pOptions = {session: false}

const { Video } = require("../../models")

router.use(bodyParser.json());

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
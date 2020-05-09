const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const { adminRoute } = require("../../utils/middleware");
const pOptions = {session: false}

const { Lesson, Video } = require("../../models")

router.use(bodyParser.json());

// list all
router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.findAll();
    res.json(lessons)
  } catch (e) {
    res.status(500).json({
      errors: "failed to get lessons"
    })
  }
});

// get one
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    let options = {}

    if (req.query.include !== undefined) {
      options = {
        include: [{
          model: Video,
          as: "videos"
        }]
      }
    }
    
    const lesson = await Lesson.findByPk(id, options)
    if (lesson === null) {
      throw "failed to find that lesson"
    }
    res.json(lesson)
  } catch (e) {
    console.log(e);
    
    res.status(404).json({
      errors: "failed to get that lesson"
    })
  }
})

router.get("/:id/videos", async (req, res) => {
  const { id } = req.params;

  try {
    const videos = await Video.findAll({
      where: {
        lessonId: id
      }
    })

    if (videos.length <= 0) {
      res.status(404).json({
        errors: "no videos for that lesson"
      })
      return
    }

    res.json(videos);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: "failed to get videos for that lesson"
    })
  }
})

// create one 
router.post("/", passport.authenticate("jwt", pOptions), adminRoute, async (req, res) => {
  const { user, body: { lesson } } = req;

  if (lesson === undefined) {
    res.status(400).json({
      error: "please provide lesson data to edit lesson"
    })
    return
  }

  const lessonSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required()
  })

  const { error, value } = lessonSchema.validate(lesson);

  if (error !== undefined) {
    res.status(400).json(error)
    return
  }

  const { title, description } = value;
  
  try {
    const lesson = await Lesson.create({ title, description, createdBy: user.id });
    res.json(lesson);
  } catch (e) {
    res.status(500).json({
      error: "failed to create lesson."
    });
  }
});

// update one 
router.patch("/:id", passport.authenticate("jwt", pOptions), adminRoute, async (req, res) => {
  const { params: { id }, body: { lesson } } = req;
  console.log(lesson);
  
  if (lesson === undefined) {
    res.status(400).json({
      error: "please provide lesson data to edit lesson"
    })
    return
  }

  const lessonSchema = Joi.object({
    id: Joi.optional(),
    title: Joi.string(),
    description: Joi.string(),
    instructionSheetLink: Joi.string().optional().allow(null),
    createdAt: Joi.optional(),
    updatedAt: Joi.optional(),
    createdBy: Joi.optional()
  });

  const { error, value } = lessonSchema.validate(lesson);
  if (error !== undefined) {
    res.status(400).json(error)
    return
  }

  try { 
    const i = await Lesson.update(value, {
      where: { id: id }
    })
    
    res.status(200).json({
      message: "lesson updated"
    })
  } catch(e) {
    res.status(404).json({
      error: "failed to find or update that record"
    })
  }
});

// delete one 
router.delete("/:id", passport.authenticate("jwt", pOptions), adminRoute, async (req, res) => {
  const { params: { id } } = req;

  try {
    await Lesson.destroy({
      where: {
        id: id
      }
    });

    res.json({
      "message": `Lesson with id ${id} deleted`
    })
  } catch (err) {
    res.status(500).json({
      "error": `failed to delete lesson with id ${id}`
    })
  }
})

module.exports = router;
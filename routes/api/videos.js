const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const { adminRoute } = require("../../utils/middleware");
const pOptions = {session: false}
const fs = require("fs")
const { Video } = require("../../models")
const multer = require("multer");

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
    const video = await Video.findByPk(id);

    if (video === null) {
      throw "Could't find that video"
    }
    res.status(200).json({
      video: video
    })
  } catch (e) {
    res.status(500).json({
      errors: "failed to get that video"
    })
  } 
})

router.get("/:id/stream", passport.authenticate("jwt-query-param", pOptions), async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Video.findByPk(id);
    const filePath = data.videoLink;
    if (filePath === null || filePath === undefined) {
      return res.status(404).json({
        error: "There is no video file."
      })
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] 
        ? parseInt(parts[1], 10)
        : fileSize-1
      const chunksize = (end-start)+1
      const file = fs.createReadStream(filePath, {start, end})
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(filePath).pipe(res)
    }
  } catch (e) {
    return res.status(500)
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

const upload = multer({
  storage: multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, file.originalname + '-' + Date.now())
    },
    destination: function (req, file, cb) {
      cb(null, `./${process.env.VIDEO_FILEPATH}`)
    },
  })
})

router.post("/:id/upload", passport.authenticate("jwt", pOptions), adminRoute, upload.single("videoFile"), async (req, res) => {
    
  const id = req.params.id;
  console.log("attempting to upload file")
  
  const videoFile = req.file;
  
  if (videoFile.mimetype !== "video/mp4") {
    return res.status(400).json({
      error: "only mp4s are supported"
    })
  }

  try {
    await Video.update({
      videoLink: `${process.env.VIDEO_FILEPATH}/${videoFile.filename}`
    }, {
      where: {id: id}
    })

    return res.status(200).json({
      message: "file uploaded"
    })
  } catch (e) {
    return res.status(500).json({
      error: "error updating video"
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
    id: Joi.optional(),
    title: Joi.string(),
    description: Joi.string(),
    partNumber: Joi.number(),
    videoLink: Joi.string().allow(null),
    lessonId: Joi.number(),
    createdAt: Joi.optional(),
    updatedAt: Joi.optional(),
    createdBy: Joi.optional()
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
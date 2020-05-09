const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const Joi = require("@hapi/joi");
const fileUpload = require('express-fileupload');
const { adminRoute } = require("../../utils/middleware");
const { fileStoragePath } = require("../../utils")
const pOptions = {session: false}
const fs = require("fs")
const path = require("path")
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

const uploadMiddleWare = fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: process.env.NODE_ENV === "dev" ? true : false,
  safeFileNames: true,
  preserveExtension: true
})

router.post("/:id/upload", passport.authenticate("jwt", pOptions), adminRoute, uploadMiddleWare, async (req, res) => {
  const id = req.params.id;
  console.log("attempting to upload file")

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  
  const videoFile = req.files.videoFile;
  if (videoFile.mimetype !== "video/mp4") {
    return res.status(400).json({
      error: "only mp4s are supported"
    })
  }
  const videoFileName = `${process.env.VIDEO_FILEPATH}/${videoFile.name}`
  videoFile.mv(videoFileName, async (err) => {
    if (err) {
      return res.status(500).json({
        error: "error uploading file"
      })
    }
    
    try {
      await Video.update({videoLink: videoFileName}, {where: {id: id}})
  
      return res.status(200).json({
        message: "file uploaded"
      })
    } catch (e) {
      return res.status(500).json({
        error: "error updating video"
      })  
    }
  });
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
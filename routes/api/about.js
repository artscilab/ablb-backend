const passport = require('passport');
const bodyParser = require("body-parser")
const router = require('express').Router();
const { adminRoute } = require("../../utils/middleware");
const pOptions = {session: false}
const { About } = require("../../models")

router.use(bodyParser.json());

router.get("*", async (req, res) => {
  try {
    const content = await About.findOne({where: { id: 1 }});
    
    if (content === null) {
      throw "No about page content"
    }

    res.json(content)
  } catch (e) {
    res.status(500).json({
      error: "failed to get about page content"
    }) 
  }
})

router.post("/content", passport.authenticate("jwt", pOptions), adminRoute, async (req, res, next) => {
  const { user, body: { htmlContent } } = req;
  
  if (htmlContent === undefined) {
    res.status(400).json({
      error: "Please provide html content of about page."
    })
    return
  }

  try {
    const contentToUpdate = await About.upsert({
      id: 1,
      content: htmlContent,
      updatedBy: user.id
    })

    res.status(200).json({
      message: "updated about page content"
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      error: "failed to update about page content"
    })
  }
})

module.exports = router;
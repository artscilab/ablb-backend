require("dotenv-safe").config({
  allowEmptyValues: true,
});
const morgan = require("morgan");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const querystring = require("querystring");
const errorHandler = require("errorhandler");
const fs = require('fs')
const path = require("path")
const isProduction = process.env.NODE_ENV === "production";

const { VIDEO_FILEPATH, PICTURE_FILEPATH } = process.env;
if (!fs.existsSync(VIDEO_FILEPATH)) {
  fs.mkdirSync(VIDEO_FILEPATH);
  console.log(`Created video filepath: ${VIDEO_FILEPATH}.`)
}

if (!fs.existsSync(PICTURE_FILEPATH)) {
  fs.mkdirSync(PICTURE_FILEPATH);
  console.log(`Created picture filepath: ${PICTURE_FILEPATH}.`)
}

const app = express();

app.get(`/${PICTURE_FILEPATH}/:fileName`, (req, res) => {
  let { fileName } = req.params;

  res.sendFile(path.join(__dirname+`/${PICTURE_FILEPATH}/${fileName}`));
})

app.use(express.static(path.join(__dirname, 'client/build')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));

if (!isProduction) {
  app.use(errorHandler())
}

require('./models');

require('./config/passport');
app.use(require('./routes'));

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

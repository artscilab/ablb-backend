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

const isProduction = process.env.NODE_ENV === "production";

if (!fs.existsSync(process.env.VIDEO_FILEPATH)) {
  console.log("video file path does not exist.");  
  process.exit(0)
}

const app = express();

const allowedOrigins = ['http://localhost:3000', "https://ablb.atec.io"];
app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true);

    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

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

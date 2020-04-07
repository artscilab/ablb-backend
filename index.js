require("dotenv").config();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const errorHandler = require("errorhandler");

const isProduction = process.env.NODE_ENV === "production";

const app = express();

const allowedOrigins = ['http://localhost:3000', "https://ablb.now.sh"];
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(session({
  secret: "hmmidkwhattoputhere",
  resave: true,
  saveUninitialized: true,
  name: 'ablb-session',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}))

if (!isProduction) {
  app.use(errorHandler())
}

require('./src/database');

require('./src/config/passport');
app.use(require('./src/routes'));

const port = process.env.PORT || 8000;


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

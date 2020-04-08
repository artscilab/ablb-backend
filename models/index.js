const Sequelize = require("sequelize");

const {DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST} = process.env;
const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
});

const User = require("./user")
const Testimonial = require("./testimonial");
const Lesson = require("./lesson");
const Video = require("./video");

User.init(sequelize).sync();
Testimonial.init(sequelize).sync();
Lesson.init(sequelize).sync();
Video.init(sequelize).sync();

module.exports = {
  User: User,
  Testimonial: Testimonial,
  Video: Video,
  Lesson: Lesson
}

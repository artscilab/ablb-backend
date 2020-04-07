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

User.init(sequelize).sync();
Testimonial.init(sequelize).sync();

module.exports = {
  User: User.User,
  Testimonial: Testimonial.Testimonial
}

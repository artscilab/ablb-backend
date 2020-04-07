require("dotenv").config();
const Confirm = require('prompt-confirm');

const prompt = new Confirm({
    message: 'This will erase all data in database. Proceed?',
    default: false
  }).ask((answer) => {
  
    if(!answer) {
      console.log("Terminating. No changes made.");
      process.exit(0);
    }

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

    const User = require("../models/user")
    const Testimonial = require("../models/testimonial");

    User.init(sequelize);
    Testimonial.init(sequelize);

    sequelize.sync({force: true}).then(() => {
      console.log("Force synced the database schema.");
      
      sequelize.close().then(() => {
        console.log("Closed db connection. Finished successfully.")
      });
    });
})

require("dotenv").config();
const Confirm = require('prompt-confirm');

const prompt = new Confirm({
    message: 'This will erase all data in database. Proceed?',
    default: false
  }).ask(async (answer) => {
  
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

    try {
      await sequelize.authenticate()
      console.log('Connection has been established successfully.');
    } catch (err) {
      console.error('Unable to connect to the database:', err);
    }

    const User = require("../models/user")
    const Lesson = require("../models/lesson")
    const Video = require("../models/Video")
    const Testimonial = require("../models/testimonial")

    User.init(sequelize);
    Testimonial.init(sequelize);
    Lesson.init(sequelize);
    Video.init(sequelize);

    try {
      await sequelize.sync({ force: true })
      console.log("Force synced the database schema.");
    } catch(err) {
      console.log("Error syncing tables.");
    }
    
    await sequelize.close();
    console.log("Closed db connection. Finished successfully.")
})
require("dotenv").config();
const Confirm = require('prompt-confirm');
const inquirer = require('inquirer')

const run = async () => {
  const proceed = new Confirm({
    message: 'This will erase all data in database. Proceed?',
    default: false
  });
  const proceedAnswer = await proceed.run();
  
  if (!proceedAnswer) {
    console.log("Terminating. No changes made.");
    process.exit(0);
  }

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: "What's your name?"
    },
    {
      type: 'input',
      name: 'email',
      message: "What's your email?"
    },
    {
      type: 'password',
      name: 'password',
      message: "Enter a password:"
    },
    {
      type: 'password',
      name: 'confirmPassword',
      message: "Repeat password:"
    },
  ]

  const accountAnswers = await inquirer.prompt(questions);
  if (accountAnswers.password !== accountAnswers.confirmPassword) {
    console.log("Make sure password and confirm password match! Terminating.")
    return
  }

  const Sequelize = require("sequelize");

  const {DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST} = process.env;
  if (
    DB_NAME === undefined || 
    DB_USERNAME === undefined || 
    DB_PASSWORD === undefined || 
    DB_HOST === undefined 
    ) {
      console.log("Please add enviroment config for database connection.")
    }

  const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql'
  });

  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    return
  }

  const User = require("../models/user")
  const Lesson = require("../models/lesson")
  const Video = require("../models/video")
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
  
  const { name, email, password } = accountAnswers;

  const { salt, hash } = User.generateHashes(password);
  const firstUser = await User.create({
    name, email, salt, hash, role: "admin", school: "UT Dallas"
  })
  console.log(`First admin user created with email ${email} and your password.`);

  await sequelize.close();
  console.log("Closed db connection. Finished successfully.")
}

(async () => {
  await run();
})()
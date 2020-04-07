const Sequelize = require("sequelize")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User } = require("./user");

const { Model, STRING, INTEGER, TEXT } = Sequelize;

class Testimonial extends Model {}

const init = (sequelize) => {
  Testimonial.init({
    text: {
      type: TEXT
    },
    name: {
      type: STRING,
    },
    school: {
      type: STRING
    },
    createdBy: {
      type: INTEGER,
      references: {
        model: User,
        key: "id",
      }
    }
  }, {
    sequelize,
    modelName: "testimonial"
  })

  return Testimonial
} 

module.exports = {
  init, 
  Testimonial
}
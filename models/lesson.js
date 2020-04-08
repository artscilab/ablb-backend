const Sequelize = require("sequelize")
const User = require("./user");

const { Model, STRING, INTEGER, TEXT } = Sequelize;

class Lesson extends Model {
  static init(sequelize_instance) {
    return super.init({
      title: {
        type: STRING
      },
      description: {
        type: TEXT,
      },
      instructionSheetLink: {
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
      sequelize: sequelize_instance,
      modelName: "lesson"
    })
  }
}

module.exports = Lesson
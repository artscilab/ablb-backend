const Sequelize = require("sequelize")
const User = require("./user");

const { Model, INTEGER, TEXT } = Sequelize;

class About extends Model {
  static init(sequelize_instance) {
    return super.init({
      content: {
        type: TEXT
      },
      updatedBy: {
        type: INTEGER,
        references: {
          model: User,
          key: "id",
        }
      }
    }, {
      sequelize: sequelize_instance,
      modelName: "about",
      tableName: "about"
    })
  }
}

module.exports = About
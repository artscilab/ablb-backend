const Sequelize = require("sequelize");
const User = require("./user")

const { Model, STRING, TEXT, INTEGER } = Sequelize;

class Person extends Model {
  static init(sequelize_instance) {
    return super.init({
      name: {
        type: STRING,
        allowNull: false
      },
      bio: {
        type: TEXT,
      },
      school: {
        type: TEXT
      },
      imageurl: {
        type: TEXT
      },
      personalLink: {
        type: TEXT
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
      modelName: "person"
    })
  }
}

module.exports = Person
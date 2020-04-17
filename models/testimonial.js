const Sequelize = require("sequelize")
const User = require("./user");

const { Model, STRING, INTEGER, TEXT, BOOLEAN } = Sequelize;

class Testimonial extends Model {
  static init(sequelize_instance) {
    return super.init({
      text: {
        type: TEXT
      },
      name: {
        type: STRING,
      },
      school: {
        type: STRING
      },
      featured: {
        type: BOOLEAN,
        defaultValue: false,
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
      modelName: "testimonial"
    })
  }
}

module.exports = Testimonial
const Sequelize = require("sequelize")
const User = require("./user");

const { Model, STRING, INTEGER, TEXT } = Sequelize;

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

  static findAll(params) {
    const result = super.findAll(params);
    const mapped = result.map(res => {
      const {
        id, name, text, school
      } = res.dataValues;
      return {
        id, name, text, school
      }
    });

    return mapped;
  }
}

module.exports = Testimonial
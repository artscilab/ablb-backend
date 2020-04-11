const Sequelize = require("sequelize")
const User = require("./user");
const Lesson = require("./lesson");

const { Model, STRING, INTEGER, TEXT } = Sequelize;

class Video extends Model {
  static init(sequelize_instance) {
    return super.init({
      id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      description: {
        type: TEXT
      },
      title: {
        type: STRING,
      },
      partNumber: {
        type: INTEGER,
      },
      videoLink: {
        type: TEXT,
      },
      createdBy: {
        type: INTEGER,
        references: {
          model: User,
          key: "id",
        }
      },
      lessonId: {
        type: INTEGER,
        primaryKey: true,
        references: {
          model: Lesson,
          key: "id"
        }
      }
    }, {
      sequelize: sequelize_instance,
      modelName: "video"
    })
  }

  static findAll(params) {
    const result = super.findAll(params);
    const mapped = result.map(res => {
      const {
        id, description, title, partNumber, lessonId
      } = res.dataValues;
      return {
        id, description, title, partNumber, lessonId
      }
    });

    return mapped;
  }
}

module.exports = Video
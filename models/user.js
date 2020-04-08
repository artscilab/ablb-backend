const Sequelize = require("sequelize")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { Model, STRING } = Sequelize;

class User extends Model {
  static init(sequelize_instance) {
    return super.init({
      email: {
        type: STRING,
        unique: true
      },
      hash: STRING,
      salt: STRING,
      school: STRING,
      role: STRING,
      name: STRING,
    }, {
      sequelize: sequelize_instance,
      modelName: "user"
    })  
  }

  setPassword() {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString("hex");
  }

  validatePassword() {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString("hex");
    return this.hash == hash;
  }

  generateJWT() {
    const now = new Date();
    const expriration = new Date(now);
    expriration.setDate(now.getDate() + 5);
  
    return jwt.sign({
      email: this.email,
      id: this._id,
      exp: parseInt(expriration.getTime() / 1000, 10)
    }, process.env.JWT_KEY)
  }

  toAuthJSON() {
    return {
      _id: this._id,
      email: this.email,
      token: token
    };
  }
}

module.exports = User
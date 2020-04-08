const Sequelize = require("sequelize")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { Model, STRING, TEXT } = Sequelize;

class User extends Model {
  static init(sequelize_instance) {
    return super.init({
      email: {
        type: STRING,
        unique: true
      },
      hash: TEXT,
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
  }
  
  static generateHashes(password) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString("hex")
    
    return {
      salt, hash
    }
  }

  validatePassword(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString("hex");
    return this.hash == hash;
  }

  static generateJWT(email, id) {
    const now = new Date();
    const expriration = new Date(now);
    expriration.setDate(now.getDate() + 5);
  
    return jwt.sign({
      email: email,
      id: id,
      exp: parseInt(expriration.getTime() / 1000, 10)
    }, process.env.JWT_KEY)
  }

  toAuthJSON() {
    return {
      id: this.id,
      email: this.email,
      school: this.school,
      role: this.role,
      token: this.token
    };
  }
}

module.exports = User
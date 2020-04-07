const Sequelize = require("sequelize")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { Model, STRING } = Sequelize;

class User extends Model {}

const schema = {
  email: {
    type: STRING,
    unique: true
  },
  hash: {
    type: STRING,
  },
  salt: {
    type: STRING,
  },
  school: {
    type: STRING,
  },
  role: {
    type: STRING,
  },
  name: {
    type: STRING,
  },
}

const init = (sequelize) => {
  User.init(schema, {
    sequelize,
    modelName: "user"
  })
  
  User.prototype.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString("hex");
  }
  
  User.prototype.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString("hex");
    return this.hash == hash;
  }
  
  User.prototype.generateJWT = function() {
    const now = new Date();
    const expriration = new Date(now);
    expriration.setDate(now.getDate() + 5);
  
    return jwt.sign({
      email: this.email,
      id: this._id,
      exp: parseInt(expriration.getTime() / 1000, 10)
    }, process.env.JWT_KEY)
  }
  
  User.prototype.toAuthJSON = function(token) {
    return {
      _id: this._id,
      email: this.email,
      token: token
    };
  };

  return User
} 

module.exports = {
  init, 
  User
}
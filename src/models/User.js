const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;
const { Types } = Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true
  },
  hash: String,
  salt: String,
  school: String,
});

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString("hex");
}

UserSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString("hex");
  return this.hash == hash;
}

UserSchema.methods.generateJWT = function() {
  const now = new Date();
  const expriration = new Date(now);
  expriration.setDate(now.getDate() + 5);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expriration.getTime() / 1000, 10)
  }, process.env.JWT_KEY)
}

UserSchema.methods.toAuthJSON = function(token) {
  return {
    _id: this._id,
    email: this.email,
    token: token
  };
};

mongoose.model("User", UserSchema)
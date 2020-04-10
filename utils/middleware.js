const User = require("../models/user");

const adminRoute = async function (req, res, next) {
  const { user } = req;

  const loadedUser = await User.findOne({ 
    where: {
      id: user.id
    }
  })

  if (loadedUser.role !== 'admin') {
    res.status(401).json({
      error: "you must be an admin to access this"
    })
    return;
  }
  
  next()
}

module.exports = {
  adminRoute
}
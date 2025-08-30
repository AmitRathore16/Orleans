const jwt = require("jsonwebtoken");
const { User } = require("../models/user.js");
const admin = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res
        .status(401)
        .json({ msg: "No authentication token, access denied" });
    }

    const verified = jwt.verify(token, "PasswordKey");
    if (!verified) {
      return res
        .status(401)
        .json({ msg: "Token verification failed, access denied" });
    }
    const user = await User.findById(verified.id);
    if (user.type == "user" || user.type == "seller") {
      return res.status(401).json({ msg: "Access denied, admin only" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = admin;

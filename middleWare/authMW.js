const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "config/config.env" });

module.exports = function (req, res, next) {
  //get token from header
  const token = req.header("x-auth-token");

  //check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWTTOKEN);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

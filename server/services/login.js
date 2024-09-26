const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const generateToken = require("../utils/jwtUtils.js");

module.exports = async function login(enrollment, password) {
  try {
    const existingUser = await User.findOne({ enrollment: enrollment });
    if (!existingUser) {
      throw new Error("User not found");
    }
    const isPasswordValid = existingUser.mobile == password ? true : false;
    if (!isPasswordValid) {
      throw new Error({ message: "Incorrect password!" });
    }
    const token = generateToken(existingUser);
    return token;
  } catch (err) {
    throw new Error({ message: "Invalid credentials!" });
  }
};

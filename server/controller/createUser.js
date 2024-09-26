const User = require("../models/User");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  try {
    const { enrollment } = req.body;

    const existingUser = await User.findOne({ enrollment });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    console.error("Error creating new user:", error);
    res.status(500).json({ error: "Could not create new user" });
  }
};

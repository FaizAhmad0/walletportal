const User = require("../models/User");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  try {
    const {
      enrollment,
      name,
      email,
      address,
      gst,
      mobile,
      gms,
      country,
      amount,
      pincode,
      state,
      role = "manager",
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ enrollment });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create a new user object
    const newUser = new User({
      enrollment,
      name,
      email,
      address,
      gst,
      mobile,
      gms,
      country,
      amount,
      pincode,
      state,
      role,
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    console.error("Error creating new user:", error);
    res.status(500).json({ error: "Could not create new user" });
  }
};

const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error finding all  product:", error);
    res.status(500).json({ error: "Could not find all product" });
  }
};

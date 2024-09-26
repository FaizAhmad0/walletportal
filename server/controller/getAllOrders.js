const User = require("../models/User");
module.exports = async (req, res) => {
  try {
    const orders = await User.find({});
    res.status(201).json({ orders });
  } catch (error) {
    console.error("Error finding all  product:", error);
    res.status(500).json({ error: "Could not find all product" });
  }
};

const User = require("../models/User");
module.exports = async (req, res) => {
  try {
    const { name } = req.params;
    const orders = await User.find({ manager: name });
    res.status(201).json({ orders });
  } catch (error) {
    console.error("Error finding all  product:", error);
    res.status(500).json({ error: "Could not find all product" });
  }
};

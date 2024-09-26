const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const manage = req.params.manager;
    const manager = await User.findOne({ name: manage });
    console.log(manager);
    res.status(200).json({ manager });
  } catch (error) {
    console.error("Error finding manager:", error);
    res.status(500).json({ error: "Could not find manager" });
  }
};

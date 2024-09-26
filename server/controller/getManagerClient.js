const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { name } = req.params;

    const clients = await User.find({ manager: name, role: "user" });

    res.status(200).json({ clients });
  } catch (error) {
    console.error("Error finding clients:", error);
    res.status(500).json({ error: "Could not find clients" });
  }
};

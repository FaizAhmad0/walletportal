const User = require("../models/User");
module.exports = async (req, res) => {
  try {
    const { clientId, manager } = req.body;
    const client = await User.findById(clientId);
    client.manager = manager;
    await client.save();

    res.status(200).json({ message: "Manager assigned successfully" });
  } catch (error) {
    console.error("Error assigning manager:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

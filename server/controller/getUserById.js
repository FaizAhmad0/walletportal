const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Found the user", user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

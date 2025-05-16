const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { enrollment } = req.params;

    if (!enrollment) {
      return res.status(400).json({ error: "Enrollment number is required" });
    }

    const user = await User.findOne({ enrollment, role: "user" });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error finding user by enrollment:", error);
    res.status(500).json({ error: "Could not find user" });
  }
};

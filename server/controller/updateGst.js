const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { enrollment } = req.params;
    const { gst } = req.body;

    if (!enrollment) {
      return res
        .status(400)
        .json({ error: "Enrollment parameter is required." });
    }

    if (!gst) {
      return res.status(400).json({ error: "GST value is required." });
    }

    const user = await User.findOne({ enrollment: enrollment });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.gst = String(gst);
    await user.save();

    res.status(200).json({ message: "GST updated successfully", user });
  } catch (error) {
    console.error("Error updating gst:", error);
    res.status(500).json({ error: "Failed to update GST." });
  }
};

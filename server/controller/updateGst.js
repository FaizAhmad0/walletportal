const User = require("../models/User");
const { use } = require("../routes/User");
module.exports = async (req, res) => {
  try {
    const { enrollment } = req.params;
    const { gst } = req.body;

    const user = await User.findOne({ enrollment: enrollment });
    user.gst = String(gst);
    await user.save();
    res.status(200).json({ message: "gst updated", user });
  } catch (error) {
    console.error("Error updating gst:", error);
    res.status(500).json({ error: "Failed to update gst." });
  }
};

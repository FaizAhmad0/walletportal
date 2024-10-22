const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, formData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Failed to update user details." });
  }
};

const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    let { gms } = req.body;
    gms = Number(gms);
    if (isNaN(gms)) {
      return res.status(400).json({ error: "Invalid GMS value" });
    }
    const user = await User.findById(id);
    user.gms += gms;
    await user.save();
    res.status(201).json({ message: "GMS updated successfully!" });
  } catch (error) {
    console.error("Error in updating user GMS:", error);
    res.status(500).json({ error: "Could not update the GMS of user" });
  }
};

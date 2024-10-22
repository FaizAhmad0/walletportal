const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { clientId } = req.params;
    const walletUser = await User.findByIdAndDelete(clientId);

    res.status(200).json({ message: "User deleted successfully!", walletUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Could not delete user" });
  }
};

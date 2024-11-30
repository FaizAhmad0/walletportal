const User = require("../models/User");
const authService = require("../services/login");

module.exports = async (req, res) => {
  try {
    const { enrollment, password } = req.body;
    console.log(enrollment, password);

    const user = await User.findOne({ enrollment });
    if (!user) {
      return res.status(404).json({ message: "User not exists!" });
    }

    const token = await authService(enrollment, password);

    res.status(200).json({
      token: token,
      name: user.name,
      enrollment: user.enrollment,
      email: user.email,
      message: "Logged in successfully!",
      id: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ error: "Server error during login!" });
  }
};

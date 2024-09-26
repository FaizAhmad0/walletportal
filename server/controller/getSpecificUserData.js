const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { enrollment } = req.params;
    console.log("Enrollment number of the user is : ", enrollment);
    const user = await User.findOne({ enrollment: enrollment });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error finding userdata :", error);
    res.status(500).json({ error: "Could not find userdata" });
  }
};

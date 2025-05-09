// const User = require("../models/User");

// module.exports = async (req, res) => {
//   try {
//     const users = await User.find({ role: "user" });
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("Error finding all  users:", error);
//     res.status(500).json({ error: "Could not find all users" });
//   }
// };

const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const users = await User.find(
      { role: "user" },
      "enrollment name mobile address amount gst orders"
    );

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error finding all users:", error);
    res.status(500).json({ error: "Could not find all users" });
  }
};

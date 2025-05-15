// const User = require("../models/User");

// module.exports = async (req, res) => {
//   try {
//     const clients = await User.find({ role: "user" });

//     res.status(200).json({ clients });
//   } catch (error) {
//     console.error("Error finding clients:", error);
//     res.status(500).json({ error: "Could not find clients" });
//   }
// };

const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const clients = await User.find(
      { role: "user" },
      "name email enrollment mobile amount transactions"
    ); // Only select specific fields

    res.status(200).json({ clients });
  } catch (error) {
    console.error("Error finding clients:", error);
    res.status(500).json({ error: "Could not find clients" });
  }
};

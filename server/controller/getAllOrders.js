const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const orders = await User.find(
      {},
      "orders name email enrollment amount manager"
    )
      .sort({ createdAt: -1 }) // sort by most recent
      .limit(200); // get last 10

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error finding users with selected fields:", error);
    res.status(500).json({ error: "Could not retrieve user data" });
  }
};

// const User = require("../models/User");
// module.exports = async (req, res) => {
//   try {
//     const orders = await User.find({});
//     res.status(201).json({ orders });
//   } catch (error) {
//     console.error("Error finding all  product:", error);
//     res.status(500).json({ error: "Could not find all product" });
//   }
// };

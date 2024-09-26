const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { name } = req.params;
    const users = await User.find({ manager: name, role: "user" }).select(
      "orders"
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No clients found" });
    }
    const orders = users.flatMap((user) => user.orders);

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching client orders:", error);
    res.status(500).json({ message: "Server error. Unable to fetch orders." });
  }
};

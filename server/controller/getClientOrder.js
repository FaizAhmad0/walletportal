const User = require("../models/User");
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("orders");

    if (!user) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ orders: user.orders });
  } catch (error) {
    console.error("Error fetching client orders:", error);
    res.status(500).json({ message: "Server error. Unable to fetch orders." });
  }
};

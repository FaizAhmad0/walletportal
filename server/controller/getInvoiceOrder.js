const User = require("../models/User");
const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    const user = await User.findOne({ "orders._id": orderId });

    if (!user) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order = user.orders.id(orderId); 
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error. Unable to fetch order." });
  }
};

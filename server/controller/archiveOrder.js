const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = await User.findOne({ "orders._id": orderId });

    if (!user) {
      return res.status(404).json({ error: "User or order not found" });
    }
    const order = user.orders.id(orderId);
    if (order) {
      order.archive = true;
      await user.save();
      res.status(200).json({ message: "Order archived successfully", order });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error archiving order:", error);
    res.status(500).json({ error: "Could not archive order" });
  }
};

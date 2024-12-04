const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Find the user that contains the specified order in their orders array
    const user = await User.findOne({ "orders.orderId": orderId });

    if (!user) {
      return res.status(404).json({ error: "User or order not found" });
    }

    // Find the specific order in the user's orders array
    const order = user.orders.find((order) => order.orderId === orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order's shipped status
    order.shipped = false;

    // Save the user document with the updated order
    await user.save();

    res.status(200).json({
      message: "Order marked as unshipped successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

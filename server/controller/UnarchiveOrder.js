const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { enrollment, orderId } = req.body;

    // Find user by enrollment
    const user = await User.findOne({ enrollment });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find order within user's orders by orderId
    const order = user.orders.find(
      (order) => order.orderId === parseInt(orderId)
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order archive status and save the user
    order.archive = false;
    await user.save();

    // Return the unarchived order details
    res.status(200).json({
      message: "Order unarchived successfully",
      order,
    });
  } catch (error) {
    console.error("Error unarchiving order:", error);
    res.status(500).json({ error: "Could not unarchive order" });
  }
};

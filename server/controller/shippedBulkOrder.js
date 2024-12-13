const BulkOrder = require("../models/BulkOrder");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.body;
    // Find the order by ID and update the "shipped" status to true
    const order = await BulkOrder.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.shipped = true;
    await order.save();

    res.status(200).json({ message: "Order marked as shipped", order });
  } catch (error) {
    console.error("Error marking order as shipped:", error);
    res.status(500).json({ message: "Failed to mark order as shipped" });
  }
};

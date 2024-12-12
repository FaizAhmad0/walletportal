const BulkOrder = require("../models/BulkOrder");

module.exports = async (req, res) => {
  try {
    const { orderId, value } = req.body;

    // Find the order by orderId
    const order = await BulkOrder.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the boxLabel field
    order.pickupDate = value;

    // Save the updated order
    await order.save();

    res.json({ message: "Pickup Date updated successfully", order });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update box label", details: err.message });
  }
};

const BulkOrder = require("../models/BulkOrder");

module.exports = async (req, res) => {
  try {
    const { id } = req.params; // Extract the order ID from request params
    const data = req.body; // Extract data from the request body

    // Find the order by ID and update it with the new data
    const order = await BulkOrder.findByIdAndUpdate(id, data, {
      new: true, // Return the updated document
      runValidators: true, // Ensure that the update respects schema validation
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.status(200).json({
      message: "Order updated successfully",
      updatedOrder: order, // Optionally send the updated order back
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order." });
  }
};

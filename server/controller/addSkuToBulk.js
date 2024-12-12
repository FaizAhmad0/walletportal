const BulkOrder = require("../models/BulkOrder");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.params; // Extract orderId from request parameters
    const { sku } = req.body; // Extract SKU data from request body

    // Validate SKU input
    if (!sku || !Array.isArray(sku)) {
      return res
        .status(400)
        .json({ error: "Invalid SKU data. SKU must be an array." });
    }

    // Find the bulk order by orderId
    const order = await BulkOrder.findOne({ orderId });

    // If order not found, return a 404 response
    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found. Please provide a valid orderId." });
    }

    // Append new SKU data to the existing SKU array
    order.sku = [...(order.sku || []), ...sku];
    await order.save(); // Save the updated order

    // Respond with a success message and the updated order details
    res.status(200).json({
      message: "SKU data added successfully.",
      order,
    });
  } catch (error) {
    // Log and respond with a 500 error message in case of any issues
    console.error("Error adding SKU data:", error);
    res
      .status(500)
      .json({ error: "Could not add SKU data due to server error!" });
  }
};

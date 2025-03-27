const BulkOrder = require("../models/BulkOrder");

module.exports = async (req, res) => {
  try {
    const {
      orderId,
      stockStatus,
      stockReadyDate,
      shippingAddress,
      shippingType,
      trackingId,
      shippingCompany,
    } = req.body;
    // console.log(req.body);

    // Validate request data
    if (
      !orderId ||
      !stockStatus ||
      !shippingAddress ||
      !shippingType ||
      !trackingId ||
      !shippingCompany
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Find the order by ID
    const order = await BulkOrder.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Update order details
    order.stockStatus = stockStatus;
    order.stockReadyDate = stockReadyDate ? new Date(stockReadyDate) : null;
    order.shippingAddress = shippingAddress;
    order.shippingType = shippingType;
    order.trackingId = trackingId;
    order.shippingCompany = shippingCompany;

    await order.save();

    return res
      .status(200)
      .json({ message: "Order details updated successfully.", order });
  } catch (error) {
    console.error("Error updating order details:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

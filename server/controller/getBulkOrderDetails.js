const BulkOrder = require("../models/BulkOrder");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await BulkOrder.find({ orderId: id });
    res.status(200).json({ message: "order found", order });
  } catch (error) {
    console.error("Error creating bulk order:", error);
    res.status(500).json({ error: "Could not create bulk order!" });
  }
};

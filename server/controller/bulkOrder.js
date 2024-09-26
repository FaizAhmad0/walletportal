const BulkOrder = require("../models/BulkOrder");

module.exports = async (req, res) => {
  try {
    const newOrder = new BulkOrder(req.body);
    await newOrder.save();
    res
      .status(201)
      .json({ message: "Bulk order created successfully!", newOrder });
  } catch (error) {
    console.error("Error creating bulk order:", error);
    res.status(500).json({ error: "Could not create bulk order!" });
  }
};

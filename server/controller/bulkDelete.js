const BulkOrder = require("../models/BulkOrder");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);
    const deletedOrder = await BulkOrder.findByIdAndDelete(id);
    res
      .status(201)
      .json({ message: "Order deleted successfully!", deletedOrder });
  } catch (error) {
    console.error("Error in deleting the bulk order:", error);
    res.status(500).json({ error: "Could not delete bulk order!" });
  }
};

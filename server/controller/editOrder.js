const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const { selectedOrderId } = req.params;
    const {
      amazonOrderId,
      trackingId,
      sku,
      name,
      price,
      quantity,
      pincode,
      shippingPartner,
      productAction,
    } = req.body;

    const user = await User.findOne({
      "orders.items._id": selectedOrderId,
    });
    console.log(productAction);

    if (!user) {
      return res.status(404).json({ error: "User or item not found" });
    }
    const orderWithItem = user.orders.find((order) =>
      order.items.id(selectedOrderId)
    );

    if (!orderWithItem) {
      return res.status(404).json({ error: "Order or item not found" });
    }
    const item = orderWithItem.items.id(selectedOrderId);
    item.amazonOrderId = amazonOrderId;
    item.trackingId = trackingId;
    item.quantity = quantity;
    item.pincode = pincode;
    item.shippingPartner = shippingPartner;
    item.totalPrice = price * quantity;
    item.productAction = productAction;

    await user.save();

    const updatedOrder = user.orders.find((order) =>
      order.items.id(selectedOrderId)
    );
    const finalAmount = updatedOrder.items.reduce((total, currentItem) => {
      return total + Number(currentItem.totalPrice);
    }, 0);

    // Add 18% GST to the finalAmount
    const gstAmount = finalAmount * 0.18;
    const finalAmountWithGst = finalAmount + gstAmount;

    // Convert final amount with GST to a string
    updatedOrder.finalAmount = finalAmountWithGst.toFixed(2).toString();

    // const finalAmount = updatedOrder.items.reduce((total, currentItem) => {
    //   return total + Number(currentItem.totalPrice);
    // }, 0);

    // // console.log(finalAmount);
    // updatedOrder.finalAmount = finalAmount.toString();
    await user.save();

    res.status(200).json({
      message: "Item updated successfully!",
      item,
      finalAmount,
    });
  } catch (error) {
    console.error("Error updating item or calculating final amount:", error);
    res
      .status(500)
      .json({ error: "Could not update the item or calculate final amount" });
  }
};

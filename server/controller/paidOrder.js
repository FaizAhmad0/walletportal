const User = require("../models/User");
const doubletick = require("@api/doubletick"); // Make sure you have this installed and correctly configured.

doubletick.auth("key_nFcFMAxjiz"); // Replace this with your actual API key

module.exports = async (req, res) => {
  try {
    const { enrollment } = req.params;
    const user = await User.findOne({ enrollment: enrollment });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { items, finalAmount } = req.body;
    const flattenedItems = items.flat();
    user.amount -= finalAmount;
    user.gms += parseFloat(finalAmount);
    const newTransaction = {
      amount: finalAmount,
      debit: true,
      description: "Deduct amount while purchasing the product!",
    };

    user.transactions.push(newTransaction);

    const newOrder = {
      items: flattenedItems,
      finalAmount: finalAmount,
      paymentStatus: true,
    };
    user.orders.push(newOrder);
    await user.save();
    const whatsappMessage = {
      messages: [
        {
          content: {
            language: "en",
            templateData: {
              buttons: [
                {
                  type: "URL",
                  url: `https://example.com/track?orderId=12345`, // Use a real or dynamic orderId
                  title: "Track Delivery",
                },
              ],
            },
            templateName: "dispatch", // Ensure this matches the exact name in your WhatsApp template
          },
          from: "Saumic Craft", // Sender's name
          to: user.mobile, // Recipient's mobile number
        },
      ],
    };

    doubletick
      .outgoingMessagesWhatsappTemplate(whatsappMessage)
      .then(({ data }) => {
        console.log("WhatsApp message sent:", data);
      })
      .catch((err) => {
        console.error("Error sending WhatsApp message:", err);
      });
    res.status(200).json({ message: "order created successfully" });
  } catch (error) {
    console.error("Error saving order to orders:", error);
    res.status(500).json({ error: "Could not save order to orders" });
  }
};

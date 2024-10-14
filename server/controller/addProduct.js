const User = require("../models/User");
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  try {
    const { enrollment } = req.params;
    const user = await User.findOne({ enrollment: enrollment });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { items, finalAmount } = req.body;
    console.log(items);
    const flattenedItems = items.flat();

    const newOrder = {
      items: flattenedItems,
      finalAmount: finalAmount,
    };
    user.orders.push(newOrder);
    await user.save();

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Order Confirmation",
      text: `Hello ${user.name},\n\nYour order has been successfully created!\n\nOrder details:\nItems: ${flattenedItems.length} items\nTotal Amount: ₹${finalAmount}\n\nThank you for your purchase!\n\nBest regards,\nSaumic Craft.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res
      .status(200)
      .json({ message: "Order successfully saved and email sent" });
  } catch (error) {
    console.error("Error saving order to orders:", error);
    res.status(500).json({ error: "Could not save order to orders" });
  }
};

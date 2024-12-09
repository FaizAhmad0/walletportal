const User = require("../models/User");
const nodemailer = require("nodemailer");
const doubletick = require("@api/doubletick"); // Make sure you have this installed and correctly configured.

doubletick.auth("key_49uMaEQ635"); // Replace this with your actual API key

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
    user.gms += Number(finalAmount);

    const newOrder = {
      items: flattenedItems,
      finalAmount: finalAmount,
    };
    user.orders.push(newOrder);
    await user.save();

    // Send confirmation email
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

    // Send WhatsApp message using Double Tick API
    const whatsappMessage = {
      messages: [
        {
          content: {
            language: "en",
            templateData: {
              buttons: [
                {
                  type: "URL",
                  url: "https://example.com",
                  title: "View Order",
                }, // Update this URL as necessary
              ],
            },
            templateName: "hello", // Make sure the template exists on Double Tick
          },
          from: "Double Tick",
          //from: process.env.WHATSAPP_FROM_NUMBER,
          // Sender's WhatsApp number (should be in your environment variables)
          to: user.mobile,
        },
      ],
    };

    // doubletick
    //   .outgoingMessagesWhatsappTemplate(whatsappMessage)
    //   .then(({ data }) => {
    //     console.log("WhatsApp message sent:", data);
    //   })
    //   .catch((err) => {
    //     console.error("Error sending WhatsApp message:", err);
    //   });

    res.status(200).json({
      message:
        "Order successfully saved, email sent, and WhatsApp message queued",
    });
  } catch (error) {
    console.error("Error saving order to orders:", error);
    res.status(500).json({ error: "Could not save order to orders" });
  }
};

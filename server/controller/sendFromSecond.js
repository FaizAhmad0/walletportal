const User = require("../models/User");
const nodemailer = require("nodemailer");
const doubletick = require("@api/doubletick"); // Ensure you have this installed and correctly configured.
require("dotenv").config(); // Load environment variables

const data = process.env.DOUBLETICK_SECOND_API;

if (!data) {
  console.error(
    "Environment variable DOUBLETICK_SECOND_API is not set or accessible."
  );
} else {
  console.log("API Key:", data);
}
doubletick.auth(data); // Replace this with your actual API key

module.exports = async (req, res) => {
  try {
    // Fetch and log all templates
    const templates = await doubletick.getTemplates(); // Replace `getTemplates` with the correct function name if different.
    console.log("Available Templates:", templates);

    const { enrollment } = req.body;
    const user = await User.findOne({ enrollment: enrollment });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
            templateName: "training_sunday", // Make sure the template exists on Double Tick
          },
          from: "Double Tick",
          to: user.mobile,
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

    res.status(200).json({
      message:
        "Order successfully saved, email sent, templates printed, and WhatsApp message queued",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

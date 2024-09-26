const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const config = require("../config/config");

// Initialize Instamojo with API Key and Auth Token
Instamojo.setKeys(config.instamojoApiKey, config.instamojoAuthToken);
Instamojo.isSandboxMode(config.instamojoSandboxMode);

exports.initiatePayment = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const paymentData = new Instamojo.PaymentData();
    paymentData.purpose = "Test Payment";
    paymentData.amount = amount.toString();
    paymentData.buyer_name = user.name;
    paymentData.email = user.email;
    paymentData.phone = user.mobile;
    paymentData.redirect_url = config.redirectUrl;

    Instamojo.createPayment(paymentData, (error, response) => {
      if (error) {
        console.error("Error creating payment:", error);
        return res.status(500).send("Error processing payment");
      } else {
        const paymentResponse = JSON.parse(response);
        res.redirect(paymentResponse.payment_request.longurl);
      }
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Error processing payment" });
  }
};

exports.verifyPayment = async (req, res) => {
  const { payment_id, payment_request_id } = req.query;

  Instamojo.getPaymentDetails(payment_request_id, (error, response) => {
    if (error) {
      console.error("Error fetching payment details:", error);
      return res.status(500).send("Error fetching payment details");
    } else {
      const paymentDetails = JSON.parse(response);
      if (paymentDetails.payment_request.status === "Completed") {
        res.send("Payment successful");
      } else {
        res.send("Payment failed");
      }
    }
  });
};

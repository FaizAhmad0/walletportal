const User = require("../models/User");
const Instamojo = require("instamojo-nodejs");
const dotenv = require("dotenv");

dotenv.config();

Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN
);

Instamojo.isSandboxMode(true); // Set to false for production

module.exports = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.amount += amount;
    await user.save();
    const paymentData = new Instamojo.PaymentData();
    paymentData.purpose = "Test Payment";
    paymentData.amount = amount.toString();
    paymentData.buyer_name = user.name;
    paymentData.email = user.email;
    paymentData.phone = user.mobile;
    paymentData.redirect_url = "http://localhost:3000/wallet";

    Instamojo.createPayment(paymentData, function (error, response) {
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

const express = require("express");
const cors = require("cors");
const Instamojo = require("instamojo-nodejs");
const dotenv = require("dotenv");
const User = require("../models/User");
const axios = require("axios");

dotenv.config();

const router = express.Router();

router.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://wallet.saumiccraft.com"
        : "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY;
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;

// Set the correct Instamojo URL for production or testing
const INSTAMOJO_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.instamojo.com/api/1.1"
    : "https://test.instamojo.com/api/1.1";

// Initialize Instamojo with API keys
Instamojo.setKeys(INSTAMOJO_API_KEY, INSTAMOJO_AUTH_TOKEN);

// Set sandbox mode based on environment (false for production, true for testing)
Instamojo.isSandboxMode(process.env.NODE_ENV !== "production");

router.post("/add-balance", async (req, res) => {
  const { userId, amount } = req.body;
  console.log("Instamojo API Key:", INSTAMOJO_API_KEY);
  console.log("Instamojo Auth Token:", INSTAMOJO_AUTH_TOKEN);
  console.log("Instamojo URL:", INSTAMOJO_URL);

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response = await axios.post(
      `${INSTAMOJO_URL}/payment-requests/`,
      {
        purpose: "Add Balance",
        amount: amount,
        buyer_name: user.name,
        email: user.email,
        phone: user.mobile,
        redirect_url:
          process.env.NODE_ENV === "production"
            ? "https://wallet.saumiccraft.com/payment-status"
            : "http://localhost:3000/payment-status",
      },
      {
        headers: {
          "X-Api-Key": INSTAMOJO_API_KEY,
          "X-Auth-Token": INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    res.status(200).json({ paymentURL: response.data.payment_request.longurl });
  } catch (error) {
    console.error(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to create payment request" });
  }
});

router.post("/verify-payment", async (req, res) => {
  const { paymentRequestId, paymentId, userId } = req.body;

  try {
    const user = await User.findById(userId);

    // start
    const isDuplicate = user.transactions.some(
      (txn) => txn.paymentId === paymentId
    );

    if (isDuplicate) {
      return res
        .status(200)
        .json({ success: true, message: "Payment already recorded" });
    } //end

    const response = await axios.get(
      `${INSTAMOJO_URL}/payment-requests/${paymentRequestId}`,
      {
        headers: {
          "X-Api-Key": INSTAMOJO_API_KEY,
          "X-Auth-Token": INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    const payment = response.data.payment_request.payments.find(
      (payment) => payment.payment_id === paymentId
    );

    if (payment && payment.status === "Credit") {
      const amount = Number(response.data.payment_request.amount);
      user.amount += amount;
      const newTransaction = {
        amount: amount,
        credit: true,
        description: "Added Balance",
      };

      user.transactions.push(newTransaction);
      await user.save();

      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

module.exports = router;

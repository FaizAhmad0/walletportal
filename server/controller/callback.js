const User = require("../models/User");
const Instamojo = require("instamojo-nodejs");
module.exports = async (req, res) => {
  const paymentId = req.query.payment_id;
  const paymentRequestId = req.query.payment_request_id;

  Instamojo.getPaymentDetails(paymentRequestId, function (error, response) {
    if (error) {
      res.status(500).send("Error fetching payment details");
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


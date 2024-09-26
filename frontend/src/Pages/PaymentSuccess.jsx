import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { message, Spin } from "antd";
const backendUrl = process.env.REACT_APP_BACKEND_URL;


const PaymentSuccess = () => {
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const payment_id = queryParams.get("payment_id");
    const payment_request_id = queryParams.get("payment_request_id");

    const verifyPayment = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/wallet/verify-payment`,
          {
            params: { payment_id, payment_request_id },
          }
        );

        // Adjust the check to match the backend response
        if (response.data.status === "success") {
          message.success(response.data.message);
          setVerificationStatus("Payment successful!");
        } else {
          message.error(response.data.message);
          setVerificationStatus("Payment failed!");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        message.error("Error verifying payment, please try again.");
        setVerificationStatus("Error verifying payment.");
      } finally {
        setLoading(false);
      }
    };

    if (payment_id && payment_request_id) {
      verifyPayment();
    } else {
      setLoading(false);
      setVerificationStatus("Invalid payment details.");
    }
  }, [location]);

  return (
    <div>
      <h2>Payment Status</h2>
      {loading ? <Spin /> : <p>{verificationStatus}</p>}
    </div>
  );
};

export default PaymentSuccess;

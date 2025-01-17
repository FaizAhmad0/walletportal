const { verifyOtp, removeOtp } = require("../utils/otpStore"); // Import the necessary functions

module.exports = async (req, res) => {
  try {
    const { enrollment, otp } = req.body;
    console.log("Received OTP:", otp);
    console.log("Enrollment:", enrollment);

    // Verify the OTP using the function from otpStore
    const isValid = verifyOtp(enrollment, otp); // Call verifyOtp function

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    removeOtp(enrollment); // Remove OTP after successful verification
    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ error: "Server error during OTP verification!" });
  }
};

const User = require("../models/User");
const authService = require("../services/login");
const nodemailer = require("nodemailer");
const { generateOtp } = require("../utils/otpStore"); // Import the OTP generation function
const { otpStore } = require("../utils/otpStore"); // Import the otpStore Map

module.exports = async (req, res) => {
  try {
    const { enrollment, password } = req.body;

    const user = await User.findOne({ enrollment });
    if (!user) {
      return res.status(404).json({ message: "User does not exist!" });
    }

    const token = await authService(enrollment, password);

    // Roles requiring OTP
    const rolesRequiringOtp = ["admin", "accountant"];
    if (rolesRequiringOtp.includes(user.role)) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP

      // Store OTP temporarily with expiration (5 minutes)
      generateOtp(enrollment, otp); // Using the function to store OTP

      console.log(
        `OTP for ${enrollment} is: ${otp}, expires at: ${new Date(
          otpStore.get(enrollment).expiresAt
        )}`
      );

      // Send OTP via email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "mdfaizahmad1020@gmail.com", // Send OTP to user's email
        subject: "Your OTP for Login",
        text: `OTP for ${enrollment} is: ${otp}, expires at: ${new Date(
          otpStore.get(enrollment).expiresAt
        )}`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        message: "OTP sent to your email!",
        requiresOtp: true,
        token,
        role: user.role,
        name: user.name,
        enrollment: user.enrollment,
        email: user.email,
        id: user._id,
      });
    }

    // If no OTP required, proceed with login
    res.status(200).json({
      token: token,
      name: user.name,
      enrollment: user.enrollment,
      email: user.email,
      message: "Logged in successfully!",
      id: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error during login!" });
  }
};

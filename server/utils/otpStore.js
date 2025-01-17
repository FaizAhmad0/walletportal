const otpStore = new Map(); // Temporary in-memory store for OTPs

// Function to generate and store OTP
function generateOtp(enrollment, otp) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
  otpStore.set(enrollment, { otp, expiresAt });
  console.log(
    `OTP for ${enrollment} generated: ${otp}, expires at: ${new Date(
      expiresAt
    ).toLocaleString()}`
  );
}

// Function to verify OTP
function verifyOtp(enrollment, otp) {
  const storedOtp = otpStore.get(enrollment);
  if (!storedOtp) {
    return false; // No OTP stored
  }
  // Check if the OTP is valid and not expired
  if (storedOtp.otp === otp && Date.now() <= storedOtp.expiresAt) {
    otpStore.delete(enrollment); // OTP is valid, remove it from the store
    return true;
  }
  return false; // Invalid or expired OTP
}

// Function to remove OTP for a user manually (if needed)
function removeOtp(enrollment) {
  otpStore.delete(enrollment);
  console.log(`OTP for ${enrollment} removed manually.`);
}

// Function to clear all OTPs (useful for testing or if needed)
function clearAllOtps() {
  otpStore.clear();
  console.log("All OTPs have been cleared.");
}

// Export the otpStore and utility functions
module.exports = {
  otpStore, // Exports the otpStore Map
  generateOtp,
  verifyOtp,
  removeOtp,
  clearAllOtps,
};

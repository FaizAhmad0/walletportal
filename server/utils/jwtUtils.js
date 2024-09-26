const jwt = require("jsonwebtoken");

function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }

  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate token");
  }
}

module.exports = generateToken;

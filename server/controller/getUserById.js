const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    console.log(user.name);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.role;
    let totalGms = 0; // Variable to store the total GMS

    if (role === "manager") {
      // Assuming 'manager' field contains the manager's _id
      const managerUsers = await User.find({
        manager: user.name,
        role: "user",
      });
      console.log(managerUsers.length);

      // Sum up the GMS of all users under this manager
      totalGms = managerUsers.reduce((sum, u) => sum + (u.gms || 0), 0);
    }

    user.gms = totalGms;
    await user.save();

    res.status(200).json({ message: "Found the user", user, totalGms });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

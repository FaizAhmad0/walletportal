const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Set limit to 100 to show 100 orders per page
    const skip = (page - 1) * limit;

    const orders = await User.find({}).skip(skip).limit(limit).lean();
    const total = await User.countDocuments();

    res.status(200).json({
      orders,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit), // Total pages calculation based on new limit
    });
  } catch (error) {
    console.error("Error finding all product:", error);
    res.status(500).json({ error: "Could not find all product" });
  }
};

// const User = require("../models/User");
// module.exports = async (req, res) => {
//   try {
//     const orders = await User.find({});
//     res.status(201).json({ orders });
//   } catch (error) {
//     console.error("Error finding all  product:", error);
//     res.status(500).json({ error: "Could not find all product" });
//   }
// };

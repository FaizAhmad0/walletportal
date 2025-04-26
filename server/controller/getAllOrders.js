const User = require("../models/User");

module.exports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const orders = await User.find({}).skip(skip).limit(limit).lean(); // lean() makes fetching lighter and faster

    const total = await User.countDocuments();

    res.status(200).json({
      orders, // array of users
      total, // total users in database
      currentPage: page, // current page number
      totalPages: Math.ceil(total / limit), // total pages
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Could not fetch orders" });
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

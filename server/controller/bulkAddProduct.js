const Product = require("../models/Product");

module.exports = async (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res
      .status(400)
      .json({ message: "No products provided for upload." });
  }

  try {
    await Product.insertMany(products);

    res.status(201).json({ message: "Bulk upload successful" });
  } catch (error) {
    console.error("Bulk upload error:", error); // Log the error for debugging
    res.status(500).json({ message: "Bulk upload failed", error });
  }
};

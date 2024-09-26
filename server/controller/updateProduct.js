const Product = require("../models/Product");

module.exports = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sku, name, price, gstRate, hsn } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { sku, name, price, gstRate, hsn },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product." });
  }
};

const productModel = require("../models/productModel.js");
require("dotenv").config();

const uploadController = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const { email } = req.body;
    if (process.env.ADMIN_URL !== email) {
      res.status(400).json({ msg: "Access denied" });
    }
    const existProduct = await productModel.findOne({ name: name });

    if (existProduct) {
      res.json({ msg: "Product already added with this name", status: false });
    }
    const product = new productModel({
      name: name,
      description: description,
      price: price,
      category: category,
      image: image,
    });

    await product.save();
    res
      .status(201)
      .json({ msg: " Product created successfully", status: true, product });
  } catch (error) {
    console.log("product error", error);
  }
};

// products controller ---

const productsController = async (req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 });
    res.status(200).json({ msg: "All products with recent sort", products });
  } catch (error) {
    console.log("products", error);
    res.send("error", error);
  }
};

module.exports = { uploadController, productsController };

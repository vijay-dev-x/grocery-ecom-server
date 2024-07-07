const productModel = require("../models/productModel.js");
const orderModel = require("../models/orders.js");
require("dotenv").config();
const Razorpay = require("razorpay");
const Crypto = require("crypto");

const instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

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
// order controller ---

const orderController = async (req, res) => {
  const { name, amount } = req.body;
  try {
    const order = await instance.orders.create({
      amount: Number(amount * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    });
    const newOrder = await orderModel.create({
      order_id: order.id,
      name: name,
      amount: amount,
    });
    res.json({ msg: "order created successfully", order, newOrder });
  } catch (error) {
    console.log("order", error);
    res.send("error", error);
  }
};
// order varification controller ---

const orderVarificationController = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const generated_signature = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = Crypto.createHmac(
      "sha256",
      process.env.key_secret
    )
      .update(generated_signature)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;
    if (isValid) {
      await orderModel.findOneAndUpdate(
        { order_id: razorpay_order_id },
        {
          $set: { razorpay_payment_id, razorpay_order_id, razorpay_signature },
        },
        { new: true }
      );
      res.redirect(
        `http://localhost:5173/success?payment_id=${razorpay_payment_id}`
      );
    } else {
      res.redirect("http://localhost:5173/failed");
    }
    const orderVarificationController = async (req, res) => {
      try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
          req.body;

        const generated_signature =
          razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = Crypto.createHmac(
          "sha256",
          process.env.key_secret
        )
          .update(generated_signature)
          .digest("hex");

        const isValid = expectedSignature === razorpay_signature;
        console.log({ isValid, generated_signature });

        if (isValid) {
          await orderModel.findOneAndUpdate(
            { order_id: razorpay_order_id },
            {
              $set: {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
              },
            },
            { new: true }
          );
          res.redirect(
            `http://localhost:5173/success?payment_id=${razorpay_payment_id}`
          );
          return;
        } else {
          res.redirect("http://localhost:5173/failed");
          return;
        }
      } catch (error) {
        console.log("payment verification", error);
        res.status(500).send("payment verification error");
      }
    };
  } catch (error) {
    console.log("payment verification", error);
    res.status(500).send("payment verification error");
  }
};

module.exports = {
  uploadController,
  productsController,
  orderController,
  orderVarificationController,
};

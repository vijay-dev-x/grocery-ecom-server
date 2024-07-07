const express = require("express");
const router = express.Router();
const productController = require("../controller/productControler.js");

router.post("/upload", productController.uploadController);
router.get("/all", productController.productsController);
router.post("/checkout", productController.orderController);
router.post(
  "/payment-varification",
  productController.orderVarificationController
);

module.exports = router;

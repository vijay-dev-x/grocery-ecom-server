const express = require("express");
const userController = require("../controller/userController.js");
const router = express.Router();

// Signup user
router.post("/signup", userController.registerController);
router.post("/login", userController.loginController);
router.post("/logout", userController.loginController);

module.exports = router;

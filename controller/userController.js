const userModel = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("../routes/userRoute.js");
require("dotenv").config();

const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existUser = await userModel.findOne({ email: email });
    if (existUser) {
      res
        .status(400)
        .json({ status: false, message: "Email already resisterd" });
    } else {
      const saltRounds = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, saltRounds);

      const payload = {
        name: name,
        email: email,
        password: hashPassword,
      };
      const user = new userModel(payload);
      await user.save();
      res
        .status(200)
        .json({ status: true, message: "User created successfully", user });
    }
  } catch (error) {
    next(error);
    // console.log("error", error);
    // res.json({ status: false, msg: "Something went wrong" });
  }
};

// login controller--

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userExist = await userModel.findOne({ email: email });

    if (!userExist) {
      return res
        .status(400)
        .json({ msg: "Email does not exist", status: false });
    }

    const comparePassword = await bcrypt.compare(password, userExist.password);
    if (!comparePassword) {
      return res
        .status(400)
        .json({ status: false, msg: "Password is incorrect" });
    }

    const tokenData = {
      id: userExist._id,
      email: userExist.email,
    };
    const token = await jwt.sign(tokenData, process.env.JWT_TOKEN, {
      expiresIn: "1d",
    });

    const option = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only set secure in production
      sameSite: "None",
      path: "/", // ensure the path is set
    };

    return res
      .cookie("token", token, option)
      .status(200)
      .json({ status: true, msg: "Logged in successfully", token, email });
  } catch (error) {
    next(error);
  }
};

// logout controller ---

const logoutController = (req, res) => {
  return res
    .cookie("token", "")
    .json({ status: true, msg: "User logged out succesfully" });
};

module.exports = { registerController, loginController, logoutController };

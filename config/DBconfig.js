const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Mongo DB connected");
  } catch (error) {
    console.log("mongoose error", error);
  }
};
module.exports = connectDB;

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/DBconfig.js");
const userRoute = require("./routes/userRoute.js");
const productRoute = require("./routes/producRoute.js");
const cookiParser = require("cookie-parser");

const app = express();
const PORT = 8000;

// console.log(process.env.TEST);

// middleware--
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ msg: "Error occured from server side" });
});
app.use(cookiParser());
// route--
app.get("/", (req, res) => {
  res.send("Hello");
});

// Listen--
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT} `);
  });
});

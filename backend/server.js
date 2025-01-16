const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"); // JSON
const mongoose = require("mongoose"); // to connect mongodb schema
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = 5000;
//const DB_URI = "mongodb://localhost:27017/project4"; //mongodb compass
const DB_URI =
  "mongodb+srv://deepuchary03:llEerw1yqjLN6lWS@sg3.xpb79.mongodb.net/project4?retryWrites=true&w=majority&appName=Sg3";

app.use(cors());
app.use(bodyParser.json()); //JSON

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

app.use("/", authRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

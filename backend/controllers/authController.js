const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = "your_jwt_secret";

const signup = async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    console.log(req.body); // Add this line to log the request body

    if (!email || !password || !phone) {
      return res
        .status(400)
        .json({ message: "Email, password, and phone number are required" });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, phone });
    await user.save();

    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup, signin };

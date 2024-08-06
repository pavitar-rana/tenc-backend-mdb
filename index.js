const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/usersignuplogin")
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log("Connection error", err));

// Create a schema for the user

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  email: { type: String },
  // Set the type to an array Products
  purchasedProducts: [
    {
      pid: { type: String },
      product: { type: String },
      rate: { type: String },
      details: { type: String },
      review: { type: String },
    },
  ],
});

// Create a schema for the product

const productSchema = new mongoose.Schema({
  pId: { type: String },
  pName: { type: String },
  rate: { type: String },
  description: { type: String },
  review: { type: String },
});

// Create user and product models

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);

// Routes

// Route to create new user

app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  // Checking if we got the username, password and email
  if (!username || !password || !email) {
    return res.send({ message: "Please provide all the required fields" });
  }

  // Checking if the user already exists

  // Here $or means either username or email should be equal to the username or email that we are getting from the request
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return res.send({ message: "User already exists" });
  }

  // If the user does not exist, create a new user

  try {
    const user = new User({ username, password, email });
    await user.save();
    console.log("User created:", user);
    res.send({
      message: "User created successfully",
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    res.send({ message: "Error creating user" });
  }
});

// Route to login user

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Checking if we got the username and password

  if (!username || !password) {
    return res.send({ message: "Please provide username and password" });
  }

  // Checking if the user existss

  try {
    const user = await User.findOne({ username });

    // If the user does not exist OR the password doesn;t match return an error message
    if (!user || user.password !== password) {
      return res.send({ message: "Login failed" });
    }

    console.log("User logged in:", user);
    res.send({
      message: "User logged in successfully",
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    res.send({ message: "Error logging in" });
  }
});

// Route to create a new product

app.post("/products", async (req, res) => {
  const { pId, pName, rate, description, review } = req.body;

  // Checking if we got the required fields

  if (!pId || !pName || !rate || !description || !review) {
    return res.send({ message: "Please provide all the required fields" });
  }

  try {
    const newProduct = new Product({
      pId,
      pName,
      rate,
      description,
      review,
    });
    await newProduct.save();
    res.json({ product: newProduct });
  } catch (err) {
    res.send({ message: "Error adding product" });
  }
});

// Route to purchase a product

app.post("/purchaseProduct", async (req, res) => {
  const { username, password, pId } = req.body;

  // Checking if we got the required fields
  if (!username || !password || !pId) {
    return res.send({ message: "Provide all fields" });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.send({ message: "Login failed" });
    }

    // Check if the product exists
    const product = await Product.findOne({ pId });
    if (!product) {
      return res.send({ message: "Product not found" });
    }

    // Add the product to the user's purchasedProducts array
    user.purchasedProducts.push(product);
    await user.save();
    res.json({ user });
  } catch (err) {
    res.send({ message: "Error adding purchased product" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

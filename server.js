const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9090;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI; // Use environment variable for security
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define Mongoose Schema
const UserSchema = new mongoose.Schema({
  name: String,
  color: String
});

const User = mongoose.model("User", UserSchema);

// API to get saved data
app.get("/get-data", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

// API to save user data
app.post("/save-data", async (req, res) => {
  try {
    const { name, color } = req.body;
    const newUser = new User({ name, color });
    await newUser.save();
    res.json({ message: "Data saved successfully!", entry: newUser });
  } catch (error) {
    res.status(500).json({ error: "Error saving data" });
  }
});

// API to reset data
app.post("/reset-data", async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: "Data reset successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error resetting data" });
  }
});

// API to delete an entry
app.delete("/delete-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "ID not found" });
    }

    res.json({ message: "Entry deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting entry" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

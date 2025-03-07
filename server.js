const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const os = require("os");

const app = express();
const PORT = 9090;
const DATA_FILE = "./data.json";

app.use(cors());
app.use(bodyParser.json());

// Load existing data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return []; // If file doesn't exist, return empty array
    const rawData = fs.readFileSync(DATA_FILE);
    return JSON.parse(rawData);
};

// Save new data
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API to get saved data
app.get("/get-data", (req, res) => {
  res.json(readData());
});

// API to save user data
app.post("/save-data", (req, res) => {
    let data = readData();
    
    // Generate unique ID
    const newId = data.length > 0 ? Math.max(...data.map(entry => entry.id)) + 1 : 1;
    
    const newEntry = { id: newId, name: req.body.name, color: req.body.color };
    data.push(newEntry);
    writeData(data);

    res.json({ message: "Data saved successfully!", entry: newEntry });
});

// API to reset data
app.post("/reset-data", (req, res) => {
  writeData([]);
  res.json({ message: "Data reset successfully!" });
});

app.delete("/delete-data/:id", (req, res) => {
    const id = parseInt(req.params.id); // Ensure ID is a number
    let data = readData();
    
    // Filter out the entry
    const updatedData = data.filter(entry => entry.id !== id);
    
    if (data.length === updatedData.length) {
        return res.status(404).json({ message: "ID not found" });
    }

    writeData(updatedData);
    res.json({ message: "Entry deleted successfully!" });
});

const getHostname = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
          if (net.family === "IPv4" && !net.internal) {
              return net.address;
          }
      }
  }
  return "localhost"; // Fallback to localhost
};

// Print the running server URL dynamically
app.listen(PORT, () => {
  const hostname = getHostname();
  console.log(`Server running on http://${hostname}:${PORT}`);
});
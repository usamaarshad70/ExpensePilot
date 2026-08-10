const dns = require("dns");

// Prefer IPv4 connections
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// ==========================================
// CONNECT MONGODB
// ==========================================

connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ExpensePilot API is running",
  });
});

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use("/api/auth", authRoutes);

// Transactions
app.use("/api/transactions", transactionRoutes);

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

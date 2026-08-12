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

// Budget routes
const budgetRoutes = require("./routes/budgetRoutes");

// Savings goal routes
const savingsGoalRoutes = require("./routes/savingsGoalRoutes");

// Savings history routes
const savingsHistoryRoutes = require("./routes/savingsHistoryRoutes");

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

// Budgets
app.use("/api/budgets", budgetRoutes);

// Savings Goals
app.use("/api/savings-goals", savingsGoalRoutes);

// Savings History
app.use("/api/savings-history", savingsHistoryRoutes);

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

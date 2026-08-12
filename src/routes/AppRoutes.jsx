import { Routes, Route } from "react-router-dom";

// ==========================================
// MAIN APPLICATION PAGES
// ==========================================

import Dashboard from "../pages/Dashboard";
import Expenses from "../pages/Expenses";
import Transactions from "../pages/Transactions";
import Reports from "../pages/Reports";
import Budgets from "../pages/Budgets";
import SavingsGoals from "../pages/SavingsGoals";
import Settings from "../pages/Settings";

// ==========================================
// AUTHENTICATION PAGES
// ==========================================

import Auth from "../pages/Auth";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// ==========================================
// PROTECTED ROUTE
// ==========================================

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* ==========================================
          AUTHENTICATION
      ========================================== */}

      <Route path="/auth" element={<Auth />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ==========================================
          DASHBOARD
      ========================================== */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          ADD TRANSACTION
      ========================================== */}

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          ALL TRANSACTIONS
      ========================================== */}

      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          REPORTS
      ========================================== */}

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          BUDGET MANAGEMENT
      ========================================== */}

      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <Budgets />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          SAVINGS GOAL MANAGEMENT
      ========================================== */}

      <Route
        path="/savings-goals"
        element={
          <ProtectedRoute>
            <SavingsGoals />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          SETTINGS
      ========================================== */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          FALLBACK
      ========================================== */}

      <Route path="*" element={<Auth />} />
    </Routes>
  );
}

export default AppRoutes;

import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Expenses from "../pages/Expenses";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

import Auth from "../pages/Auth";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

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
          PROTECTED APPLICATION
      ========================================== */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

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

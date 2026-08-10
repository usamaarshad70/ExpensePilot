import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Expenses from "../pages/Expenses";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Auth from "../pages/Auth";

import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* ==========================================
          AUTHENTICATION
      ========================================== */}

      {/* Login / Register */}
      <Route path="/auth" element={<Auth />} />

      {/* Email verification */}
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Forgot password */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Reset password */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ==========================================
          PROTECTED APPLICATION
      ========================================== */}

      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Expenses */}
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
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

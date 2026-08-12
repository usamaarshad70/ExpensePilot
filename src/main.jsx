import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./index.css";

// ==========================================
// CONTEXT PROVIDERS
// ==========================================

import { ExpenseProvider } from "./context/ExpenseContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// ==========================================
// TOAST
// ==========================================

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ExpenseProvider>
            <App />

            {/* ==========================================
                GLOBAL TOASTER
            ========================================== */}

            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={10}
              toastOptions={{
                duration: 3000,

                style: {
                  background: "#1e293b",
                  color: "#ffffff",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "14px",
                },

                success: {
                  iconTheme: {
                    primary: "#22c55e",
                    secondary: "#ffffff",
                  },
                },

                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#ffffff",
                  },
                },
              }}
            />
          </ExpenseProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

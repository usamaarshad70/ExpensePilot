import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const BudgetContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({
    totalSpent: 0,
    overall: null,
    categories: [],
  });

  const [loading, setLoading] = useState(false);

  const getToken = () => {
    return localStorage.getItem("expensepilot_token");
  };

  // ==========================================
  // GET CONFIG
  // ==========================================

  const getConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==========================================
  // FETCH BUDGETS
  // ==========================================

  const fetchBudgets = async (month) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/budgets?month=${month}`,
        getConfig(),
      );

      if (response.data.success) {
        setBudgets(response.data.budgets || []);
      }
    } catch (error) {
      console.error("Fetch budgets error:", error);

      toast.error(error.response?.data?.message || "Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH SUMMARY
  // ==========================================

  const fetchSummary = async (month) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/budgets/summary?month=${month}`,
        getConfig(),
      );

      if (response.data.success) {
        setSummary({
          totalSpent: response.data.totalSpent || 0,
          overall: response.data.overall || null,
          categories: response.data.categories || [],
        });
      }
    } catch (error) {
      console.error("Fetch budget summary error:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch budget summary",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE BUDGET
  // ==========================================

  const addBudget = async (budgetData) => {
    try {
      const response = await axios.post(
        `${API_URL}/budgets`,
        budgetData,
        getConfig(),
      );

      if (response.data.success) {
        setBudgets((prev) => [...prev, response.data.budget]);

        toast.success("Budget created successfully");

        return true;
      }

      return false;
    } catch (error) {
      console.error("Add budget error:", error);

      toast.error(error.response?.data?.message || "Failed to create budget");

      return false;
    }
  };

  // ==========================================
  // UPDATE BUDGET
  // ==========================================

  const updateBudget = async (id, amount) => {
    try {
      const response = await axios.put(
        `${API_URL}/budgets/${id}`,
        {
          amount: Number(amount),
        },
        getConfig(),
      );

      if (response.data.success) {
        setBudgets((prev) =>
          prev.map((budget) =>
            budget._id === id ? response.data.budget : budget,
          ),
        );

        toast.success("Budget updated successfully");

        return true;
      }

      return false;
    } catch (error) {
      console.error("Update budget error:", error);

      toast.error(error.response?.data?.message || "Failed to update budget");

      return false;
    }
  };

  // ==========================================
  // DELETE BUDGET
  // ==========================================

  const deleteBudget = async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/budgets/${id}`,
        getConfig(),
      );

      if (response.data.success) {
        setBudgets((prev) => prev.filter((budget) => budget._id !== id));

        toast.success("Budget deleted successfully");

        return true;
      }

      return false;
    } catch (error) {
      console.error("Delete budget error:", error);

      toast.error(error.response?.data?.message || "Failed to delete budget");

      return false;
    }
  };

  // ==========================================
  // CLEAR DATA ON LOGOUT
  // ==========================================

  const clearBudgets = () => {
    setBudgets([]);

    setSummary({
      totalSpent: 0,
      overall: null,
      categories: [],
    });
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        summary,
        loading,
        fetchBudgets,
        fetchSummary,
        addBudget,
        updateBudget,
        deleteBudget,
        clearBudgets,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);

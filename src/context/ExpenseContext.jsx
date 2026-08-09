import { createContext, useContext, useEffect, useState } from "react";

import toast from "react-hot-toast";

const ExpenseContext = createContext();

const API_URL = "http://localhost:5000/api";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Salary",
  "Health",
  "Education",
  "Entertainment",
  "Investment",
  "Gift",
  "Siblings",
];

// Convert MongoDB transaction into the format
// your existing React components expect.
const normalizeTransaction = (transaction) => ({
  id: transaction._id,
  title: transaction.title,
  amount: transaction.amount,
  type: transaction.type,
  category: transaction.category,
  date: transaction.date,
});

export const ExpenseProvider = ({ children }) => {
  // ==========================================
  // STATE
  // ==========================================

  const [transactions, setTransactions] = useState([]);

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");

    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET JWT TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("expensepilot_token");
  };

  // ==========================================
  // FETCH TRANSACTIONS
  // ==========================================

  const fetchTransactions = async () => {
    try {
      const token = getToken();

      if (!token) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/transactions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch transactions");
      }

      setTransactions(data.transactions.map(normalizeTransaction));
    } catch (error) {
      console.error("Fetch transactions error:", error);

      toast.error(error.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD TRANSACTIONS ON LOGIN
  // ==========================================

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ==========================================
  // SAVE CATEGORIES
  // ==========================================

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // ==========================================
  // ADD TRANSACTION
  // ==========================================

  const addTransaction = async (transaction) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Please login first");
        return false;
      }

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: transaction.title,
          amount: Number(transaction.amount),
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add transaction");
      }

      const newTransaction = normalizeTransaction(data.transaction);

      setTransactions((prev) => [newTransaction, ...prev]);

      toast.success("Transaction Added");

      return true;
    } catch (error) {
      console.error("Add transaction error:", error);

      toast.error(error.message || "Failed to add transaction");

      return false;
    }
  };

  // ==========================================
  // UPDATE TRANSACTION
  // ==========================================

  const updateTransaction = async (updatedTransaction) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Please login first");
        return false;
      }

      const response = await fetch(
        `${API_URL}/transactions/${updatedTransaction.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: updatedTransaction.title,
            amount: Number(updatedTransaction.amount),
            type: updatedTransaction.type,
            category: updatedTransaction.category,
            date: updatedTransaction.date,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update transaction");
      }

      const updated = normalizeTransaction(data.transaction);

      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === updated.id ? updated : transaction,
        ),
      );

      toast.success("Transaction Updated");

      return true;
    } catch (error) {
      console.error("Update transaction error:", error);

      toast.error(error.message || "Failed to update transaction");

      return false;
    }
  };

  // ==========================================
  // DELETE TRANSACTION
  // ==========================================

  const deleteTransaction = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return false;

    try {
      const token = getToken();

      if (!token) {
        toast.error("Please login first");
        return false;
      }

      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete transaction");
      }

      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== id),
      );

      toast.success("Transaction Deleted");

      return true;
    } catch (error) {
      console.error("Delete transaction error:", error);

      toast.error(error.message || "Failed to delete transaction");

      return false;
    }
  };

  // ==========================================
  // ADD CATEGORY
  // ==========================================

  const addCategory = (category) => {
    const trimmed = category.trim();

    if (!trimmed) {
      toast.error("Category cannot be empty");
      return;
    }

    const exists = categories.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );

    if (exists) {
      toast.error("Category already exists");
      return;
    }

    setCategories((prev) => [...prev, trimmed]);

    toast.success("Category Added");
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const deleteCategory = (category) => {
    const confirmed = window.confirm(`Delete "${category}" category?`);

    if (!confirmed) return;

    setCategories((prev) => prev.filter((item) => item !== category));

    toast.success("Category Deleted");
  };

  // ==========================================
  // RESET ALL DATA
  // ==========================================

  const resetAllData = async () => {
    const confirmed = window.confirm(
      "This will delete ALL transactions and reset categories. Continue?",
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      if (!token) {
        toast.error("Please login first");
        return;
      }

      // Delete all transactions belonging
      // to the logged-in user.
      const currentTransactions = [...transactions];

      for (const transaction of currentTransactions) {
        await fetch(`${API_URL}/transactions/${transaction.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setTransactions([]);

      setCategories(DEFAULT_CATEGORIES);

      localStorage.removeItem("categories");

      toast.success("All data has been reset");
    } catch (error) {
      console.error("Reset data error:", error);

      toast.error("Failed to reset all data");
    }
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        categories,
        loading,

        addTransaction,
        updateTransaction,
        deleteTransaction,

        addCategory,
        deleteCategory,

        resetAllData,

        fetchTransactions,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => useContext(ExpenseContext);

import { createContext, useContext, useEffect, useState } from "react";

import toast from "react-hot-toast";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  // Transactions

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");

    return saved ? JSON.parse(saved) : [];
  });

  // Categories

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");

    return saved
      ? JSON.parse(saved)
      : [
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
  });

  // Save Transactions

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Save Categories

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // Add Transaction

  const addTransaction = (transaction) => {
    setTransactions((prev) => [...prev, transaction]);

    toast.success("Transaction Added");
  };

  // Update Transaction

  const updateTransaction = (updatedTransaction) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction,
      ),
    );

    toast.success("Transaction Updated");
  };

  // Delete Transaction

  const deleteTransaction = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return;

    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );

    toast.success("Transaction Deleted");
  };

  // Add Category

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

  // Delete Category

  const deleteCategory = (category) => {
    const confirmed = window.confirm(`Delete "${category}" category?`);

    if (!confirmed) return;

    setCategories((prev) => prev.filter((item) => item !== category));

    toast.success("Category Deleted");
  };

  // Reset All Data

  const resetAllData = () => {
    const confirmed = window.confirm(
      "This will delete ALL transactions and categories. Continue?",
    );

    if (!confirmed) return;

    localStorage.removeItem("transactions");

    localStorage.removeItem("categories");

    setTransactions([]);

    setCategories([
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
    ]);

    toast.success("All data has been reset");
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        categories,

        addTransaction,
        updateTransaction,
        deleteTransaction,

        addCategory,
        deleteCategory,

        resetAllData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => useContext(ExpenseContext);

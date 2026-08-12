import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  FiAlertTriangle,
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiInfo,
  FiPieChart,
  FiPlus,
  FiTrash2,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

import Layout from "../components/Layout";
import { useExpense } from "../context/ExpenseContext";

function Budgets() {
  const { transactions = [], categories = [] } = useExpense();

  // ==========================================
  // STATE
  // ==========================================

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  const [budgetType, setBudgetType] = useState("category");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const [editingBudget, setEditingBudget] = useState(null);

  // ==========================================
  // API
  // ==========================================

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // ==========================================
  // TOKEN
  // ==========================================

  const getToken = () => {
    return (
      localStorage.getItem("expensepilot_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken")
    );
  };

  // ==========================================
  // MONTH HELPERS
  // ==========================================

  const getTransactionMonth = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  };

  const getMonthName = (monthValue) => {
    if (!monthValue) return "";

    const date = new Date(`${monthValue}-01T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (value) => {
    return `PKR ${Number(value || 0).toLocaleString("en-PK", {
      maximumFractionDigits: 0,
    })}`;
  };

  // ==========================================
  // FETCH BUDGETS
  // ==========================================

  const fetchBudgets = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        toast.error("Please login again");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/budgets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBudgets(response.data?.budgets || []);
    } catch (error) {
      console.error("Fetch budgets error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to load budgets");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchBudgets();
  }, []);

  // ==========================================
  // MONTHLY EXPENSES
  // ==========================================

  const monthlyExpenses = useMemo(() => {
    return transactions.filter((transaction) => {
      return (
        transaction.type === "expense" &&
        getTransactionMonth(transaction.date) === selectedMonth
      );
    });
  }, [transactions, selectedMonth]);

  // ==========================================
  // TOTAL MONTHLY EXPENSE
  // ==========================================

  const monthlyExpenseTotal = useMemo(() => {
    return monthlyExpenses.reduce(
      (sum, transaction) => sum + Number(transaction.amount || 0),
      0,
    );
  }, [monthlyExpenses]);

  // ==========================================
  // GET SPENT FOR CATEGORY
  // ==========================================

  const getSpentForCategory = (budgetCategory) => {
    if (!budgetCategory) return 0;

    return monthlyExpenses
      .filter(
        (transaction) =>
          transaction.category?.trim().toLowerCase() ===
          budgetCategory.trim().toLowerCase(),
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  };

  // ==========================================
  // MONTHLY BUDGETS
  // ==========================================

  const monthlyBudgets = useMemo(() => {
    return budgets.filter((budget) => budget.month === selectedMonth);
  }, [budgets, selectedMonth]);

  // ==========================================
  // OVERALL BUDGET
  // ==========================================

  const overallBudget = useMemo(() => {
    return monthlyBudgets.find((budget) => budget.type === "overall") || null;
  }, [monthlyBudgets]);

  // ==========================================
  // CATEGORY BUDGETS
  // ==========================================

  const categoryBudgets = useMemo(() => {
    return monthlyBudgets.filter((budget) => budget.type === "category");
  }, [monthlyBudgets]);

  // ==========================================
  // TOTAL CATEGORY BUDGET
  // ==========================================

  const totalCategoryBudget = useMemo(() => {
    return categoryBudgets.reduce(
      (sum, budget) => sum + Number(budget.amount || 0),
      0,
    );
  }, [categoryBudgets]);

  // ==========================================
  // OVERALL BUDGET AMOUNT
  // ==========================================

  const overallBudgetAmount = Number(overallBudget?.amount || 0);

  // ==========================================
  // DASHBOARD BUDGET
  // ==========================================

  const dashboardBudget = overallBudget
    ? overallBudgetAmount
    : totalCategoryBudget;

  // ==========================================
  // REMAINING
  // ==========================================

  const remainingBudget = dashboardBudget - monthlyExpenseTotal;

  // ==========================================
  // SPENDING %
  // ==========================================

  const spendingPercentage =
    dashboardBudget > 0 ? (monthlyExpenseTotal / dashboardBudget) * 100 : 0;

  const progressPercentage = Math.min(spendingPercentage, 100);

  // ==========================================
  // DASHBOARD STATUS
  // ==========================================

  const dashboardStatus = useMemo(() => {
    if (dashboardBudget <= 0) {
      return {
        label: "No Budget Set",
        icon: FiInfo,
        className:
          "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
      };
    }

    if (spendingPercentage >= 100) {
      return {
        label: "Over Budget",
        icon: FiAlertTriangle,
        className:
          "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      };
    }

    if (spendingPercentage >= 80) {
      return {
        label: "Almost Full",
        icon: FiAlertTriangle,
        className:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      };
    }

    return {
      label: "On Track",
      icon: FiCheckCircle,
      className:
        "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    };
  }, [dashboardBudget, spendingPercentage]);

  // ==========================================
  // CATEGORY ANALYTICS
  // ==========================================

  const categoryAnalytics = useMemo(() => {
    return categoryBudgets
      .map((budget) => {
        const budgetAmount = Number(budget.amount || 0);

        const spent = getSpentForCategory(budget.category);

        const remaining = budgetAmount - spent;

        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        return {
          ...budget,
          budgetAmount,
          spent,
          remaining,
          percentage,
          progress: Math.min(percentage, 100),
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [categoryBudgets, monthlyExpenses]);

  // ==========================================
  // CATEGORY SPENDING
  // ==========================================

  const categorySpending = useMemo(() => {
    const map = {};

    monthlyExpenses.forEach((transaction) => {
      const name = transaction.category || "Other";

      const key = name.trim();

      map[key] = (map[key] || 0) + Number(transaction.amount || 0);
    });

    return Object.entries(map)
      .map(([name, spent]) => ({
        name,
        spent,
      }))
      .sort((a, b) => b.spent - a.spent);
  }, [monthlyExpenses]);

  // ==========================================
  // NEW FEATURE:
  // BUDGET ALERTS
  // ==========================================

  const budgetAlerts = useMemo(() => {
    const alerts = [];

    // ------------------------------------------
    // OVERALL BUDGET ALERT
    // ------------------------------------------

    if (dashboardBudget > 0) {
      if (spendingPercentage >= 100) {
        alerts.push({
          id: `overall-over-${selectedMonth}`,
          level: "danger",
          title: "Overall budget exceeded",
          message: `You have exceeded your ${getMonthName(
            selectedMonth,
          )} budget by ${formatCurrency(Math.abs(remainingBudget))}.`,
          icon: FiAlertTriangle,
        });
      } else if (spendingPercentage >= 80) {
        alerts.push({
          id: `overall-warning-${selectedMonth}`,
          level: "warning",
          title: "Overall budget almost full",
          message: `You have used ${spendingPercentage.toFixed(
            0,
          )}% of your monthly budget.`,
          icon: FiAlertTriangle,
        });
      }
    }

    // ------------------------------------------
    // CATEGORY BUDGET ALERTS
    // ------------------------------------------

    categoryAnalytics.forEach((budget) => {
      if (budget.percentage >= 100) {
        alerts.push({
          id: `category-over-${selectedMonth}-${budget.category}`,
          level: "danger",
          title: `${budget.category} budget exceeded`,
          message: `You have exceeded your ${budget.category} budget by ${formatCurrency(
            Math.abs(budget.remaining),
          )}.`,
          icon: FiAlertTriangle,
        });
      } else if (budget.percentage >= 80) {
        alerts.push({
          id: `category-warning-${selectedMonth}-${budget.category}`,
          level: "warning",
          title: `${budget.category} budget almost full`,
          message: `You have used ${budget.percentage.toFixed(
            0,
          )}% of your ${budget.category} budget.`,
          icon: FiAlertTriangle,
        });
      }
    });

    // ------------------------------------------
    // SPENDING WITHOUT BUDGET
    // ------------------------------------------

    categorySpending.forEach((item) => {
      const matchingBudget = categoryBudgets.find(
        (budget) =>
          budget.category?.trim().toLowerCase() ===
          item.name.trim().toLowerCase(),
      );

      if (!matchingBudget) {
        alerts.push({
          id: `no-budget-${selectedMonth}-${item.name}`,
          level: "info",
          title: `No budget for ${item.name}`,
          message: `You have spent ${formatCurrency(
            item.spent,
          )} in ${item.name}, but no budget is set for this category.`,
          icon: FiInfo,
        });
      }
    });

    return alerts;
  }, [
    dashboardBudget,
    spendingPercentage,
    remainingBudget,
    categoryAnalytics,
    categorySpending,
    categoryBudgets,
    selectedMonth,
  ]);

  // ==========================================
  // ALERT COUNTS
  // ==========================================

  const dangerAlerts = useMemo(
    () => budgetAlerts.filter((alert) => alert.level === "danger").length,
    [budgetAlerts],
  );

  const warningAlerts = useMemo(
    () => budgetAlerts.filter((alert) => alert.level === "warning").length,
    [budgetAlerts],
  );

  const infoAlerts = useMemo(
    () => budgetAlerts.filter((alert) => alert.level === "info").length,
    [budgetAlerts],
  );

  // ==========================================
  // ALERT TOAST
  // ==========================================

  useEffect(() => {
    if (loading || budgetAlerts.length === 0) {
      return;
    }

    const alertSignature = budgetAlerts
      .map((alert) => alert.id)
      .sort()
      .join("|");

    const storageKey = `expensepilot_budget_alert_${selectedMonth}`;

    const previousSignature = sessionStorage.getItem(storageKey);

    if (previousSignature === alertSignature) {
      return;
    }

    const criticalAlert = budgetAlerts.find(
      (alert) => alert.level === "danger",
    );

    const warningAlert = budgetAlerts.find(
      (alert) => alert.level === "warning",
    );

    if (criticalAlert) {
      toast.error(criticalAlert.title);
    } else if (warningAlert) {
      toast(warningAlert.title, {
        icon: "⚠️",
      });
    }

    sessionStorage.setItem(storageKey, alertSignature);
  }, [budgetAlerts, loading, selectedMonth]);

  // ==========================================
  // ALERT STYLES
  // ==========================================

  const getAlertStyles = (level) => {
    if (level === "danger") {
      return {
        wrapper:
          "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
        icon: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
        title: "text-red-800 dark:text-red-300",
        text: "text-red-700 dark:text-red-400",
      };
    }

    if (level === "warning") {
      return {
        wrapper:
          "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20",
        icon: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
        title: "text-yellow-800 dark:text-yellow-300",
        text: "text-yellow-700 dark:text-yellow-400",
      };
    }

    return {
      wrapper:
        "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
      icon: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
      title: "text-blue-800 dark:text-blue-300",
      text: "text-blue-700 dark:text-blue-400",
    };
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedMonth) {
      toast.error("Please select a month");
      return;
    }

    if (!budgetType) {
      toast.error("Please select budget type");
      return;
    }

    if (budgetType === "category" && !category) {
      toast.error("Please select a category");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setSaving(true);

      const budgetData = {
        month: selectedMonth,
        type: budgetType,
        category: budgetType === "category" ? category : null,
        amount: Number(amount),
      };

      let response;

      if (editingBudget) {
        response = await axios.put(
          `${API_URL}/budgets/${editingBudget._id || editingBudget.id}`,
          {
            amount: Number(amount),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success("Budget updated successfully");
      } else {
        response = await axios.post(`${API_URL}/budgets`, budgetData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Budget created successfully");
      }

      const updatedBudget = response.data?.budget;

      if (updatedBudget) {
        setBudgets((previous) => {
          if (editingBudget) {
            return previous.map((budget) =>
              (budget._id || budget.id) ===
              (updatedBudget._id || updatedBudget.id)
                ? updatedBudget
                : budget,
            );
          }

          return [...previous, updatedBudget];
        });
      } else {
        await fetchBudgets();
      }

      resetForm();
    } catch (error) {
      console.error("Save budget error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to save budget");
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (budget) => {
    const budgetId = budget._id || budget.id;

    if (!budgetId) {
      toast.error("Invalid budget");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${
        budget.type === "overall" ? "overall" : budget.category
      } budget for ${getMonthName(budget.month)}?`,
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      await axios.delete(`${API_URL}/budgets/${budgetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBudgets((previous) =>
        previous.filter((item) => (item._id || item.id) !== budgetId),
      );

      toast.success("Budget deleted successfully");

      if (
        editingBudget &&
        (editingBudget._id || editingBudget.id) === budgetId
      ) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete budget error:", error);

      toast.error(error.response?.data?.message || "Failed to delete budget");
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (budget) => {
    setEditingBudget(budget);

    setBudgetType(budget.type || "category");

    setCategory(budget.category || "");

    setAmount(budget.amount ?? "");

    setSelectedMonth(budget.month || selectedMonth);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setBudgetType("category");
    setCategory("");
    setAmount("");
    setEditingBudget(null);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

            <p className="text-slate-500 dark:text-slate-400">
              Loading budget dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Budget Management
            </h1>

            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Set monthly spending limits and track your financial progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <FiCalendar className="text-blue-600 text-lg" />

            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="
                border border-slate-300
                dark:border-slate-600
                bg-white dark:bg-slate-800
                text-slate-900 dark:text-white
                rounded-lg
                px-4 py-2.5
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>
        </div>

        {/* MONTH */}

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600" />

          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {getMonthName(selectedMonth)}
          </p>
        </div>

        {/* ==========================================
            SUMMARY CARDS
        ========================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* BUDGET */}

          <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">
                  {overallBudget ? "Overall Budget" : "Total Category Budget"}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {formatCurrency(dashboardBudget)}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <FiPieChart size={21} />
              </div>
            </div>

            {!overallBudget && (
              <p className="text-xs mt-3 opacity-80">No overall budget set</p>
            )}
          </div>

          {/* EXPENSE */}

          <div className="bg-red-500 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Monthly Expense</p>

                <h2 className="text-3xl font-bold mt-2">
                  {formatCurrency(monthlyExpenseTotal)}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <FiTrendingUp size={21} />
              </div>
            </div>

            <p className="text-xs mt-3 opacity-80">
              {monthlyExpenses.length} expense
              {monthlyExpenses.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* REMAINING */}

          <div
            className={`
              text-white
              rounded-2xl
              p-6
              shadow-lg
              ${remainingBudget >= 0 ? "bg-emerald-600" : "bg-red-600"}
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">
                  {remainingBudget >= 0 ? "Remaining Budget" : "Over Budget"}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {formatCurrency(Math.abs(remainingBudget))}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                {remainingBudget >= 0 ? (
                  <FiCheckCircle size={21} />
                ) : (
                  <FiAlertTriangle size={21} />
                )}
              </div>
            </div>

            <p className="text-xs mt-3 opacity-80">
              {remainingBudget >= 0
                ? "Available to spend"
                : "Amount above your budget"}
            </p>
          </div>

          {/* USAGE */}

          <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Budget Usage</p>

                <h2 className="text-3xl font-bold mt-2">
                  {spendingPercentage.toFixed(0)}%
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <FiBarChart2 size={21} />
              </div>
            </div>

            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  spendingPercentage >= 100
                    ? "bg-red-300"
                    : spendingPercentage >= 80
                      ? "bg-yellow-300"
                      : "bg-white"
                }`}
                style={{
                  width: `${Math.min(spendingPercentage, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            NEW FEATURE:
            BUDGET ALERTS
        ========================================== */}

        <section
          className="
            bg-white
            dark:bg-slate-800
            border border-slate-200
            dark:border-slate-700
            rounded-2xl
            shadow-lg
            p-6
          "
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="relative w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <FiBell size={21} />

                {budgetAlerts.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {budgetAlerts.length}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Budget Alerts
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Important updates about your spending for{" "}
                  {getMonthName(selectedMonth)}.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {dangerAlerts > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs font-semibold">
                  <FiAlertTriangle size={13} />
                  {dangerAlerts} Critical
                </span>
              )}

              {warningAlerts > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 text-xs font-semibold">
                  <FiAlertTriangle size={13} />
                  {warningAlerts} Warning
                </span>
              )}

              {infoAlerts > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-semibold">
                  <FiInfo size={13} />
                  {infoAlerts} Info
                </span>
              )}

              {budgetAlerts.length === 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-xs font-semibold">
                  <FiCheckCircle size={13} />
                  All Clear
                </span>
              )}
            </div>
          </div>

          {budgetAlerts.length === 0 ? (
            <div className="rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                <FiCheckCircle size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  Your budget is looking good
                </h3>

                <p className="text-sm mt-1 text-green-700 dark:text-green-400">
                  No budget warnings or spending issues have been detected for
                  this month.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {budgetAlerts.map((alert) => {
                const styles = getAlertStyles(alert.level);

                const AlertIcon = alert.icon;

                return (
                  <div
                    key={alert.id}
                    className={`
                      ${styles.wrapper}
                      border
                      rounded-xl
                      p-4
                      flex
                      items-start
                      gap-4
                    `}
                  >
                    <div
                      className={`
                        ${styles.icon}
                        w-10
                        h-10
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        shrink-0
                      `}
                    >
                      <AlertIcon size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3
                        className={`
                          font-semibold
                          ${styles.title}
                        `}
                      >
                        {alert.title}
                      </h3>

                      <p
                        className={`
                          text-sm
                          mt-1
                          ${styles.text}
                        `}
                      >
                        {alert.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==========================================
            MONTHLY BUDGET OVERVIEW
        ========================================== */}

        <section
          className="
            bg-white
            dark:bg-slate-800
            border border-slate-200
            dark:border-slate-700
            rounded-2xl
            shadow-lg
            p-6
          "
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Monthly Budget Overview
                </h2>

                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                    ${dashboardStatus.className}
                  `}
                >
                  <dashboardStatus.icon size={13} />

                  {dashboardStatus.label}
                </span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {overallBudget
                  ? "Your overall monthly budget compared with actual spending."
                  : "Your category budgets are being used as the dashboard limit."}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spending
              </p>

              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(monthlyExpenseTotal)}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                of {formatCurrency(dashboardBudget)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Spending Progress
              </span>

              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {spendingPercentage.toFixed(1)}%
              </span>
            </div>

            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`
                  h-full
                  rounded-full
                  transition-all
                  duration-500
                  ${
                    spendingPercentage >= 100
                      ? "bg-red-500"
                      : spendingPercentage >= 80
                        ? "bg-yellow-500"
                        : "bg-emerald-500"
                  }
                `}
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            <div className="flex justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span>0%</span>
              <span>80%</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        {/* ==========================================
            CREATE / EDIT BUDGET
        ========================================== */}

        <section
          className="
            bg-white
            dark:bg-slate-800
            border border-slate-200
            dark:border-slate-700
            rounded-2xl
            shadow-lg
            p-6
          "
        >
          <div className="flex items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              {editingBudget ? <FiEdit2 size={20} /> : <FiPlus size={21} />}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {editingBudget
                  ? "Update your budget amount."
                  : "Set a spending limit for the selected month."}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
              gap-4
              items-end
            "
          >
            {/* TYPE */}

            <div>
              <label
                htmlFor="budget-type"
                className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Budget Type
              </label>

              <select
                id="budget-type"
                value={budgetType}
                disabled={Boolean(editingBudget)}
                onChange={(event) => {
                  setBudgetType(event.target.value);

                  if (event.target.value === "overall") {
                    setCategory("");
                  }
                }}
                className="
                  w-full
                  border border-slate-300
                  dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-slate-900 dark:text-white
                  px-4 py-3
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  disabled:opacity-60
                "
              >
                <option value="category">Category Budget</option>

                <option value="overall">Overall Monthly Budget</option>
              </select>
            </div>

            {/* CATEGORY */}

            <div>
              <label
                htmlFor="budget-category"
                className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Category
              </label>

              <select
                id="budget-category"
                value={category}
                disabled={budgetType === "overall" || Boolean(editingBudget)}
                onChange={(event) => setCategory(event.target.value)}
                className="
                  w-full
                  border border-slate-300
                  dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-slate-900 dark:text-white
                  px-4 py-3
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  disabled:opacity-60
                "
              >
                <option value="">
                  {budgetType === "overall"
                    ? "Not required"
                    : "Select Category"}
                </option>

                {categories.map((categoryItem) => (
                  <option key={categoryItem} value={categoryItem}>
                    {categoryItem}
                  </option>
                ))}
              </select>
            </div>

            {/* AMOUNT */}

            <div>
              <label
                htmlFor="budget-amount"
                className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Budget Amount
              </label>

              <input
                id="budget-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="
                  w-full
                  border border-slate-300
                  dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-slate-900 dark:text-white
                  px-4 py-3
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* BUTTON */}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  text-white
                  py-3
                  rounded-lg
                  font-semibold
                  transition
                "
              >
                {saving ? (
                  "Saving..."
                ) : editingBudget ? (
                  <>
                    <FiEdit2 />
                    Update Budget
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Create Budget
                  </>
                )}
              </button>

              {editingBudget && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="
                    px-4
                    bg-slate-500
                    hover:bg-slate-600
                    text-white
                    rounded-lg
                    transition
                  "
                  title="Cancel"
                >
                  <FiX />
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ==========================================
            BUDGET VS ACTUAL
        ========================================== */}

        <section
          className="
            bg-white
            dark:bg-slate-800
            border border-slate-200
            dark:border-slate-700
            rounded-2xl
            shadow-lg
            p-6
          "
        >
          <div className="flex items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <FiBarChart2 size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Budget vs Actual
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Compare your planned budget with actual spending.
              </p>
            </div>
          </div>

          {dashboardBudget <= 0 ? (
            <div className="py-10 text-center">
              <FiPieChart
                size={40}
                className="mx-auto text-slate-300 dark:text-slate-600"
              />

              <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">
                No budget has been set for this month.
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create an overall or category budget above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PLANNED */}

              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Planned Budget
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(dashboardBudget)}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-blue-600">100%</span>
                </div>

                <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-lg"
                    style={{
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {/* ACTUAL */}

              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Actual Spending
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(monthlyExpenseTotal)}
                    </p>
                  </div>

                  <span
                    className={`text-sm font-bold ${
                      spendingPercentage >= 100
                        ? "text-red-500"
                        : spendingPercentage >= 80
                          ? "text-yellow-500"
                          : "text-emerald-500"
                    }`}
                  >
                    {spendingPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <div
                    className={`
                      h-full
                      rounded-lg
                      ${
                        spendingPercentage >= 100
                          ? "bg-red-500"
                          : spendingPercentage >= 80
                            ? "bg-yellow-500"
                            : "bg-emerald-500"
                      }
                    `}
                    style={{
                      width: `${Math.min(spendingPercentage, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* DIFFERENCE */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Planned
                  </p>

                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">
                    {formatCurrency(dashboardBudget)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Actual
                  </p>

                  <p className="text-lg font-bold text-red-700 dark:text-red-300 mt-1">
                    {formatCurrency(monthlyExpenseTotal)}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl ${
                    remainingBudget >= 0
                      ? "bg-emerald-50 dark:bg-emerald-500/10"
                      : "bg-red-50 dark:bg-red-500/10"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      remainingBudget >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    Difference
                  </p>

                  <p
                    className={`text-lg font-bold mt-1 ${
                      remainingBudget >= 0
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {formatCurrency(Math.abs(remainingBudget))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ==========================================
            CATEGORY SPENDING
        ========================================== */}

        <section
          className="
            bg-white
            dark:bg-slate-800
            border border-slate-200
            dark:border-slate-700
            rounded-2xl
            shadow-lg
            p-6
          "
        >
          <div className="flex items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <FiPieChart size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Category Spending
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                See where your money is going this month.
              </p>
            </div>
          </div>

          {categorySpending.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No expenses recorded for {getMonthName(selectedMonth)}.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {categorySpending.map((item) => {
                const percentage =
                  monthlyExpenseTotal > 0
                    ? (item.spent / monthlyExpenseTotal) * 100
                    : 0;

                const matchingBudget = categoryBudgets.find(
                  (budget) =>
                    budget.category?.trim().toLowerCase() ===
                    item.name.trim().toLowerCase(),
                );

                return (
                  <div key={item.name}>
                    <div className="flex justify-between items-center gap-4 mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {matchingBudget
                            ? `Budget: ${formatCurrency(matchingBudget.amount)}`
                            : "No budget set"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.spent)}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==========================================
            CATEGORY BUDGETS
        ========================================== */}

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Category Budgets
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track spending limits by category.
            </p>
          </div>

          {categoryAnalytics.length === 0 ? (
            <div
              className="
                bg-white
                dark:bg-slate-800
                border border-slate-200
                dark:border-slate-700
                rounded-2xl
                shadow-lg
                p-10
                text-center
              "
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <FiPieChart size={25} />
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                No Category Budgets
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Create category budgets above to track individual spending.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {categoryAnalytics.map((budget) => {
                const status =
                  budget.percentage >= 100
                    ? {
                        text: "Over Budget",
                        className:
                          "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
                      }
                    : budget.percentage >= 80
                      ? {
                          text: "Almost Full",
                          className:
                            "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
                        }
                      : {
                          text: "On Track",
                          className:
                            "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
                        };

                return (
                  <div
                    key={budget._id || budget.id}
                    className="
                        bg-white
                        dark:bg-slate-800
                        border border-slate-200
                        dark:border-slate-700
                        rounded-2xl
                        shadow-lg
                        p-5
                      "
                  >
                    {/* TOP */}

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {budget.category}
                          </h3>

                          <span
                            className={`
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                font-semibold
                                ${status.className}
                              `}
                          >
                            {status.text}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Budget: {formatCurrency(budget.budgetAmount)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(budget)}
                          className="
                              w-9
                              h-9
                              rounded-lg
                              bg-yellow-500
                              hover:bg-yellow-600
                              text-white
                              flex
                              items-center
                              justify-center
                              transition
                            "
                          title="Edit budget"
                        >
                          <FiEdit2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(budget)}
                          className="
                              w-9
                              h-9
                              rounded-lg
                              bg-red-500
                              hover:bg-red-600
                              text-white
                              flex
                              items-center
                              justify-center
                              transition
                            "
                          title="Delete budget"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* AMOUNTS */}

                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Budget
                        </p>

                        <p className="font-bold text-slate-900 dark:text-white mt-1">
                          {formatCurrency(budget.budgetAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Spent
                        </p>

                        <p className="font-bold text-red-500 mt-1">
                          {formatCurrency(budget.spent)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {budget.remaining >= 0 ? "Remaining" : "Over"}
                        </p>

                        <p
                          className={`font-bold mt-1 ${
                            budget.remaining >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {formatCurrency(Math.abs(budget.remaining))}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Spending Progress
                        </span>

                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {budget.percentage.toFixed(0)}%
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`
                              h-full
                              rounded-full
                              transition-all
                              duration-500
                              ${
                                budget.percentage >= 100
                                  ? "bg-red-500"
                                  : budget.percentage >= 80
                                    ? "bg-yellow-500"
                                    : "bg-emerald-500"
                              }
                            `}
                          style={{
                            width: `${budget.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ALERT */}

                    {budget.percentage >= 100 && (
                      <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                        <FiAlertTriangle className="mt-0.5 shrink-0" />

                        <span>
                          You have exceeded your{" "}
                          <strong>{budget.category}</strong> budget.
                        </span>
                      </div>
                    )}

                    {budget.percentage >= 80 && budget.percentage < 100 && (
                      <div className="mt-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-2">
                        <FiAlertTriangle className="mt-0.5 shrink-0" />

                        <span>
                          You have used more than 80% of your{" "}
                          <strong>{budget.category}</strong> budget.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==========================================
            OVERALL BUDGET
        ========================================== */}

        {overallBudget && (
          <section
            className="
              bg-white
              dark:bg-slate-800
              border border-slate-200
              dark:border-slate-700
              rounded-2xl
              shadow-lg
              p-6
            "
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <FiTrendingUp size={20} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Overall Monthly Budget
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getMonthName(selectedMonth)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Limit
                  </p>

                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(overallBudgetAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleEdit(overallBudget)}
                  className="
                    w-10
                    h-10
                    rounded-lg
                    bg-yellow-500
                    hover:bg-yellow-600
                    text-white
                    flex
                    items-center
                    justify-center
                  "
                  title="Edit overall budget"
                >
                  <FiEdit2 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(overallBudget)}
                  className="
                    w-10
                    h-10
                    rounded-lg
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    flex
                    items-center
                    justify-center
                  "
                  title="Delete overall budget"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default Budgets;

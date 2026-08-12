import { useState } from "react";
import Layout from "../components/Layout";

import ExpenseChart from "../components/ExpenseChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import ReportInsights from "../components/ReportInsights";

import { useExpense } from "../context/ExpenseContext";

// ==========================================
// GET CURRENT LOCAL MONTH
// ==========================================

const getCurrentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
};

// ==========================================
// GET TRANSACTION MONTH
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

// ==========================================
// GET MONTH NAME
// ==========================================

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
// REPORTS
// ==========================================

function Reports() {
  const { transactions = [], loading } = useExpense();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // ==========================================
  // FILTER SELECTED MONTH
  // ==========================================

  const monthlyTransactions = transactions.filter((transaction) => {
    return getTransactionMonth(transaction.date) === selectedMonth;
  });

  // ==========================================
  // MONTHLY INCOME
  // ==========================================

  const income = monthlyTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => {
      return sum + Number(transaction.amount || 0);
    }, 0);

  // ==========================================
  // MONTHLY EXPENSE
  // ==========================================

  const expense = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => {
      return sum + Number(transaction.amount || 0);
    }, 0);

  // ==========================================
  // MONTHLY BALANCE
  // ==========================================

  const balance = income - expense;

  // ==========================================
  // MONTH NAME
  // ==========================================

  const monthName = getMonthName(selectedMonth);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-5xl mb-4">📊</div>

            <p className="text-slate-500 dark:text-slate-400">
              Loading reports...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1
            className="
              text-3xl
              md:text-4xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Reports
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Analyze your income and expenses
          </p>
        </div>

        {/* MONTH SELECTOR */}

        <div>
          <label
            htmlFor="report-month"
            className="
              block
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-300
              mb-1
            "
          >
            Select Month
          </label>

          <input
            id="report-month"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="
              w-full
              md:w-auto
              border
              border-slate-300
              dark:border-slate-600
              bg-white
              dark:bg-slate-700
              text-slate-900
              dark:text-white
              rounded-lg
              px-4
              py-2
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>
      </div>

      {/* ======================================
          SELECTED MONTH
      ====================================== */}

      <div className="mb-6">
        <h2
          className="
            text-xl
            md:text-2xl
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          {monthName}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Financial summary for the selected month
        </p>
      </div>

      {/* ======================================
          MONTHLY SUMMARY
      ====================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* INCOME */}

        <div
          className="
            bg-gradient-to-r
            from-green-500
            to-emerald-600
            text-white
            p-6
            rounded-2xl
            shadow-lg
            hover:scale-[1.02]
            transition
          "
        >
          <p className="text-sm opacity-90">Monthly Income</p>

          <h2 className="text-3xl font-bold mt-2">
            PKR {income.toLocaleString()}
          </h2>
        </div>

        {/* EXPENSE */}

        <div
          className="
            bg-gradient-to-r
            from-red-500
            to-rose-600
            text-white
            p-6
            rounded-2xl
            shadow-lg
            hover:scale-[1.02]
            transition
          "
        >
          <p className="text-sm opacity-90">Monthly Expense</p>

          <h2 className="text-3xl font-bold mt-2">
            PKR {expense.toLocaleString()}
          </h2>
        </div>

        {/* BALANCE */}

        <div
          className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-600
            text-white
            p-6
            rounded-2xl
            shadow-lg
            hover:scale-[1.02]
            transition
          "
        >
          <p className="text-sm opacity-90">Monthly Balance</p>

          <h2 className="text-3xl font-bold mt-2">
            PKR {balance.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* ======================================
          REPORT INSIGHTS
      ====================================== */}

      {monthlyTransactions.length > 0 && (
        <div className="mb-8">
          <ReportInsights transactions={monthlyTransactions} />
        </div>
      )}

      {/* ======================================
          NO DATA
      ====================================== */}

      {monthlyTransactions.length === 0 ? (
        <div
          className="
            bg-white
            dark:bg-slate-800
            border
            border-slate-200
            dark:border-slate-700
            rounded-2xl
            p-10
            text-center
            shadow-lg
          "
        >
          <div className="text-5xl mb-4">📊</div>

          <h2
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-white
              mb-2
            "
          >
            No Transactions This Month
          </h2>

          <p className="text-slate-500 dark:text-slate-400">
            There are no income or expense transactions for {monthName}.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ======================================
              MONTHLY TREND
          ====================================== */}

          <MonthlyTrendChart transactions={transactions} />

          {/* ======================================
              SELECTED MONTH CHARTS
          ====================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart transactions={monthlyTransactions} />

            <IncomeExpenseChart transactions={monthlyTransactions} />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Reports;

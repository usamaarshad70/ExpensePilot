import { useState } from "react";
import Layout from "../components/Layout";

import ExpenseChart from "../components/ExpenseChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import ReportInsights from "../components/ReportInsights";

import { useExpense } from "../context/ExpenseContext";

function Reports() {
  const { transactions } = useExpense();

  // Current month: YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // ==========================================
  // FILTER SELECTED MONTH
  // ==========================================

  const monthlyTransactions = transactions.filter((transaction) => {
    if (!transaction.date) return false;

    return transaction.date.slice(0, 7) === selectedMonth;
  });

  // ==========================================
  // MONTHLY INCOME
  // ==========================================

  const income = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // ==========================================
  // MONTHLY EXPENSE
  // ==========================================

  const expense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // ==========================================
  // MONTHLY BALANCE
  // ==========================================

  const balance = income - expense;

  return (
    <Layout>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>

          <p className="text-slate-500 mt-1">
            Analyze your income and expenses
          </p>
        </div>

        {/* MONTH SELECTOR */}

        <div>
          <label className="block text-sm font-medium mb-1">Select Month</label>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="
              border
              border-slate-300
              dark:border-slate-600
              dark:bg-slate-700
              rounded-lg
              px-4
              py-2
              outline-none
            "
          />
        </div>
      </div>

      {/* ======================================
          MONTHLY SUMMARY
      ====================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        <div className="mb-6">
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

          <h2 className="text-2xl font-bold mb-2">
            No Transactions This Month
          </h2>

          <p className="text-slate-500">
            There are no income or expense transactions for the selected month.
          </p>
        </div>
      ) : (
        /* ======================================
           CHARTS
        ====================================== */

        <div className="space-y-6">
          {/* MONTHLY TREND */}

          <MonthlyTrendChart transactions={transactions} />

          {/* SELECTED MONTH CHARTS */}

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

import Layout from "../components/Layout";

import ExpenseChart from "../components/ExpenseChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import MonthlyStats from "../components/MonthlyStats";

import { useExpense } from "../context/ExpenseContext";

function Reports() {
  const { transactions } = useExpense();

  const income = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  const hasTransactions = transactions.length > 0;

  return (
    <Layout>
      <h1 className="text-4xl font-bold mb-6">Reports</h1>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-2xl shadow-lg">
          <h2>Total Income</h2>

          <p className="text-3xl font-bold">PKR {income}</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-5 rounded-2xl shadow-lg">
          <h2>Total Expense</h2>

          <p className="text-3xl font-bold">PKR {expense}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-2xl shadow-lg">
          <h2>Balance</h2>

          <p className="text-3xl font-bold">PKR {balance}</p>
        </div>
      </div>

      {/* Monthly Stats */}

      <div className="mb-6">
        <MonthlyStats />
      </div>

      {/* Empty State */}

      {!hasTransactions && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center shadow-lg mb-6">
          <h2 className="text-3xl font-bold mb-3">No Transactions Yet</h2>

          <p className="text-slate-500">
            Add your first income or expense to view reports and charts.
          </p>
        </div>
      )}

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />

        <IncomeExpenseChart />
      </div>
    </Layout>
  );
}

export default Reports;

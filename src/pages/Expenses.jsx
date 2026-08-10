import { useState } from "react";

import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";

import { useExpense } from "../context/ExpenseContext";

function Expenses() {
  const { transactions } = useExpense();

  const [editingTransaction, setEditingTransaction] = useState(null);

  // ==========================================
  // LAST 5 TRANSACTIONS
  // ==========================================

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <Layout>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="mb-8">
        <h1
          className="
            text-3xl
            md:text-4xl
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          Expenses
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Add a new income or expense transaction.
        </p>
      </div>

      {/* ======================================
          ADD / EDIT FORM
      ====================================== */}

      <div
        className="
          bg-white
          dark:bg-slate-800
          border
          border-slate-200
          dark:border-slate-700
          rounded-2xl
          shadow-lg
          p-6
        "
      >
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <ExpenseForm
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
        />
      </div>

      {/* ======================================
          RECENT TRANSACTIONS
      ====================================== */}

      <div
        className="
          mt-8
          bg-white
          dark:bg-slate-800
          border
          border-slate-200
          dark:border-slate-700
          rounded-2xl
          shadow-lg
          p-6
        "
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your latest 5 transactions.
            </p>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No transactions found.
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Add your first transaction above.
            </p>
          </div>
        ) : (
          <ExpenseList
            transactions={recentTransactions}
            onEdit={setEditingTransaction}
          />
        )}
      </div>
    </Layout>
  );
}

export default Expenses;

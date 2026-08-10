import { useState } from "react";

import ExpenseItem from "./ExpenseItem";

function ExpenseList({ transactions = [], onEdit }) {
  const [sortBy, setSortBy] = useState("newest");

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date) - new Date(a.date);
    }

    return new Date(a.date) - new Date(b.date);
  });

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (sortedTransactions.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-4xl mb-3">💸</p>

        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          No Transactions Found
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Try changing your search or filter.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ======================================
          SORT
      ====================================== */}

      <div className="flex justify-end mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="
            border
            border-slate-300
            dark:border-slate-600
            bg-white
            dark:bg-slate-700
            text-slate-800
            dark:text-white
            p-2
            rounded-lg
            outline-none
          "
        >
          <option value="newest">Newest First</option>

          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* ======================================
          TRANSACTION LIST
      ====================================== */}

      <div className="space-y-3">
        {sortedTransactions.map((transaction) => (
          <ExpenseItem
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}

export default ExpenseList;

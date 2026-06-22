import { useState } from "react";

import ExpenseItem from "./ExpenseItem";

function ExpenseList({ transactions, onEdit }) {
  const [sortBy, setSortBy] = useState("newest");

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date) - new Date(a.date);
    }

    return new Date(a.date) - new Date(b.date);
  });

  if (sortedTransactions.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold">No Transactions Found</h2>

        <p className="text-gray-500">Add your first transaction.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="
          border
          p-2
          rounded
          dark:bg-slate-700
          "
        >
          <option value="newest">Newest First</option>

          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {sortedTransactions.map((transaction) => (
        <ExpenseItem
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
        />
      ))}
    </>
  );
}

export default ExpenseList;

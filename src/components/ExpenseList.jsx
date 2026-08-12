import ExpenseItem from "./ExpenseItem";

function ExpenseList({ transactions = [], onEdit }) {
  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-5xl mb-4">💸</div>

        <h3
          className="
            text-lg
            font-semibold
            text-slate-700
            dark:text-slate-200
          "
        >
          No Transactions Found
        </h3>

        <p
          className="
            text-sm
            text-slate-500
            dark:text-slate-400
            mt-1
          "
        >
          Try changing your search or filter.
        </p>
      </div>
    );
  }

  // ==========================================
  // TRANSACTION LIST
  // ==========================================

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <ExpenseItem
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default ExpenseList;

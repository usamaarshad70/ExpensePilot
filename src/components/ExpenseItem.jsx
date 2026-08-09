import { useExpense } from "../context/ExpenseContext";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function ExpenseItem({ transaction, onEdit }) {
  const { deleteTransaction } = useExpense();

  return (
    <div
      className="
        flex
        justify-between
        items-center
        p-4
        rounded-xl
        border
        border-slate-200
        dark:border-slate-700
        bg-white
        dark:bg-slate-800
      "
    >
      {/* LEFT */}
      <div>
        <h3 className="font-bold text-lg">{transaction.title}</h3>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          {transaction.category}
        </p>

        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
      </div>

      {/* RIGHT */}
      <div className="flex gap-2 items-center">
        <span
          className={`font-bold ${
            transaction.type === "income" ? "text-green-500" : "text-red-500"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"} PKR{" "}
          {Number(transaction.amount).toLocaleString()}
        </span>

        <button
          onClick={() => onEdit(transaction)}
          className="
            bg-yellow-500
            hover:bg-yellow-600
            text-white
            px-3
            py-1
            rounded
          "
        >
          Edit
        </button>

        <button
          onClick={() => deleteTransaction(transaction.id)}
          className="
            bg-red-500
            hover:bg-red-600
            text-white
            px-3
            py-1
            rounded
          "
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ExpenseItem;

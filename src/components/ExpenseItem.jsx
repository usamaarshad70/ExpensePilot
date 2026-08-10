import { useExpense } from "../context/ExpenseContext";

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function ExpenseItem({ transaction, onEdit }) {
  const { deleteTransaction } = useExpense();

  const isIncome = transaction.type === "income";

  return (
    <div
      className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-4
        p-4
        rounded-xl
        bg-slate-100
        dark:bg-slate-700
        border
        border-slate-200
        dark:border-slate-600
      "
    >
      {/* ======================================
          LEFT
      ====================================== */}

      <div className="min-w-0">
        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
          {transaction.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          {transaction.category}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {formatDate(transaction.date)}
        </p>
      </div>

      {/* ======================================
          RIGHT
      ====================================== */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
          lg:justify-end
        "
      >
        <span
          className={`
            font-bold
            mr-1
            ${isIncome ? "text-green-500" : "text-red-500"}
          `}
        >
          {isIncome ? "+" : "-"} PKR{" "}
          {Number(transaction.amount).toLocaleString()}
        </span>

        <button
          type="button"
          onClick={() => onEdit(transaction)}
          className="
            bg-yellow-500
            hover:bg-yellow-600
            text-white
            px-3
            py-1.5
            rounded-lg
            text-sm
            font-medium
            transition
          "
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => deleteTransaction(transaction.id)}
          className="
            bg-red-500
            hover:bg-red-600
            text-white
            px-3
            py-1.5
            rounded-lg
            text-sm
            font-medium
            transition
          "
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ExpenseItem;

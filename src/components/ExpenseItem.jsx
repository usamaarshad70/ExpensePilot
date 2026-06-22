import { useExpense } from "../context/ExpenseContext";

function ExpenseItem({ transaction, onEdit }) {
  const { deleteTransaction } = useExpense();

  return (
    <div
      className="
      bg-white
      dark:bg-slate-800
      border
      dark:border-slate-700
      p-4
      rounded-xl
      shadow
      flex
      justify-between
      items-center
      mb-3
      "
    >
      <div>
        <h3 className="font-bold text-lg">{transaction.title}</h3>

        <p>{transaction.category}</p>

        <p className="text-sm text-gray-500">{transaction.date}</p>
      </div>

      <div className="flex gap-2 items-center">
        <span
          className={`font-bold ${
            transaction.type === "Income" ? "text-green-500" : "text-red-500"
          }`}
        >
          PKR {transaction.amount}
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

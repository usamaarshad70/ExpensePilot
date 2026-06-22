import { useState, useEffect } from "react";
import { useExpense } from "../context/ExpenseContext";
import toast from "react-hot-toast";

function ExpenseForm({ editingTransaction, setEditingTransaction }) {
  const { addTransaction, updateTransaction, categories } = useExpense();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("Expense");
    setCategory("");
    setDate("");

    if (setEditingTransaction) {
      setEditingTransaction(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter title");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter valid amount");
      return;
    }

    if (!category) {
      toast.error("Please select category");
      return;
    }

    if (!date) {
      toast.error("Please select date");
      return;
    }

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        title,
        amount,
        type,
        category,
        date,
      });
    } else {
      addTransaction({
        id: Date.now(),
        title,
        amount,
        type,
        category,
        date,
      });
    }

    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <input
        type="text"
        placeholder="Transaction Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="
        w-full
        border
        p-3
        rounded-lg
        dark:bg-slate-700
        "
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="
        w-full
        border
        p-3
        rounded-lg
        dark:bg-slate-700
        "
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="
        w-full
        border
        p-3
        rounded-lg
        dark:bg-slate-700
        "
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="
        w-full
        border
        p-3
        rounded-lg
        dark:bg-slate-700
        "
      >
        <option value="Expense">Expense</option>

        <option value="Income">Income</option>
      </select>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="
        w-full
        border
        p-3
        rounded-lg
        dark:bg-slate-700
        "
      >
        <option value="">Select Category</option>

        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        <button
          type="submit"
          className="
          bg-blue-600
          hover:bg-blue-700
          text-white
          px-6
          py-3
          rounded-lg
          "
        >
          {editingTransaction ? "Update Transaction" : "Add Transaction"}
        </button>

        {editingTransaction && (
          <button
            type="button"
            onClick={resetForm}
            className="
            bg-gray-500
            hover:bg-gray-600
            text-white
            px-6
            py-3
            rounded-lg
            "
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ExpenseForm;

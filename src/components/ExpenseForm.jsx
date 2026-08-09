import { useState, useEffect } from "react";
import { useExpense } from "../context/ExpenseContext";
import toast from "react-hot-toast";

function ExpenseForm({ editingTransaction, setEditingTransaction }) {
  const { addTransaction, updateTransaction, categories } = useExpense();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  // ==========================================
  // LOAD TRANSACTION FOR EDITING
  // ==========================================

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount);

      // Make sure type is lowercase for backend
      setType(editingTransaction.type?.toLowerCase() || "expense");

      setCategory(editingTransaction.category);

      // MongoDB returns an ISO date.
      // Convert it to YYYY-MM-DD for date input.
      setDate(
        editingTransaction.date ? editingTransaction.date.substring(0, 10) : "",
      );
    }
  }, [editingTransaction]);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("");
    setDate("");

    if (setEditingTransaction) {
      setEditingTransaction(null);
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
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

    // Backend expects lowercase:
    // "expense" or "income"
    const transactionData = {
      title: title.trim(),
      amount: Number(amount),
      type: type.toLowerCase(),
      category,
      date,
    };

    let success = false;

    if (editingTransaction) {
      success = await updateTransaction({
        ...editingTransaction,
        ...transactionData,
      });
    } else {
      success = await addTransaction(transactionData);
    }

    // Only reset if API operation succeeded
    if (success) {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TITLE */}

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

      {/* AMOUNT */}

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

      {/* DATE */}

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

      {/* TYPE */}

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
        <option value="expense">Expense</option>

        <option value="income">Income</option>
      </select>

      {/* CATEGORY */}

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

      {/* BUTTONS */}

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

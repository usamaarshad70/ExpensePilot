import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useExpense } from "../context/ExpenseContext";

function ExpenseForm({ editingTransaction, setEditingTransaction }) {
  const { addTransaction, updateTransaction, categories } = useExpense();

  const [title, setTitle] = useState("");

  const [amount, setAmount] = useState("");

  const [type, setType] = useState("expense");

  const [category, setCategory] = useState("");

  const [date, setDate] = useState("");

  // ==========================================
  // LOAD EDIT DATA
  // ==========================================

  useEffect(() => {
    if (!editingTransaction) {
      return;
    }

    setTitle(editingTransaction.title || "");

    setAmount(editingTransaction.amount ?? "");

    setType(editingTransaction.type?.toLowerCase() || "expense");

    setCategory(editingTransaction.category || "");

    if (editingTransaction.date) {
      const transactionDate = new Date(editingTransaction.date);

      if (!Number.isNaN(transactionDate.getTime())) {
        setDate(transactionDate.toISOString().slice(0, 10));
      }
    }
  }, [editingTransaction]);

  // ==========================================
  // RESET
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
      toast.error("Please enter transaction title");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
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

    if (success) {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ======================================
          TITLE
      ====================================== */}

      <div>
        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
          Transaction Title
        </label>

        <input
          type="text"
          placeholder="e.g. Salary, Electricity Bill"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="
            w-full
            border
            border-slate-300
            dark:border-slate-600
            bg-white
            dark:bg-slate-700
            text-slate-900
            dark:text-white
            p-3
            rounded-lg
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />
      </div>

      {/* ======================================
          AMOUNT
      ====================================== */}

      <div>
        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
          Amount
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="
            w-full
            border
            border-slate-300
            dark:border-slate-600
            bg-white
            dark:bg-slate-700
            text-slate-900
            dark:text-white
            p-3
            rounded-lg
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />
      </div>

      {/* ======================================
          DATE
      ====================================== */}

      <div>
        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
          Date
        </label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="
            w-full
            border
            border-slate-300
            dark:border-slate-600
            bg-white
            dark:bg-slate-700
            text-slate-900
            dark:text-white
            p-3
            rounded-lg
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />
      </div>

      {/* ======================================
          TYPE
      ====================================== */}

      <div>
        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
          Transaction Type
        </label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="
            w-full
            border
            border-slate-300
            dark:border-slate-600
            bg-white
            dark:bg-slate-700
            text-slate-900
            dark:text-white
            p-3
            rounded-lg
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >
          <option value="expense">Expense</option>

          <option value="income">Income</option>
        </select>
      </div>

      {/* ======================================
          CATEGORY
      ====================================== */}

      <div>
        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
          Category
        </label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="
            w-full
            border
            border-slate-300
            dark:border-slate-600
            bg-white
            dark:bg-slate-700
            text-slate-900
            dark:text-white
            p-3
            rounded-lg
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >
          <option value="">Select Category</option>

          {categories.map((categoryItem) => (
            <option key={categoryItem} value={categoryItem}>
              {categoryItem}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================
          BUTTONS
      ====================================== */}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-6
            py-3
            rounded-lg
            font-medium
            transition
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
              font-medium
              transition
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

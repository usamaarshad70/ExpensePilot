import { useState } from "react";
import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";
import { useExpense } from "../context/ExpenseContext";

const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Dashboard() {
  const { transactions, deleteTransaction, loading } = useExpense();

  // ==========================================
  // EDIT MODAL
  // ==========================================

  const [editingTransaction, setEditingTransaction] = useState(null);

  // ==========================================
  // OVERALL SUMMARY
  // ==========================================

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const balance = income - expense;

  // ==========================================
  // CURRENT MONTH
  // ==========================================

  const currentDate = new Date();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthName = currentDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const monthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const monthlyIncome = monthlyTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const monthlyExpense = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  // ==========================================
  // RECENT TRANSACTIONS
  // ==========================================

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    await deleteTransaction(id);
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  // ==========================================
  // CLOSE EDIT MODAL
  // ==========================================

  const closeEditModal = () => {
    setEditingTransaction(null);
  };

  return (
    <Layout>
      {/* ==========================================
          PAGE TITLE
      ========================================== */}

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
          Dashboard
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Overview of your finances
        </p>
      </div>

      {/* ==========================================
          OVERALL SUMMARY
      ========================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* TOTAL INCOME */}

        <div
          className="
            bg-gradient-to-r
            from-emerald-500
            to-green-600
            text-white
            p-6
            rounded-2xl
            shadow-lg
            hover:scale-[1.02]
            transition-all
            duration-300
          "
        >
          <h3 className="text-lg">Total Income</h3>

          <p className="text-4xl font-bold mt-2">
            PKR {income.toLocaleString()}
          </p>
        </div>

        {/* TOTAL EXPENSE */}

        <div
          className="
            bg-gradient-to-r
            from-rose-500
            to-red-600
            text-white
            p-6
            rounded-2xl
            shadow-lg
            hover:scale-[1.02]
            transition-all
            duration-300
          "
        >
          <h3 className="text-lg">Total Expense</h3>

          <p className="text-4xl font-bold mt-2">
            PKR {expense.toLocaleString()}
          </p>
        </div>

        {/* BALANCE */}

        <div
          className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-600
            text-white
            p-6
            rounded-2xl
            shadow-lg
            hover:scale-[1.02]
            transition-all
            duration-300
          "
        >
          <h3 className="text-lg">Balance</h3>

          <p className="text-4xl font-bold mt-2">
            PKR {balance.toLocaleString()}
          </p>
        </div>

        {/* TRANSACTIONS */}

        <div
          className="
            bg-gradient-to-r
            from-violet-500
            to-purple-600
            text-white
            p-6
            rounded-2xl
            shadow-lg
            hover:scale-[1.02]
            transition-all
            duration-300
          "
        >
          <h3 className="text-lg">Transactions</h3>

          <p className="text-4xl font-bold mt-2">{transactions.length}</p>
        </div>
      </div>

      {/* ==========================================
          MONTHLY SUMMARY
      ========================================== */}

      <div className="mt-10">
        <div className="mb-5">
          <h2
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            {monthName}
          </h2>

          <p className="text-slate-500 dark:text-slate-400">
            Monthly financial summary
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MONTHLY INCOME */}

          <div
            className="
              bg-gradient-to-r
              from-emerald-500
              to-green-600
              text-white
              p-6
              rounded-2xl
              shadow-lg
            "
          >
            <p className="text-sm opacity-90">Monthly Income</p>

            <h3 className="text-3xl font-bold mt-2">
              PKR {monthlyIncome.toLocaleString()}
            </h3>
          </div>

          {/* MONTHLY EXPENSE */}

          <div
            className="
              bg-gradient-to-r
              from-rose-500
              to-red-600
              text-white
              p-6
              rounded-2xl
              shadow-lg
            "
          >
            <p className="text-sm opacity-90">Monthly Expense</p>

            <h3 className="text-3xl font-bold mt-2">
              PKR {monthlyExpense.toLocaleString()}
            </h3>
          </div>

          {/* MONTHLY BALANCE */}

          <div
            className="
              bg-gradient-to-r
              from-blue-500
              to-indigo-600
              text-white
              p-6
              rounded-2xl
              shadow-lg
            "
          >
            <p className="text-sm opacity-90">Monthly Balance</p>

            <h3 className="text-3xl font-bold mt-2">
              PKR {monthlyBalance.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* ==========================================
          RECENT TRANSACTIONS
      ========================================== */}

      <div className="mt-10">
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
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-2
              mb-6
            "
          >
            <div>
              <h2
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Recent Transactions
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Latest 5 transactions
              </p>
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="py-10 text-center">
              <p className="text-slate-500">Loading transactions...</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No transactions found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
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
                    <h3
                      className="
                        font-semibold
                        text-slate-900
                        dark:text-white
                        truncate
                      "
                    >
                      {transaction.title}
                    </h3>

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-300
                      "
                    >
                      {transaction.category}
                    </p>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        dark:text-slate-400
                        mt-1
                      "
                    >
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
                      gap-3
                    "
                  >
                    {/* AMOUNT */}

                    <p
                      className={`
                        font-bold
                        whitespace-nowrap
                        ${
                          transaction.type === "income"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      `}
                    >
                      {transaction.type === "income" ? "+" : "-"} PKR{" "}
                      {Number(transaction.amount).toLocaleString()}
                    </p>

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() => handleEdit(transaction)}
                      className="
                        bg-yellow-500
                        hover:bg-yellow-600
                        active:bg-yellow-700
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        font-medium
                        transition
                      "
                    >
                      Edit
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() => handleDelete(transaction.id)}
                      className="
                        bg-red-500
                        hover:bg-red-600
                        active:bg-red-700
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        font-medium
                        transition
                      "
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          EDIT TRANSACTION MODAL
      ========================================== */}

      {editingTransaction && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            p-4
            bg-black/60
            backdrop-blur-sm
          "
          onClick={closeEditModal}
        >
          <div
            className="
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              bg-white
              dark:bg-slate-800
              rounded-2xl
              shadow-2xl
              p-6
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                mb-6
              "
            >
              <div>
                <h2
                  className="
                    text-2xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Edit Transaction
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                    mt-1
                  "
                >
                  Update transaction details
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-slate-100
                  dark:bg-slate-700
                  text-slate-600
                  dark:text-slate-200
                  hover:bg-red-500
                  hover:text-white
                  transition
                  text-xl
                "
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* EXISTING EXPENSE FORM */}

            <ExpenseForm
              editingTransaction={editingTransaction}
              setEditingTransaction={setEditingTransaction}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;

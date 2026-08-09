import { useExpense } from "../context/ExpenseContext";

function Dashboard() {
  const { transactions } = useExpense();

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // TOTAL INCOME
  // ==========================================

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // ==========================================
  // TOTAL EXPENSE
  // ==========================================

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // ==========================================
  // BALANCE
  // ==========================================

  const balance = totalIncome - totalExpense;

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categoryCount = [...new Set(transactions.map((item) => item.category))]
    .length;

  // ==========================================
  // RECENT TRANSACTIONS
  // ==========================================

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* ======================================
          HEADER
      ====================================== */}

      <div>
        <h1 className="text-4xl md:text-5xl font-bold">Dashboard</h1>
      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* INCOME */}

        <div className="bg-green-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg">Total Income</h2>

          <p className="text-3xl font-bold mt-3">
            PKR {totalIncome.toLocaleString()}
          </p>
        </div>

        {/* EXPENSE */}

        <div className="bg-red-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg">Total Expense</h2>

          <p className="text-3xl font-bold mt-3">
            PKR {totalExpense.toLocaleString()}
          </p>
        </div>

        {/* BALANCE */}

        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg">Balance</h2>

          <p className="text-3xl font-bold mt-3">
            PKR {balance.toLocaleString()}
          </p>
        </div>

        {/* TRANSACTIONS */}

        <div className="bg-purple-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg">Transactions</h2>

          <p className="text-3xl font-bold mt-3">{transactions.length}</p>
        </div>
      </div>

      {/* ======================================
          RECENT TRANSACTIONS
      ====================================== */}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No transactions yet.
          </p>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction._id || transaction.id}
                className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    bg-slate-100
                    dark:bg-slate-700
                    p-4
                    rounded-xl
                  "
              >
                {/* LEFT */}

                <div>
                  <h3 className="font-semibold text-lg">{transaction.title}</h3>

                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {transaction.category}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                {/* RIGHT */}

                <div
                  className={`font-bold text-lg ${
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"} PKR{" "}
                  {Number(transaction.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================
          CATEGORY SUMMARY
      ====================================== */}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>

        <p className="text-3xl font-bold">{categoryCount}</p>

        <p className="text-gray-500 dark:text-gray-400">Active categories</p>
      </div>
    </div>
  );
}

export default Dashboard;

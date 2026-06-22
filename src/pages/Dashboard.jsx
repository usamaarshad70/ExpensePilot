import Layout from "../components/Layout";
import { useExpense } from "../context/ExpenseContext";

function Dashboard() {
  const { transactions } = useExpense();

  const income = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  const recentTransactions = [...transactions].reverse().slice(0, 5);

  return (
    <Layout>
      <h1 className="text-5xl font-bold mb-8">Dashboard</h1>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div
          className="
          bg-gradient-to-r
          from-emerald-500
          to-green-600
          text-white
          p-6
          rounded-2xl
          shadow-lg
          hover:scale-105
          transition-all
          duration-300
          "
        >
          <h3 className="text-lg">Total Income</h3>

          <p className="text-4xl font-bold mt-2">PKR {income}</p>
        </div>

        <div
          className="
          bg-gradient-to-r
          from-rose-500
          to-red-600
          text-white
          p-6
          rounded-2xl
          shadow-lg
          hover:scale-105
          transition-all
          duration-300
          "
        >
          <h3 className="text-lg">Total Expense</h3>

          <p className="text-4xl font-bold mt-2">PKR {expense}</p>
        </div>

        <div
          className="
          bg-gradient-to-r
          from-blue-500
          to-indigo-600
          text-white
          p-6
          rounded-2xl
          shadow-lg
          hover:scale-105
          transition-all
          duration-300
          "
        >
          <h3 className="text-lg">Balance</h3>

          <p className="text-4xl font-bold mt-2">PKR {balance}</p>
        </div>

        <div
          className="
          bg-gradient-to-r
          from-violet-500
          to-purple-600
          text-white
          p-6
          rounded-2xl
          shadow-lg
          hover:scale-105
          transition-all
          duration-300
          "
        >
          <h3 className="text-lg">Transactions</h3>

          <p className="text-4xl font-bold mt-2">{transactions.length}</p>
        </div>
      </div>

      {/* Recent Transactions */}

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
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>

          {recentTransactions.length === 0 ? (
            <p className="text-slate-500">No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="
                    flex
                    justify-between
                    items-center
                    p-4
                    rounded-xl
                    bg-slate-100
                    dark:bg-slate-700
                    "
                >
                  <div>
                    <h3 className="font-semibold">{transaction.title}</h3>

                    <p className="text-sm text-slate-500">
                      {transaction.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === "Income"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      PKR {transaction.amount}
                    </p>

                    <p className="text-xs text-slate-500">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;

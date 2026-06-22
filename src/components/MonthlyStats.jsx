import { useExpense } from "../context/ExpenseContext";

function MonthlyStats() {
  const { transactions } = useExpense();

  const income = transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "Expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const balance = income - expense;

  return (
    <div
      className="
      bg-gradient-to-r
      from-indigo-500
      to-purple-500
      text-white
      p-6
      rounded-xl
      shadow
      "
    >
      <h2 className="text-2xl font-bold mb-4">Monthly Statistics</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm">Income</p>

          <h3 className="text-2xl font-bold">PKR {income}</h3>
        </div>

        <div>
          <p className="text-sm">Expense</p>

          <h3 className="text-2xl font-bold">PKR {expense}</h3>
        </div>

        <div>
          <p className="text-sm">Balance</p>

          <h3 className="text-2xl font-bold">PKR {balance}</h3>
        </div>
      </div>
    </div>
  );
}

export default MonthlyStats;

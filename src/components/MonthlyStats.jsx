import { useExpense } from "../context/ExpenseContext";

function MonthlyStats({ selectedMonth }) {
  const { transactions } = useExpense();

  const monthlyTransactions = transactions.filter((transaction) => {
    if (!selectedMonth) return true;

    const transactionDate = new Date(transaction.date);

    const transactionMonth = `${transactionDate.getFullYear()}-${String(
      transactionDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    return transactionMonth === selectedMonth;
  });

  const income = monthlyTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expense = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const balance = income - expense;

  return (
    <div
      className="
        bg-gradient-to-r
        from-violet-500
        to-purple-600
        text-white
        p-6
        rounded-2xl
        shadow-lg
      "
    >
      <h2 className="text-2xl font-bold mb-6">Monthly Statistics</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* INCOME */}
        <div>
          <p className="text-sm opacity-90">Income</p>

          <h3 className="text-2xl font-bold">PKR {income.toLocaleString()}</h3>
        </div>

        {/* EXPENSE */}
        <div>
          <p className="text-sm opacity-90">Expense</p>

          <h3 className="text-2xl font-bold">PKR {expense.toLocaleString()}</h3>
        </div>

        {/* BALANCE */}
        <div>
          <p className="text-sm opacity-90">Balance</p>

          <h3 className="text-2xl font-bold">PKR {balance.toLocaleString()}</h3>
        </div>
      </div>
    </div>
  );
}

export default MonthlyStats;

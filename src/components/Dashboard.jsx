import { useExpense } from "../context/ExpenseContext";

function Dashboard() {
  const { expenses } = useExpense();

  const totalAmount = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-500 text-white p-4 rounded">
        <h2>Total Expenses</h2>
        <p className="text-2xl">{expenses.length}</p>
      </div>

      <div className="bg-green-500 text-white p-4 rounded">
        <h2>Total Amount</h2>
        <p className="text-2xl">PKR {totalAmount}</p>
      </div>

      <div className="bg-purple-500 text-white p-4 rounded">
        <h2>Categories</h2>
        <p className="text-2xl">
          {[...new Set(expenses.map((e) => e.category))].length}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

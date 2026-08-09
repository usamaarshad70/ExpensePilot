import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ExpenseChart({ transactions }) {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense",
  );

  const chartData = Object.entries(
    expenseTransactions.reduce((acc, transaction) => {
      acc[transaction.category] =
        (acc[transaction.category] || 0) + Number(transaction.amount);

      return acc;
    }, {}),
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF4560",
    "#26A69A",
    "#775DD0",
    "#546E7A",
    "#EC407A",
  ];

  return (
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
      <h2 className="text-2xl font-bold mb-4">Category Breakdown</h2>

      {chartData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-3">📊</p>

            <p className="text-slate-500 text-lg">No expense data available</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ExpenseChart;

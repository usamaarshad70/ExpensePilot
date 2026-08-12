import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ExpenseChart({ transactions = [] }) {
  // ==========================================
  // EXPENSE TRANSACTIONS
  // ==========================================

  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense",
  );

  // ==========================================
  // CATEGORY TOTALS
  // ==========================================

  const categoryTotals = expenseTransactions.reduce(
    (accumulator, transaction) => {
      const category = transaction.category?.trim() || "Uncategorized";

      accumulator[category] =
        (accumulator[category] || 0) + Number(transaction.amount || 0);

      return accumulator;
    },
    {},
  );

  // ==========================================
  // CHART DATA
  // ==========================================

  const chartData = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
    }));

  // ==========================================
  // COLORS
  // ==========================================

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

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (value) => {
    return `PKR ${Number(value).toLocaleString()}`;
  };

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
      <h2
        className="
          text-2xl
          font-bold
          text-slate-900
          dark:text-white
          mb-4
        "
      >
        Category Breakdown
      </h2>

      {chartData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-3">📊</p>

            <p className="text-slate-500 dark:text-slate-400 text-lg">
              No expense data available
            </p>
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
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => {
                return formatCurrency(value);
              }}
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ExpenseChart;

import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

function IncomeExpenseChart({ transactions }) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const hasData = income > 0 || expense > 0;

  const data = [
    {
      name: "Income",
      value: income,
    },
    {
      name: "Expense",
      value: expense,
    },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

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
      <h2 className="text-2xl font-bold mb-4">Income vs Expense</h2>

      {!hasData ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-3">💰</p>

            <p className="text-slate-500 text-lg">
              No transaction data available
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
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

export default IncomeExpenseChart;

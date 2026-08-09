import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useExpense } from "../context/ExpenseContext";

function MonthlyTrend() {
  const { transactions } = useExpense();

  const monthlyData = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);

    const month = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income") {
      monthlyData[month].income += Number(transaction.amount);
    }

    if (transaction.type === "expense") {
      monthlyData[month].expense += Number(transaction.amount);
    }
  });

  const chartData = Object.values(monthlyData).sort(
    (a, b) => new Date(a.month) - new Date(b.month),
  );

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
      <h2 className="text-2xl font-bold mb-2">Monthly Income & Expense</h2>

      <p className="text-slate-500 mb-6">
        Compare your income and expenses month by month.
      </p>

      {chartData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-3">📈</p>

            <p className="text-slate-500 text-lg">No monthly data available</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip
              formatter={(value) => `PKR ${Number(value).toLocaleString()}`}
            />

            <Legend />

            <Bar
              dataKey="income"
              name="Income"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
            />

            <Bar
              dataKey="expense"
              name="Expense"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default MonthlyTrend;

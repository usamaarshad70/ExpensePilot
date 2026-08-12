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

function MonthlyTrendChart({ transactions = [] }) {
  const today = new Date();

  // ==========================================
  // GET LAST 6 MONTHS
  // ==========================================

  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const key = `${year}-${month}`;

    const label = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    months.push({
      key,
      label,
    });
  }

  // ==========================================
  // CALCULATE MONTHLY DATA
  // ==========================================

  const chartData = months.map((month) => {
    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      if (!transaction.date) return;

      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) return;

      const transactionMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (transactionMonth !== month.key) return;

      const amount = Number(transaction.amount || 0);

      if (transaction.type === "income") {
        income += amount;
      }

      if (transaction.type === "expense") {
        expense += amount;
      }
    });

    return {
      month: month.label,
      income,
      expense,
    };
  });

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
      {/* HEADER */}

      <h2
        className="
          text-2xl
          font-bold
          text-slate-900
          dark:text-white
        "
      >
        Monthly Trend
      </h2>

      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Income and expenses for the last 6 months
      </p>

      {/* CHART */}

      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis
              tickFormatter={(value) => {
                return `PKR ${Number(value).toLocaleString()}`;
              }}
            />

            <Tooltip
              formatter={(value) => {
                return formatCurrency(value);
              }}
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
      </div>
    </div>
  );
}

export default MonthlyTrendChart;

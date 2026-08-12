import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

function IncomeExpenseChart({ transactions = [] }) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const total = income + expense;

  const balance = income - expense;

  const incomePercentage = total > 0 ? (income / total) * 100 : 0;
  const expensePercentage = total > 0 ? (expense / total) * 100 : 0;

  const data = [
    {
      name: "Income",
      value: income,
    },
    {
      name: "Expense",
      value: expense,
    },
  ].filter((item) => item.value > 0);

  const COLORS = ["#22c55e", "#ef4444"];

  const formatCurrency = (value) => `PKR ${Number(value).toLocaleString()}`;

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

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Income vs Expense
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Compare your income and spending
        </p>
      </div>

      {/* NO DATA */}

      {total === 0 ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">💰</div>

            <p className="text-slate-500 dark:text-slate-400 text-lg">
              No transaction data available
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* CHART */}

          <div className="relative">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={115}
                  paddingAngle={3}
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry) => {
                    const index = entry.name === "Income" ? 0 : 1;

                    return <Cell key={entry.name} fill={COLORS[index]} />;
                  })}
                </Pie>

                <Tooltip formatter={(value) => formatCurrency(value)} />

                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>

            {/* CENTER VALUE */}

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                pointer-events-none
              "
            >
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total
                </p>

                <p className="font-bold text-slate-900 dark:text-white">
                  PKR {total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* STAT CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {/* INCOME */}

            <div
              className="
                rounded-xl
                p-4
                bg-emerald-50
                dark:bg-emerald-950/40
                border
                border-emerald-100
                dark:border-emerald-900
              "
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Income
              </p>

              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                PKR {income.toLocaleString()}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {incomePercentage.toFixed(1)}% of total
              </p>
            </div>

            {/* EXPENSE */}

            <div
              className="
                rounded-xl
                p-4
                bg-red-50
                dark:bg-red-950/40
                border
                border-red-100
                dark:border-red-900
              "
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expense
              </p>

              <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                PKR {expense.toLocaleString()}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {expensePercentage.toFixed(1)}% of total
              </p>
            </div>

            {/* BALANCE */}

            <div
              className={`
                rounded-xl
                p-4
                border
                ${
                  balance >= 0
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900"
                    : "bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900"
                }
              `}
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Balance
              </p>

              <p
                className={`
                  text-lg
                  font-bold
                  mt-1
                  ${
                    balance >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-orange-600 dark:text-orange-400"
                  }
                `}
              >
                PKR {balance.toLocaleString()}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {balance >= 0 ? "Positive balance" : "Negative balance"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default IncomeExpenseChart;

function ReportInsights({ transactions }) {
  // ==========================================
  // TOTAL INCOME
  // ==========================================

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // ==========================================
  // TOTAL EXPENSE
  // ==========================================

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // ==========================================
  // SAVINGS RATE
  // ==========================================

  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  // ==========================================
  // EXPENSE BY CATEGORY
  // ==========================================

  const categoryTotals = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      const category = transaction.category;

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(transaction.amount);
    });

  // ==========================================
  // TOP EXPENSE CATEGORY
  // ==========================================

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const topCategoryName = topCategory ? topCategory[0] : "No data";
  const topCategoryAmount = topCategory ? topCategory[1] : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* TOP EXPENSE CATEGORY */}

      <div
        className="
          bg-white
          dark:bg-slate-800
          border
          border-slate-200
          dark:border-slate-700
          rounded-2xl
          p-6
          shadow-lg
        "
      >
        <p className="text-sm text-slate-500">Top Expense Category</p>

        <div className="flex items-center justify-between mt-3">
          <div>
            <h2 className="text-2xl font-bold">{topCategoryName}</h2>

            <p className="text-slate-500 mt-1">
              PKR {topCategoryAmount.toLocaleString()}
            </p>
          </div>

          <div className="text-4xl">💸</div>
        </div>
      </div>

      {/* SAVINGS RATE */}

      <div
        className="
          bg-white
          dark:bg-slate-800
          border
          border-slate-200
          dark:border-slate-700
          rounded-2xl
          p-6
          shadow-lg
        "
      >
        <p className="text-sm text-slate-500">Savings Rate</p>

        <div className="flex items-center justify-between mt-3">
          <div>
            <h2
              className={`text-3xl font-bold ${
                savingsRate >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {savingsRate.toFixed(1)}%
            </h2>

            <p className="text-slate-500 mt-1">
              {savingsRate >= 0
                ? "You saved this month"
                : "You spent more than you earned"}
            </p>
          </div>

          <div className="text-4xl">{savingsRate >= 0 ? "📈" : "📉"}</div>
        </div>
      </div>
    </div>
  );
}

export default ReportInsights;

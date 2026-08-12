function ReportInsights({ transactions = [] }) {
  // ==========================================
  // TOTAL INCOME
  // ==========================================

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => {
      return sum + Number(transaction.amount || 0);
    }, 0);

  // ==========================================
  // TOTAL EXPENSE
  // ==========================================

  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => {
      return sum + Number(transaction.amount || 0);
    }, 0);

  // ==========================================
  // SAVINGS
  // ==========================================

  const savings = income - expense;

  // ==========================================
  // SAVINGS RATE
  // ==========================================

  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  // ==========================================
  // EXPENSE BY CATEGORY
  // ==========================================

  const categoryTotals = {};

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const category = transaction.category?.trim() || "Uncategorized";

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(transaction.amount || 0);
    });

  // ==========================================
  // TOP EXPENSE CATEGORY
  // ==========================================

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const topCategoryName = topCategory ? topCategory[0] : "No expense data";

  const topCategoryAmount = topCategory ? topCategory[1] : 0;

  // ==========================================
  // STATUS
  // ==========================================

  const isPositive = savingsRate >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ======================================
          TOP EXPENSE CATEGORY
      ====================================== */}

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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Top Expense Category
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="min-w-0">
            <h2
              className="
                text-2xl
                font-bold
                text-slate-900
                dark:text-white
                truncate
              "
            >
              {topCategoryName}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mt-1">
              PKR {topCategoryAmount.toLocaleString()}
            </p>
          </div>

          <div className="text-4xl ml-4">💸</div>
        </div>
      </div>

      {/* ======================================
          SAVINGS RATE
      ====================================== */}

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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Savings Rate
        </p>

        <div className="flex items-center justify-between mt-3">
          <div>
            <h2
              className={`text-3xl font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {savingsRate.toFixed(1)}%
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {isPositive
                ? "You saved this month"
                : "You spent more than you earned"}
            </p>
          </div>

          <div className="text-4xl">{isPositive ? "📈" : "📉"}</div>
        </div>
      </div>
    </div>
  );
}

export default ReportInsights;

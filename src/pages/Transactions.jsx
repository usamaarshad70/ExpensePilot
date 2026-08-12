import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import ExpenseList from "../components/ExpenseList";
import ExpenseForm from "../components/ExpenseForm";

import { useExpense } from "../context/ExpenseContext";

// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ==========================================
// TRANSACTIONS PAGE
// ==========================================

function Transactions() {
  const { transactions = [], categories = [], loading } = useExpense();

  // ==========================================
  // FILTER STATES
  // ==========================================

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ==========================================
  // EDIT STATE
  // ==========================================

  const [editingTransaction, setEditingTransaction] = useState(null);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);

  const transactionsPerPage = 8;

  // ==========================================
  // FILTER + SORT
  // ==========================================

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    if (search.trim()) {
      const searchValue = search.toLowerCase().trim();

      result = result.filter((transaction) => {
        const title = String(transaction.title || "").toLowerCase();
        const category = String(transaction.category || "").toLowerCase();

        return title.includes(searchValue) || category.includes(searchValue);
      });
    }

    // ------------------------------------------
    // CATEGORY
    // ------------------------------------------

    if (categoryFilter) {
      result = result.filter(
        (transaction) => transaction.category === categoryFilter,
      );
    }

    // ------------------------------------------
    // TYPE
    // ------------------------------------------

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // ------------------------------------------
    // FROM DATE
    // ------------------------------------------

    if (fromDate) {
      result = result.filter((transaction) => {
        if (!transaction.date) return false;

        const transactionDate = new Date(transaction.date);

        const startDate = new Date(`${fromDate}T00:00:00`);

        return transactionDate >= startDate;
      });
    }

    // ------------------------------------------
    // TO DATE
    // ------------------------------------------

    if (toDate) {
      result = result.filter((transaction) => {
        if (!transaction.date) return false;

        const transactionDate = new Date(transaction.date);

        const endDate = new Date(`${toDate}T23:59:59`);

        return transactionDate <= endDate;
      });
    }

    // ------------------------------------------
    // SORT
    // ------------------------------------------

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      const amountA = Number(a.amount || 0);
      const amountB = Number(b.amount || 0);

      switch (sortBy) {
        case "oldest":
          return dateA - dateB;

        case "highest":
          return amountB - amountA;

        case "lowest":
          return amountA - amountB;

        case "newest":
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [
    transactions,
    search,
    categoryFilter,
    typeFilter,
    sortBy,
    fromDate,
    toDate,
  ]);

  // ==========================================
  // RESET PAGE WHEN FILTER CHANGES
  // ==========================================

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setCurrentPage(1);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setCurrentPage(1);
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setTypeFilter("");
    setSortBy("newest");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // ==========================================
  // PAGINATION CALCULATIONS
  // ==========================================

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage,
  );

  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const startIndex = (safeCurrentPage - 1) * transactionsPerPage;

  const endIndex = startIndex + transactionsPerPage;

  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  // ==========================================
  // SUMMARY
  // ==========================================

  const filteredIncome = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const filteredExpense = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const filteredBalance = filteredIncome - filteredExpense;

  // ==========================================
  // PAGE NUMBERS
  // ==========================================

  const pageNumbers = [];

  for (let page = 1; page <= totalPages; page++) {
    pageNumbers.push(page);
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">💳</div>

            <p className="text-slate-500 dark:text-slate-400">
              Loading transactions...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Layout>
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Transactions
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View, search, filter and manage all your transactions.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium">
          {filteredTransactions.length} Transactions
        </div>
      </div>

      {/* ======================================
          SEARCH & FILTERS
      ====================================== */}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-5 mb-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Search & Filters
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Find exactly the transactions you need.
          </p>
        </div>

        {/* SEARCH */}

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">🔎</span>

            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title or category..."
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-600
                bg-white
                dark:bg-slate-700
                text-slate-900
                dark:text-white
                rounded-lg
                pl-10
                pr-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>
        </div>

        {/* FILTER GRID */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CATEGORY */}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-600
                bg-white
                dark:bg-slate-700
                text-slate-900
                dark:text-white
                rounded-lg
                px-3
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* TYPE */}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type
            </label>

            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-600
                bg-white
                dark:bg-slate-700
                text-slate-900
                dark:text-white
                rounded-lg
                px-3
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >
              <option value="">All Types</option>

              <option value="income">Income</option>

              <option value="expense">Expense</option>
            </select>
          </div>

          {/* SORT */}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-600
                bg-white
                dark:bg-slate-700
                text-slate-900
                dark:text-white
                rounded-lg
                px-3
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >
              <option value="newest">Newest First</option>

              <option value="oldest">Oldest First</option>

              <option value="highest">Highest Amount</option>

              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          {/* FROM DATE */}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-600
                bg-white
                dark:bg-slate-700
                text-slate-900
                dark:text-white
                rounded-lg
                px-3
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>
        </div>

        {/* TO DATE + CLEAR */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-600
                bg-white
                dark:bg-slate-700
                text-slate-900
                dark:text-white
                rounded-lg
                px-3
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="
                w-full
                sm:w-auto
                bg-slate-600
                hover:bg-slate-700
                text-white
                px-5
                py-3
                rounded-lg
                font-medium
                transition
              "
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* INCOME */}

        <div
          className="
            bg-emerald-600
            text-white
            p-5
            rounded-xl
            shadow-lg
          "
        >
          <p className="text-sm opacity-90">Filtered Income</p>

          <h2 className="text-2xl font-bold mt-1">
            PKR {filteredIncome.toLocaleString()}
          </h2>
        </div>

        {/* EXPENSE */}

        <div
          className="
            bg-red-500
            text-white
            p-5
            rounded-xl
            shadow-lg
          "
        >
          <p className="text-sm opacity-90">Filtered Expense</p>

          <h2 className="text-2xl font-bold mt-1">
            PKR {filteredExpense.toLocaleString()}
          </h2>
        </div>

        {/* BALANCE */}

        <div
          className="
            bg-blue-600
            text-white
            p-5
            rounded-xl
            shadow-lg
          "
        >
          <p className="text-sm opacity-90">Filtered Balance</p>

          <h2 className="text-2xl font-bold mt-1">
            PKR {filteredBalance.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* ======================================
          TRANSACTIONS
      ====================================== */}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              All Transactions
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredTransactions.length === 0
                ? "No transactions found"
                : `Showing ${startIndex + 1}-${Math.min(
                    endIndex,
                    filteredTransactions.length,
                  )} of ${filteredTransactions.length} transactions`}
            </p>
          </div>
        </div>

        {/* EMPTY */}

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">💸</div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No Transactions Found
            </h3>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="
                mt-5
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-5
                py-2.5
                rounded-lg
                font-medium
                transition
              "
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* TRANSACTION LIST */}

            <ExpenseList
              transactions={paginatedTransactions}
              onEdit={setEditingTransaction}
            />

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
                {/* PREVIOUS */}

                <button
                  type="button"
                  disabled={safeCurrentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="
                    w-full
                    sm:w-auto
                    px-4
                    py-2
                    rounded-lg
                    bg-slate-200
                    hover:bg-slate-300
                    dark:bg-slate-700
                    dark:hover:bg-slate-600
                    text-slate-800
                    dark:text-white
                    font-medium
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  ← Previous
                </button>

                {/* PAGE NUMBERS */}

                <div className="flex flex-wrap justify-center gap-2">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`
                        min-w-10
                        h-10
                        px-3
                        rounded-lg
                        font-medium
                        transition
                        ${
                          safeCurrentPage === page
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                        }
                      `}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* NEXT */}

                <button
                  type="button"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="
                    w-full
                    sm:w-auto
                    px-4
                    py-2
                    rounded-lg
                    bg-slate-200
                    hover:bg-slate-300
                    dark:bg-slate-700
                    dark:hover:bg-slate-600
                    text-slate-800
                    dark:text-white
                    font-medium
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================
          EDIT MODAL
      ====================================== */}

      {editingTransaction && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/50
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() => setEditingTransaction(null)}
        >
          <div
            className="
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              bg-white
              dark:bg-slate-800
              rounded-2xl
              shadow-2xl
              p-6
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Edit Transaction
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Update your transaction details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="
                  w-10
                  h-10
                  rounded-lg
                  bg-slate-200
                  hover:bg-slate-300
                  dark:bg-slate-700
                  dark:hover:bg-slate-600
                  text-slate-700
                  dark:text-white
                  font-bold
                  text-xl
                "
              >
                ×
              </button>
            </div>

            <ExpenseForm
              editingTransaction={editingTransaction}
              setEditingTransaction={setEditingTransaction}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Transactions;

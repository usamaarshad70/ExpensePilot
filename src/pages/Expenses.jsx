import { useMemo, useState } from "react";

import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

import { useExpense } from "../context/ExpenseContext";

function Expenses() {
  const { transactions, loading } = useExpense();

  // ==========================================
  // EDIT TRANSACTION
  // ==========================================

  const [editingTransaction, setEditingTransaction] = useState(null);

  // ==========================================
  // SEARCH
  // ==========================================

  const [search, setSearch] = useState("");

  // ==========================================
  // CATEGORY FILTER
  // ==========================================

  const [filterCategory, setFilterCategory] = useState("");

  // ==========================================
  // TYPE FILTER
  // ==========================================

  const [filterType, setFilterType] = useState("");

  // ==========================================
  // SORT
  // ==========================================

  const [sortBy, setSortBy] = useState("newest");

  // ==========================================
  // FILTER + SEARCH + SORT
  // ==========================================

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((transaction) => {
        const title = transaction.title?.toLowerCase() || "";
        const category = transaction.category?.toLowerCase() || "";

        return title.includes(searchValue) || category.includes(searchValue);
      });
    }

    // ------------------------------------------
    // CATEGORY
    // ------------------------------------------

    if (filterCategory) {
      result = result.filter(
        (transaction) => transaction.category === filterCategory,
      );
    }

    // ------------------------------------------
    // TYPE
    // ------------------------------------------

    if (filterType) {
      result = result.filter((transaction) => transaction.type === filterType);
    }

    // ------------------------------------------
    // SORT
    // ------------------------------------------

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (sortBy === "newest") {
        return dateB - dateA;
      }

      if (sortBy === "oldest") {
        return dateA - dateB;
      }

      if (sortBy === "highest") {
        return Number(b.amount) - Number(a.amount);
      }

      if (sortBy === "lowest") {
        return Number(a.amount) - Number(b.amount);
      }

      return 0;
    });

    return result;
  }, [transactions, search, filterCategory, filterType, sortBy]);

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setFilterCategory("");
    setFilterType("");
    setSortBy("newest");
  };

  // ==========================================
  // CHECK ACTIVE FILTERS
  // ==========================================

  const hasFilters =
    search || filterCategory || filterType || sortBy !== "newest";

  return (
    <Layout>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="mb-8">
        <h1
          className="
            text-3xl
            md:text-4xl
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          Transactions
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Manage all your income and expense transactions.
        </p>
      </div>

      {/* ======================================
          ADD / EDIT FORM
      ====================================== */}

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
            mb-6
            text-slate-900
            dark:text-white
          "
        >
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <ExpenseForm
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
        />
      </div>

      {/* ======================================
          ALL TRANSACTIONS
      ====================================== */}

      <div
        className="
          mt-8
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

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          "
        >
          <div>
            <h2
              className="
                text-2xl
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              All Transactions
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                px-4
                py-2
                rounded-lg
                bg-slate-100
                hover:bg-slate-200
                dark:bg-slate-700
                dark:hover:bg-slate-600
                text-slate-700
                dark:text-white
                font-medium
                transition
              "
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* ======================================
            SEARCH + FILTERS
        ====================================== */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-4
            mb-6
          "
        >
          {/* SEARCH */}

          <div className="xl:col-span-2">
            <SearchBar search={search} setSearch={setSearch} />
          </div>

          {/* CATEGORY */}

          <CategoryFilter
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />

          {/* TYPE */}

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="
              w-full
              border
              border-slate-300
              dark:border-slate-600
              bg-white
              dark:bg-slate-700
              text-slate-900
              dark:text-white
              p-3
              rounded-lg
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

        {/* ======================================
            SORT
        ====================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
            mb-6
            pb-5
            border-b
            border-slate-200
            dark:border-slate-700
          "
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredTransactions.length === 1
              ? "1 transaction found"
              : `${filteredTransactions.length} transactions found`}
          </p>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="
              border
              border-slate-300
              dark:border-slate-600
              bg-white
              dark:bg-slate-700
              text-slate-900
              dark:text-white
              p-2.5
              rounded-lg
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

        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">⏳</div>

            <p className="text-slate-500 dark:text-slate-400">
              Loading transactions...
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          /* ======================================
             NO RESULTS
          ====================================== */

          <div className="py-12 text-center">
            <div className="text-5xl mb-4">🔍</div>

            <h3
              className="
                text-xl
                font-semibold
                text-slate-800
                dark:text-white
              "
            >
              No Transactions Found
            </h3>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Try changing your search or filters.
            </p>

            {hasFilters && (
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
            )}
          </div>
        ) : (
          /* ======================================
             ALL TRANSACTIONS LIST
          ====================================== */

          <ExpenseList
            transactions={filteredTransactions}
            onEdit={setEditingTransaction}
            hideSort
          />
        )}
      </div>
    </Layout>
  );
}

export default Expenses;

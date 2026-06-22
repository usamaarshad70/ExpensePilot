import { useState } from "react";

import Layout from "../components/Layout";

import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

import { useExpense } from "../context/ExpenseContext";

function Expenses() {
  const { transactions } = useExpense();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "" || transaction.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <h1
        className="
        text-3xl
        font-bold
        mb-6
        "
      >
        Transactions
      </h1>

      <div
        className="
bg-white
dark:bg-slate-800
p-6
rounded-xl
shadow-xl
max-w-7xl
mx-auto
"
      >
        <ExpenseForm
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
        />

        <SearchBar search={search} setSearch={setSearch} />

        <CategoryFilter
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />

        <div
          className="
          flex
          justify-between
          items-center
          mt-4
          mb-4
          "
        >
          <h2
            className="
            text-lg
            font-semibold
            "
          >
            Transaction List
          </h2>
        </div>

        <ExpenseList
          transactions={filteredTransactions}
          onEdit={setEditingTransaction}
        />
      </div>
    </Layout>
  );
}

export default Expenses;

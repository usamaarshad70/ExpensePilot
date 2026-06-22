import { useExpense } from "../context/ExpenseContext";

function CategoryFilter({ filterCategory, setFilterCategory }) {
  const { categories } = useExpense();

  return (
    <select
      value={filterCategory}
      onChange={(e) => setFilterCategory(e.target.value)}
      className="
        w-full
        border
        p-3
        rounded-lg
        dark:bg-slate-700
        "
    >
      <option value="">All Categories</option>

      {categories.map((category) => (
        <option key={category}>{category}</option>
      ))}
    </select>
  );
}

export default CategoryFilter;

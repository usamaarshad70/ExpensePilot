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
      <option value="">All Categories</option>

      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}

export default CategoryFilter;

function SearchBar({ search, setSearch }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full
          border
          border-slate-300
          dark:border-slate-600
          bg-white
          dark:bg-slate-700
          text-slate-900
          dark:text-white
          placeholder-slate-400
          p-3
          rounded-lg
          outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
  );
}

export default SearchBar;

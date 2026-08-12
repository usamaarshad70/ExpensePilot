function SearchBar({ search, setSearch }) {
  return (
    <div className="relative">
      <span
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-slate-400
          text-lg
        "
      >
        🔎
      </span>

      <input
        type="text"
        placeholder="Search by title or category..."
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
          pl-10
          pr-4
          py-3
          rounded-lg
          outline-none
          focus:ring-2
          focus:ring-blue-500
          transition
        "
      />
    </div>
  );
}

export default SearchBar;

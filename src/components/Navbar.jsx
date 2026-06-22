import { Menu } from "lucide-react";

import { useTheme } from "../context/ThemeContext";

function Navbar({ setSidebarOpen }) {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header
      className="
      sticky
      top-0
      z-50
      bg-slate-900
      border-b
      border-slate-800
      px-4
      md:px-8
      py-4
      flex
      justify-between
      items-center
      shadow-lg
      "
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="
          lg:hidden
          text-white
          "
        >
          <Menu size={28} />
        </button>

        <h1
          className="
          text-xl
          md:text-3xl
          font-bold
          text-white
          "
        >
          ExpensePilot
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <span className="hidden md:block text-slate-300">Welcome</span>

        <button
          onClick={toggleTheme}
          className="
          px-3
          md:px-5
          py-2
          md:py-3
          rounded-xl
          bg-white
          text-black
          dark:bg-slate-800
          dark:text-white
          dark:border
          dark:border-slate-700
          "
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}

export default Navbar;

import { Menu, LogOut } from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar({ setSidebarOpen }) {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header
      className="
        h-20
        bg-slate-900
        border-b
        border-slate-800
        flex
        items-center
        justify-between
        px-4
        md:px-6
        shadow-lg
      "
    >
      {/* ======================================
          LEFT SIDE
      ====================================== */}

      <div className="flex items-center gap-3">
        {/* MOBILE MENU */}

        <button
          onClick={() => setSidebarOpen(true)}
          className="
            lg:hidden
            p-2
            rounded-lg
            text-white
            hover:bg-slate-800
            transition
          "
          aria-label="Open sidebar"
        >
          <Menu size={26} />
        </button>

        {/* WEBSITE NAME */}

        <h1
          className="
            text-xl
            md:text-3xl
            font-bold
            text-white
            tracking-tight
          "
        >
          ExpensePilot
        </h1>
      </div>

      {/* ======================================
          RIGHT SIDE
      ====================================== */}

      <div className="flex items-center gap-2 md:gap-4">
        {/* PROFILE */}

        <div className="flex items-center gap-2">
          {/* PROFILE IMAGE */}

          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user?.name || "User"}
              className="
                w-10
                h-10
                md:w-11
                md:h-11
                rounded-full
                object-cover
                border-2
                border-blue-500
                shadow-md
              "
            />
          ) : (
            <div
              className="
                w-10
                h-10
                md:w-11
                md:h-11
                rounded-full
                bg-blue-600
                text-white
                flex
                items-center
                justify-center
                font-bold
                text-lg
                border-2
                border-blue-400
              "
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          {/* DESKTOP USER NAME */}

          <span
            className="
              hidden
              md:block
              text-slate-300
              font-medium
              max-w-[160px]
              truncate
            "
          >
            Welcome, {user?.name || "User"}
          </span>

          {/* MOBILE USER NAME */}

          <span
            className="
              md:hidden
              text-slate-300
              text-sm
              font-medium
              max-w-[80px]
              truncate
            "
          >
            {user?.name || "User"}
          </span>
        </div>

        {/* LOGOUT */}

        <button
          onClick={logout}
          className="
            flex
            items-center
            gap-2
            px-3
            md:px-4
            py-2
            rounded-xl
            bg-red-600
            hover:bg-red-700
            text-white
            font-medium
            transition-all
            duration-300
            hover:scale-105
          "
          title="Logout"
        >
          <LogOut size={18} />

          <span className="hidden md:inline">Logout</span>
        </button>

        {/* THEME */}

        <button
          onClick={toggleTheme}
          className="
            px-3
            md:px-5
            py-2
            md:py-3
            rounded-xl
            font-semibold
            transition-all
            duration-300
            shadow-lg
            bg-white
            text-black
            dark:bg-slate-800
            dark:text-white
            dark:border
            dark:border-slate-700
            hover:scale-105
          "
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀️" : "🌙"}

          <span className="hidden md:inline ml-2">
            {darkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;

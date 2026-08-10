import { Menu, LogOut } from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar({ setSidebarOpen }) {
  const { darkMode, toggleTheme } = useTheme();

  const { user, logout } = useAuth();

  return (
    <header
      className="
        fixed
        top-0
        right-0
        left-0
        lg:left-72
        h-20
        z-50
        bg-slate-900
        border-b
        border-slate-700
        shadow-lg
      "
    >
      <div
        className="
          h-full
          px-3
          sm:px-5
          lg:px-6
          flex
          items-center
          justify-between
          gap-3
        "
      >
        {/* ======================================
            LEFT
        ====================================== */}

        <div className="flex items-center gap-2 min-w-0">
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="
              lg:hidden
              p-2
              rounded-lg
              text-white
              hover:bg-slate-800
            "
            aria-label="Open sidebar"
          >
            <Menu size={25} />
          </button>

          {/* WEBSITE NAME */}

          <h1
            className="
              text-lg
              sm:text-xl
              lg:text-2xl
              font-bold
              text-white
              whitespace-nowrap
            "
          >
            ExpensePilot
          </h1>
        </div>

        {/* ======================================
            RIGHT
        ====================================== */}

        <div
          className="
            flex
            items-center
            gap-2
            lg:gap-4
          "
        >
          {/* PROFILE */}

          <div className="flex items-center">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user?.name || "User"}
                className="
                  w-9
                  h-9
                  sm:w-10
                  sm:h-10
                  lg:w-11
                  lg:h-11
                  rounded-full
                  object-cover
                  border-2
                  border-blue-500
                "
              />
            ) : (
              <div
                className="
                  w-9
                  h-9
                  sm:w-10
                  sm:h-10
                  lg:w-11
                  lg:h-11
                  rounded-full
                  bg-blue-600
                  text-white
                  flex
                  items-center
                  justify-center
                  font-bold
                  border-2
                  border-blue-400
                "
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <span
              className="
                hidden
                lg:block
                ml-2
                text-slate-300
                font-medium
                max-w-[150px]
                truncate
              "
            >
              Welcome, {user?.name || "User"}
            </span>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={logout}
            className="
              flex
              items-center
              justify-center
              w-10
              h-10
              sm:w-auto
              sm:h-auto
              sm:px-3
              lg:px-4
              sm:py-2
              rounded-xl
              bg-red-600
              hover:bg-red-700
              text-white
              font-medium
            "
            title="Logout"
          >
            <LogOut size={18} />

            <span className="hidden sm:inline ml-2">Logout</span>
          </button>

          {/* THEME */}

          <button
            type="button"
            onClick={toggleTheme}
            className="
              flex
              items-center
              justify-center
              w-10
              h-10
              sm:w-auto
              sm:h-auto
              sm:px-3
              lg:px-4
              sm:py-2
              rounded-xl
              font-semibold
              bg-white
              text-black
              dark:bg-slate-800
              dark:text-white
              border
              border-transparent
              dark:border-slate-700
            "
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>

            <span className="hidden sm:inline ml-2">
              {darkMode ? "Light" : "Dark"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

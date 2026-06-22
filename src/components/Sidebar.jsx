import { NavLink } from "react-router-dom";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import { useExpense } from "../context/ExpenseContext";

import logo from "../assets/Expense Pilot Logo.png";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { transactions } = useExpense();

  const links = [
    {
      path: "/",
      label: "📊 Dashboard",
    },
    {
      path: "/expenses",
      label: "💰 Expenses",
    },
    {
      path: "/reports",
      label: "📈 Reports",
    },
    {
      path: "/settings",
      label: "⚙️ Settings",
    },
  ];

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["Title", "Amount", "Type", "Category", "Date"];

    const rows = transactions.map((item) => [
      item.title,
      item.amount,
      item.type,
      item.category,
      item.date,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, `ExpensePilot-${new Date().toISOString().slice(0, 10)}.csv`);

    toast.success("CSV Exported Successfully");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="
          fixed
          inset-0
          bg-black/50
          z-55
          lg:hidden
          "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed
        top-0
        left-0
        h-screen
        w-72
        bg-slate-900
        border-r
        border-slate-800
        shadow-2xl
        flex
        flex-col
        z-60
        transition-transform
        duration-300

        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

        lg:translate-x-0
        `}
      >
        {/* Logo Section */}
        <div
          className="
          flex
          items-center
          justify-between
          px-4
          pt-5
          pb-6
          "
        >
          <div className="flex-1 flex justify-center">
            <img
              src={logo}
              alt="Expense Pilot"
              className="
              w-24
              h-24
              object-contain
              drop-shadow-xl
              hover:scale-105
              transition-all
              duration-300
              "
            />
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="
            lg:hidden
            text-white
            hover:text-red-400
            "
          >
            <X size={28} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4">
          <nav className="space-y-3">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `
                  block
                  px-5
                  py-4
                  rounded-xl
                  font-medium
                  transition-all
                  duration-300

                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                  `
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            className="
            mt-8
            w-full
            bg-emerald-600
            hover:bg-emerald-700
            text-white
            py-4
            rounded-xl
            font-medium
            transition-all
            duration-300
            "
          >
            📄 Export CSV
          </button>
        </div>

        {/* Footer */}
        <div
          className="
          p-4
          text-center
          border-t
          border-slate-800
          text-slate-400
          text-sm
          "
        >
          ExpensePilot v8
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

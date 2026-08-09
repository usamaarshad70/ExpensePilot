import { useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* ======================================
          SIDEBAR
      ====================================== */}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* ======================================
          MAIN AREA
      ====================================== */}

      <div className="lg:ml-72 min-h-screen">
        {/* ======================================
            NAVBAR
        ====================================== */}

        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* ======================================
            PAGE CONTENT
        ====================================== */}

        <main
          className="
            pt-16
            p-4
            md:p-6
            lg:p-8
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

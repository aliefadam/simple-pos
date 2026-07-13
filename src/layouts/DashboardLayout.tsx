import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19]">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main key={location.pathname} className="fade-in mx-auto max-w-[1600px] px-4 pb-24 pt-5 sm:px-6 sm:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

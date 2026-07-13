import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MENU } from "../constants/menu";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function canSee(roles: string[] | undefined, role: string) {
  return !roles || roles.includes(role);
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const activeGroup = MENU.find((item) =>
      item.children?.some((child) => location.pathname === child.to),
    );

    if (!activeGroup) return;

    setOpenGroups({ [activeGroup.label]: true });
  }, [location.pathname]);

  if (!user) return null;

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <i className="fi fi-rr-shop text-base" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">
            Angkringan POS
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Point of Sales</p>
        </div>
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {MENU.filter((item) => canSee(item.roles, user.role)).map((item) => {
          const visibleChildren = item.children?.filter((c) =>
            canSee(c.roles, user.role),
          );
          if (
            item.children &&
            (!visibleChildren || visibleChildren.length === 0)
          )
            return null;

          if (!item.children && item.to) {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                  )
                }
              >
                <i className={`${item.icon} text-base`} />
                {item.label}
              </NavLink>
            );
          }

          const isOpen = openGroups[item.label];
          return (
            <div key={item.label}>
              <button
                onClick={() =>
                  setOpenGroups((prev) =>
                    prev[item.label] ? {} : { [item.label]: true },
                  )
                }
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <i className={`${item.icon} text-base`} />
                  {item.label}
                </span>
                <i
                  className={cn(
                    "fi fi-rr-angle-small-down text-xs transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid overflow-hidden transition-all duration-200",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="min-h-0">
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-4 dark:border-slate-700">
                    {visibleChildren!.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
                            isActive
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                          )
                        }
                      >
                        <i className={`${child.icon} text-sm`} />
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0d1220] lg:block">
        {content}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-[#0d1220] lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {content}
      </aside>
    </>
  );
}

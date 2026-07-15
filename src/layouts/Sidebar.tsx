import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MENU, type MenuItem } from "../constants/menu";
import { AppBrand } from "../components/AppBrand";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function canSee(roles: string[] | undefined, role: string) {
  return !roles || roles.includes(role);
}

function hasVisibleContent(item: MenuItem, role: string): boolean {
  if (!canSee(item.roles, role)) return false;
  if (!item.children) return true;
  return item.children.some((child) => hasVisibleContent(child, role));
}

function findActiveTrail(
  items: MenuItem[],
  pathname: string,
  trail: string[] = [],
): string[] | null {
  for (const item of items) {
    const nextTrail = [...trail, item.label];
    if (item.to === pathname) return nextTrail;
    if (item.children) {
      const found = findActiveTrail(item.children, pathname, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

interface MenuNodeProps {
  item: MenuItem;
  path: string;
  depth: number;
  openGroups: Record<string, boolean>;
  toggleGroup: (path: string) => void;
  onCloseMobile: () => void;
  userRole: string;
}

function MenuNode({
  item,
  path,
  depth,
  openGroups,
  toggleGroup,
  onCloseMobile,
  userRole,
}: MenuNodeProps) {
  if (!hasVisibleContent(item, userRole)) return null;

  if (!item.children && item.to) {
    return (
      <NavLink
        to={item.to}
        end
        onClick={onCloseMobile}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all duration-200",
            depth > 0 ? "text-[13px]" : "gap-3 text-sm",
            isActive
              ? depth > 0
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                : "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
          )
        }
      >
        <i className={cn(item.icon, depth > 0 ? "text-sm" : "text-base")} />
        {item.label}
      </NavLink>
    );
  }

  const visibleChildren = item.children?.filter((c) =>
    hasVisibleContent(c, userRole),
  );
  const isOpen = !!openGroups[path];

  return (
    <div>
      <button
        onClick={() => toggleGroup(path)}
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
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-4 dark:border-slate-700">
            {visibleChildren!.map((child) => (
              <MenuNode
                key={child.label}
                item={child}
                path={`${path}/${child.label}`}
                depth={depth + 1}
                openGroups={openGroups}
                toggleGroup={toggleGroup}
                onCloseMobile={onCloseMobile}
                userRole={userRole}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const trail = findActiveTrail(MENU, location.pathname);
    if (!trail) return;
    const next: Record<string, boolean> = {};
    for (let i = 0; i < trail.length - 1; i++) {
      next[trail.slice(0, i + 1).join("/")] = true;
    }
    setOpenGroups(next);
  }, [location.pathname]);

  function toggleGroup(path: string) {
    const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : null;

    setOpenGroups((prev) => {
      const willOpen = !prev[path];
      const next: Record<string, boolean> = {};

      for (const key of Object.keys(prev)) {
        const keyParent = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : null;
        const isSameBranch =
          key === path || key.startsWith(`${path}/`) || path.startsWith(`${key}/`);
        const isSibling = keyParent === parent;
        if (isSameBranch || !isSibling) {
          next[key] = prev[key];
        }
      }

      if (willOpen) {
        next[path] = true;
      } else {
        delete next[path];
      }
      return next;
    });
  }

  if (!user) return null;

  const content = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <AppBrand compact />
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {MENU.map((item) => (
          <MenuNode
            key={item.label}
            item={item}
            path={item.label}
            depth={0}
            openGroups={openGroups}
            toggleGroup={toggleGroup}
            onCloseMobile={onCloseMobile}
            userRole={user.role}
          />
        ))}
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

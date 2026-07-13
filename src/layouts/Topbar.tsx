import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Dropdown, DropdownItem } from "../components/ui/Dropdown";
import { GlobalSearch } from "./GlobalSearch";

interface TopbarProps {
  onOpenMobile: () => void;
}

export function Topbar({ onOpenMobile }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0b0f19]/80 sm:px-6">
      <button
        onClick={onOpenMobile}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
      >
        <i className="fi fi-rr-menu-burger text-base" />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Ganti tema"
        >
          <i className={`fi ${theme === "dark" ? "fi-rr-sun" : "fi-rr-moon"} text-base`} />
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          <i className="fi fi-rr-bell text-base" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">
                {user?.name?.charAt(0)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-none text-slate-700 dark:text-slate-200">{user?.name}</p>
                <p className="mt-1 text-[11px] capitalize text-slate-400">{user?.role}</p>
              </div>
              <i className="fi fi-rr-angle-small-down text-xs text-slate-400" />
            </button>
          }
        >
          <div className="border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-400">@{user?.username}</p>
          </div>
          <DropdownItem icon="fi fi-rr-building" onClick={() => navigate("/pengaturan/profil")}>
            Profil Usaha
          </DropdownItem>
          <DropdownItem icon="fi fi-rr-palette" onClick={() => navigate("/pengaturan/tema")}>
            Tema & Data
          </DropdownItem>
          <DropdownItem icon="fi fi-rr-sign-out-alt" danger onClick={handleLogout}>
            Keluar
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}

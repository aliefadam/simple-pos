import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-400">
      <i className="fi fi-rr-home text-xs" />
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <i className="fi fi-rr-angle-small-right text-[10px]" />
          {item.to ? (
            <Link to={item.to} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

import { cn } from "../utils/cn";
import { getProductInitials } from "../utils/productInitials";

interface ProductAvatarProps {
  name: string;
  className?: string;
  textClassName?: string;
}

export function ProductAvatar({
  name,
  className,
  textClassName,
}: ProductAvatarProps) {
  return (
    <div
      aria-label={name}
      title={name}
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 via-indigo-100 to-sky-100 font-bold text-indigo-700 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/70 dark:text-indigo-200",
        className,
      )}
    >
      <span className={cn("select-none uppercase tracking-wide", textClassName)}>
        {getProductInitials(name)}
      </span>
    </div>
  );
}

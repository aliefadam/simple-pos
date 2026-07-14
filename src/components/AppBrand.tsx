interface AppBrandProps {
  compact?: boolean;
  subtitle?: string;
  title?: string;
  imageClassName?: string;
}

export function AppBrand({
  compact = false,
  subtitle = "Point of Sales",
  title = "Angkringan POS",
  imageClassName = "",
}: AppBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt={`${title} logo`}
        className={`rounded-2xl object-cover ${compact ? "h-10 w-10" : "h-12 w-12"} ${imageClassName}`.trim()}
      />
      <div>
        <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

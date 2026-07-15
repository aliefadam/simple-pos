import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "./Field";

export interface SelectDropdownOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectDropdownProps {
  options: SelectDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const PANEL_GAP = 8;
const ESTIMATED_PANEL_HEIGHT = 260;

export function SelectDropdown({
  options,
  value,
  onChange,
  searchable = false,
  placeholder = "Pilih salah satu",
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ditemukan",
  label,
  hint,
  error,
  required,
  disabled,
  className,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (searchable) {
      const t = setTimeout(() => searchRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp =
        spaceBelow < ESTIMATED_PANEL_HEIGHT && rect.top > spaceBelow;
      setCoords({
        top: openUp ? rect.top - PANEL_GAP : rect.bottom + PANEL_GAP,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  function toggleOpen() {
    if (disabled) return;
    setOpen((v) => !v);
  }

  function selectOption(option: SelectDropdownOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
    }
  }

  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <div className={cn("relative", className)} ref={containerRef} onKeyDown={onKeyDown}>
        <button
          type="button"
          onClick={toggleOpen}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100",
            error && "border-red-400",
          )}
        >
          <span className={cn("truncate", !selected && "text-slate-400")}>
            {selected ? selected.label : placeholder}
          </span>
          <i
            className={cn(
              "fi fi-rr-angle-small-down shrink-0 text-xs text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open &&
          coords &&
          createPortal(
            <div
              ref={panelRef}
              className="scale-in fixed z-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
              style={{
                left: coords.left,
                width: coords.width,
                ...(coords.openUp
                  ? { bottom: window.innerHeight - coords.top, top: "auto" }
                  : { top: coords.top }),
              }}
            >
              {searchable && (
                <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                  <div className="relative">
                    <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
              <div className="max-h-60 overflow-y-auto py-1.5">
                {filteredOptions.length === 0 ? (
                  <p className="px-3.5 py-3 text-center text-sm text-slate-400">
                    {emptyMessage}
                  </p>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => selectOption(option)}
                      disabled={option.disabled}
                      className={cn(
                        "flex w-full flex-col items-start px-3.5 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50",
                        option.value === value
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                      )}
                    >
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-slate-400">
                          {option.description}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    </FieldWrapper>
  );
}

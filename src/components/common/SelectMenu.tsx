import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface SelectMenuOption<T extends string> {
  value: T;
  label: string;
  detail?: string;
  tone?: "ok" | "warn" | "crit";
}

interface SelectMenuProps<T extends string> {
  label: string;
  value: T;
  options: SelectMenuOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  id?: string;
}

/** A select-only combobox whose popup uses the dashboard's own surfaces and colors. */
export function SelectMenu<T extends string>({ label, value, options, onChange, className = "", id }: SelectMenuProps<T>) {
  const generatedId = useId();
  const menuId = id ?? `select-menu-${generatedId.replace(/:/g, "")}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const selected = options[selectedIndex];

  useEffect(() => () => {
    if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open || !position) return;
    const popup = popupRef.current;
    const active = popup?.querySelector<HTMLElement>(`#${menuId}-option-${activeIndex}`);
    if (!popup || !active) return;
    if (active.offsetTop < popup.scrollTop) popup.scrollTop = active.offsetTop;
    else if (active.offsetTop + active.offsetHeight > popup.scrollTop + popup.clientHeight) {
      popup.scrollTop = active.offsetTop + active.offsetHeight - popup.clientHeight;
    }
  }, [activeIndex, menuId, open, position]);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(window.innerWidth - 16, Math.max(rect.width, 220));
      const left = Math.max(8, Math.min(window.innerWidth - width - 8,
        document.documentElement.dir === "rtl" ? rect.right - width : rect.left));
      const wantedHeight = Math.min(320, options.length * 56 + 12);
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const placeBelow = below >= Math.min(wantedHeight, 180) || below >= above;
      const maxHeight = Math.max(80, Math.min(320, placeBelow ? below : above));
      const top = placeBelow ? rect.bottom + 6 : rect.top - 6 - Math.min(wantedHeight, maxHeight);
      setPosition({ top, left, width, maxHeight });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node) && !popupRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!triggerRef.current?.contains(event.target as Node) && !popupRef.current?.contains(event.target as Node)) setOpen(false);
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open, options.length]);

  const show = (index = selectedIndex) => {
    setActiveIndex(index);
    setPosition(null);
    setOpen(true);
  };
  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!options.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!open) show((selectedIndex + direction + options.length) % options.length);
      else setActiveIndex(index => (index + direction + options.length) % options.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const index = event.key === "Home" ? 0 : options.length - 1;
      if (!open) show(index); else setActiveIndex(index);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(activeIndex); else show();
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Tab" && open) {
      setOpen(false);
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      typeaheadRef.current += event.key.toLocaleLowerCase();
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = setTimeout(() => { typeaheadRef.current = ""; }, 650);
      const match = options.findIndex(option => option.label.toLocaleLowerCase().startsWith(typeaheadRef.current));
      if (match >= 0) { event.preventDefault(); if (!open) show(match); else setActiveIndex(match); }
    }
  };

  return <>
    <button ref={triggerRef} type="button" id={menuId} role="combobox" aria-label={label}
      aria-expanded={open} aria-haspopup="listbox" aria-controls={open ? `${menuId}-list` : undefined}
      aria-activedescendant={open ? `${menuId}-option-${activeIndex}` : undefined}
      onClick={() => open ? setOpen(false) : show()} onKeyDown={onKeyDown}
      className={`select-menu-trigger flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-start text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}>
      <span className="flex min-w-0 items-center gap-2">
        {selected?.tone && <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${selected.tone === "ok" ? "bg-status-ok" : selected.tone === "warn" ? "bg-status-warn" : "bg-status-crit"}`} />}
        <span className="truncate">{selected?.label ?? "—"}</span>
      </span>
      <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && position && createPortal(
      <div ref={popupRef} id={`${menuId}-list`} role="listbox" aria-label={label}
        dir={document.documentElement.dir} className="select-menu-popup fixed z-[100] overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
        style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight }}>
        {options.map((option, index) => <div key={option.value} id={`${menuId}-option-${index}`}
          role="option" aria-selected={option.value === value}
          onPointerEnter={() => setActiveIndex(index)} onClick={() => choose(index)}
          className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ${index === activeIndex ? "bg-secondary text-foreground" : "text-popover-foreground"} ${option.value === value ? "font-semibold" : ""}`}>
          {option.tone && <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${option.tone === "ok" ? "bg-status-ok" : option.tone === "warn" ? "bg-status-warn" : "bg-status-crit"}`} />}
          <span className="min-w-0 flex-1"><span className="block leading-snug">{option.label}</span>{option.detail && <span className="block text-xs font-normal text-muted-foreground">{option.detail}</span>}</span>
          {option.value === value && <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />}
        </div>)}
      </div>, document.body)}
  </>;
}

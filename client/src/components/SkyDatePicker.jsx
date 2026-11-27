import { useState, useEffect, useRef, useMemo } from "react";
import { CalendarBlank, CaretLeft, CaretRight, CaretDown } from "@phosphor-icons/react";

const WEEKDAYS_MON_START = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_SUN_START = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toIsoDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIsoDate(iso) {
  if (!iso || typeof iso !== "string") return null;
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatEnglishDate(iso, shortFormat = false) {
  const dt = parseIsoDate(iso);
  if (!dt) return "";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mon = MONTH_NAMES_SHORT[dt.getMonth()];
  const yyyy = dt.getFullYear();
  if (shortFormat) {
    return `${mon} ${dt.getDate()}, ${yyyy}`;
  }
  const dayName = SHORT_DAY_NAMES[dt.getDay()];
  return `${dayName}, ${dd} ${mon} ${yyyy}`;
}

function buildMonthCells(year, month, sunStart = false) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = sunStart ? firstDay.getDay() : (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day);
    cells.push({
      day,
      iso: toIsoDate(dt),
      isSunday: dt.getDay() === 0,
    });
  }
  return cells;
}

export default function SkyDatePicker({
  value,
  onChange,
  min,
  placeholder = "Select date",
  align = "left",
  dualMonth = false,
  shortFormat = false,
  hideCaret = false,
  onOpenRequest,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef(null);

  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const tomorrowIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toIsoDate(d);
  }, []);

  const effectiveMin = min || todayIso;

  const initialView = useMemo(() => {
    const dt = parseIsoDate(value) || parseIsoDate(effectiveMin) || new Date();
    return { year: dt.getFullYear(), month: dt.getMonth() };
  }, [value, effectiveMin]);

  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  useEffect(() => {
    if (isOpen) {
      const dt = parseIsoDate(value) || parseIsoDate(effectiveMin) || new Date();
      setViewYear(dt.getFullYear());
      setViewMonth(dt.getMonth());
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUp(spaceBelow < 380 && spaceAbove > 360);
      }
    }
  }, [isOpen, value, effectiveMin]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const secondMonthInfo = useMemo(() => {
    if (viewMonth === 11) return { year: viewYear + 1, month: 0 };
    return { year: viewYear, month: viewMonth + 1 };
  }, [viewYear, viewMonth]);

  const primaryCells = useMemo(
    () => buildMonthCells(viewYear, viewMonth, dualMonth),
    [viewYear, viewMonth, dualMonth]
  );

  const secondaryCells = useMemo(
    () => (dualMonth ? buildMonthCells(secondMonthInfo.year, secondMonthInfo.month, true) : []),
    [dualMonth, secondMonthInfo]
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (iso) => {
    if (effectiveMin && iso < effectiveMin) return;
    onChange(iso);
    setIsOpen(false);
  };

  const displayLabel = formatEnglishDate(value, shortFormat);

  const renderMonthGrid = (cells, sunStart) => {
    const weekdays = sunStart ? WEEKDAYS_SUN_START : WEEKDAYS_MON_START;
    return (
      <>
        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
          {weekdays.map((wd) => (
            <span
              key={wd}
              className="py-1 text-[11px] font-bold"
              style={{ color: wd === "Sun" ? "#dc2626" : "#64748b" }}
            >
              {wd}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-10" />;
            }

            const isDisabled = Boolean(effectiveMin && cell.iso < effectiveMin);
            const isSelected = value === cell.iso;
            const isToday = cell.iso === todayIso;

            return (
              <button
                key={cell.iso}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelectDate(cell.iso)}
                className="relative flex h-10 w-full flex-col items-center justify-center text-xs font-extrabold transition hover:bg-sky-50"
                style={
                  isSelected
                    ? {
                        background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                        color: "#ffffff",
                        borderRadius: 9999,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(14, 165, 233, 0.38)",
                        cursor: "pointer",
                      }
                    : isDisabled
                    ? {
                        background: "transparent",
                        color: "#cbd5e1",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "not-allowed",
                      }
                    : isToday
                    ? {
                        background: "#eff6ff",
                        color: "#0b4fd0",
                        borderRadius: 9999,
                        border: "1.5px solid #0ea5e9",
                        cursor: "pointer",
                      }
                    : {
                        background: "transparent",
                        color: cell.isSunday ? "#dc2626" : "#0f172a",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                      }
                }
              >
                {isToday && !isSelected && (
                  <span
                    className="font-bold leading-none text-[#0284c7]"
                    style={{ fontSize: 8, marginBottom: 1 }}
                  >
                    Today
                  </span>
                )}
                <span>{cell.day}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (!isOpen && onOpenRequest) onOpenRequest();
          setIsOpen((prev) => !prev);
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-2 bg-transparent text-left outline-none"
        style={{ border: "none", padding: 0 }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <CalendarBlank
            size={18}
            weight="duotone"
            className="shrink-0"
            style={{ color: displayLabel ? "#091e47" : "#64748b" }}
          />
          <span
            className="truncate font-bold"
            style={{ fontSize: 13.5, color: displayLabel ? "#091e47" : "#64748b" }}
          >
            {displayLabel || placeholder}
          </span>
        </div>
        {!hideCaret && (
          <CaretDown
            size={13}
            weight="bold"
            className="shrink-0 transition-transform"
            style={{
              color: "#0b57d0",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        )}
      </button>

      {/* Calendar Popup (Dual-Month Traveloka Style or Single-Month Compact) */}
      {isOpen && (
        <div
          className={`absolute z-[95] bg-white p-4 sm:p-5 ${
            openUp ? "bottom-[calc(100%+14px)]" : "top-[calc(100%+14px)]"
          } ${align === "right" ? "right-0" : "left-0"}`}
          style={{
            width: dualMonth ? "min(610px, calc(100vw - 32px))" : 308,
            borderRadius: 22,
            border: "1px solid #dbe7fb",
            boxShadow: "0 22px 54px -10px rgba(13, 62, 145, 0.25)",
          }}
        >
          {dualMonth ? (
            <>
              {/* Dual-Month Header */}
              <div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f4f8ff] text-[#0b5ed7] transition hover:bg-blue-100"
                    style={{ borderRadius: 9999, border: "1px solid #dbe7fb" }}
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  <span className="text-sm font-black tracking-tight text-[#091e47]">
                    {MONTH_NAMES_FULL[viewMonth]} {viewYear}
                  </span>
                  <span className="w-8" />
                </div>

                <div className="hidden items-center justify-between sm:flex">
                  <span className="w-8" />
                  <span className="text-sm font-black tracking-tight text-[#091e47]">
                    {MONTH_NAMES_FULL[secondMonthInfo.month]} {secondMonthInfo.year}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f4f8ff] text-[#0b5ed7] transition hover:bg-blue-100"
                    style={{ borderRadius: 9999, border: "1px solid #dbe7fb" }}
                  >
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Dual-Month Grids */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>{renderMonthGrid(primaryCells, true)}</div>
                <div className="hidden border-l border-slate-100 pl-6 sm:block">
                  {renderMonthGrid(secondaryCells, true)}
                </div>
              </div>

              {/* Footer Legend matching mockup */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Lowest flight price available</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={effectiveMin > todayIso}
                    onClick={() => handleSelectDate(todayIso)}
                    className="cursor-pointer px-3 py-1 text-[11px] font-extrabold text-[#0b5ed7] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ borderRadius: 9999, background: "#f0f7ff", border: "none" }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-700"
                    style={{ border: "none", background: "transparent" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Single-Month Header */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f0f6ff] text-[#0b4fd0] transition hover:bg-blue-100"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                >
                  <CaretLeft size={15} weight="bold" />
                </button>

                <span className="text-sm font-black tracking-tight text-[#091e47]">
                  {MONTH_NAMES_FULL[viewMonth]} {viewYear}
                </span>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f0f6ff] text-[#0b4fd0] transition hover:bg-blue-100"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                >
                  <CaretRight size={15} weight="bold" />
                </button>
              </div>

              {renderMonthGrid(primaryCells, false)}

              {/* Footer Quick Pickers */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={effectiveMin > todayIso}
                    onClick={() => handleSelectDate(todayIso)}
                    className="cursor-pointer px-2.5 py-1 text-[11px] font-extrabold text-[#0b4fd0] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ borderRadius: 9999, background: "#f0f6ff", border: "none" }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    disabled={effectiveMin > tomorrowIso}
                    onClick={() => handleSelectDate(tomorrowIso)}
                    className="cursor-pointer px-2.5 py-1 text-[11px] font-extrabold text-[#0b4fd0] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ borderRadius: 9999, background: "#f0f6ff", border: "none" }}
                  >
                    Tomorrow
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer px-2 py-1 text-[11px] font-bold text-slate-400 transition hover:text-slate-700"
                  style={{ border: "none", background: "transparent" }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

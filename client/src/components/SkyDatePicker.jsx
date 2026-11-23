import { useState, useEffect, useRef, useMemo } from "react";
import { CalendarBlank, CaretLeft, CaretRight, CaretDown } from "@phosphor-icons/react";

const WEEKDAYS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const SHORT_DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

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

function formatVietnameseDate(iso) {
  const dt = parseIsoDate(iso);
  if (!dt) return "";
  const dayName = SHORT_DAY_NAMES[dt.getDay()];
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dayName}, ${dd}/${mm}/${yyyy}`;
}

export default function SkyDatePicker({
  value,
  onChange,
  min,
  placeholder = "Chọn ngày",
  align = "left",
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

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Convert JS Sunday=0..Saturday=6 into Monday=0..Sunday=6
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(viewYear, viewMonth, day);
      cells.push({
        day,
        iso: toIsoDate(dt),
        isSunday: dt.getDay() === 0,
      });
    }
    return cells;
  }, [viewYear, viewMonth]);

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

  const displayLabel = formatVietnameseDate(value);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 bg-transparent text-left outline-none"
        style={{ border: "none", padding: 0 }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <CalendarBlank
            size={18}
            weight="duotone"
            className="shrink-0"
            style={{ color: "#0b57d0" }}
          />
          <span
            className="truncate font-extrabold"
            style={{ fontSize: 14, color: displayLabel ? "#091e47" : "#94a3b8" }}
          >
            {displayLabel || placeholder}
          </span>
        </div>
        <CaretDown
          size={13}
          weight="bold"
          className="shrink-0 transition-transform"
          style={{
            color: "#0b57d0",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Vietnamese 5-Star Calendar Popup */}
      {isOpen && (
        <div
          className={`absolute z-50 w-[308px] bg-white p-4 ${
            openUp ? "bottom-[calc(100%+14px)]" : "top-[calc(100%+14px)]"
          } ${align === "right" ? "right-0" : "left-0"}`}
          style={{
            borderRadius: 24,
            border: "1px solid #cde2fd",
            boxShadow: "0 22px 54px -10px rgba(13, 62, 145, 0.28)",
          }}
        >
          {/* Header: Month / Year + Nav Buttons */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Tháng trước"
              className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f0f6ff] text-[#0b4fd0] transition hover:bg-blue-100"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
            >
              <CaretLeft size={15} weight="bold" />
            </button>

            <span className="text-sm font-black tracking-tight text-[#091e47]">
              Tháng {viewMonth + 1}, {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Tháng sau"
              className="flex h-8 w-8 cursor-pointer items-center justify-center bg-[#f0f6ff] text-[#0b4fd0] transition hover:bg-blue-100"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
            >
              <CaretRight size={15} weight="bold" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS_VI.map((wd, idx) => (
              <span
                key={wd}
                className="py-1 text-[11px] font-black"
                style={{ color: idx === 6 ? "#dc2626" : "#476494" }}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-9" />;
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
                  className="relative flex h-9 w-full flex-col items-center justify-center text-xs font-extrabold transition"
                  style={
                    isSelected
                      ? {
                          background: "linear-gradient(135deg, #0b5ed7 0%, #1d75f2 100%)",
                          color: "#ffffff",
                          borderRadius: 12,
                          border: "none",
                          boxShadow: "0 6px 14px rgba(13, 97, 225, 0.35)",
                          cursor: "pointer",
                        }
                      : isDisabled
                      ? {
                          background: "transparent",
                          color: "#cbd5e1",
                          borderRadius: 12,
                          border: "none",
                          cursor: "not-allowed",
                        }
                      : isToday
                      ? {
                          background: "#eff6ff",
                          color: "#0b4fd0",
                          borderRadius: 12,
                          border: "1.5px solid #0b5ed7",
                          cursor: "pointer",
                        }
                      : {
                          background: "transparent",
                          color: cell.isSunday ? "#dc2626" : "#0f172a",
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                        }
                  }
                >
                  <span>{cell.day}</span>
                  {isToday && !isSelected && (
                    <span
                      className="absolute bottom-1 h-1 w-1"
                      style={{ background: "#0b5ed7", borderRadius: 9999 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Pickers */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={effectiveMin > todayIso}
                onClick={() => handleSelectDate(todayIso)}
                className="cursor-pointer bg-[#f0f6ff] text-[11px] font-extrabold text-[#0b4fd0] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", padding: "6px 12px", whiteSpace: "nowrap" }}
              >
                Hôm nay
              </button>
              <button
                type="button"
                disabled={effectiveMin > tomorrowIso}
                onClick={() => handleSelectDate(tomorrowIso)}
                className="cursor-pointer bg-[#f0f6ff] text-[11px] font-extrabold text-[#0b4fd0] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", padding: "6px 12px", whiteSpace: "nowrap" }}
              >
                Ngày mai
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer bg-transparent px-2 py-1 text-[11px] font-extrabold text-slate-500 hover:text-slate-800"
              style={{ border: "none" }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

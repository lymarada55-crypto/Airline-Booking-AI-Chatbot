import { useEffect, useMemo, useRef, useState } from "react";
import {
  AirplaneLanding,
  AirplaneTakeoff,
  AirplaneTilt,
  CaretDown,
  CheckCircle,
} from "@phosphor-icons/react";

const POPULAR_ORDER = [
  "SGN", "HAN", "PQC", "DLI", "DAD", "CXR", "HUI", "HPH", "VCA", "UIH",
  "SIN", "PNH", "KUL", "ICN", "NRT", "PEK", "PVG", "CAN", "SZX",
];

const ENGLISH_AIRPORT_META = {
  SGN: { name: "Tan Son Nhat Intl", location: "Ho Chi Minh City, Vietnam", shortCity: "Ho Chi Minh City" },
  HAN: { name: "Noibai International Airport", location: "Hanoi, Vietnam", shortCity: "Hanoi" },
  PQC: { name: "Phu Quoc International Airport", location: "Phu Quoc, Vietnam", shortCity: "Phu Quoc" },
  DLI: { name: "Lien Khuong International Airport", location: "Da Lat, Vietnam", shortCity: "Da Lat" },
  DAD: { name: "Da Nang Airport", location: "Da Nang, Vietnam", shortCity: "Da Nang" },
  CXR: { name: "Cam Ranh International Airport", location: "Nha Trang, Vietnam", shortCity: "Nha Trang" },
  HUI: { name: "Phu Bai International Airport", location: "Hue, Vietnam", shortCity: "Hue" },
  HPH: { name: "Cat Bi International Airport", location: "Hai Phong, Vietnam", shortCity: "Hai Phong" },
  VCA: { name: "Can Tho International Airport", location: "Can Tho, Vietnam", shortCity: "Can Tho" },
  UIH: { name: "Phu Cat Airport", location: "Quy Nhon, Vietnam", shortCity: "Quy Nhon" },
  SIN: { name: "Changi International Airport", location: "Singapore", shortCity: "Singapore" },
  PNH: { name: "Phnom Penh International Airport", location: "Phnom Penh, Cambodia", shortCity: "Phnom Penh" },
  KUL: { name: "Kuala Lumpur International Airport", location: "Kuala Lumpur, Malaysia", shortCity: "Kuala Lumpur" },
  ICN: { name: "Incheon International Airport", location: "Seoul, South Korea", shortCity: "Seoul" },
  NRT: { name: "Narita International Airport", location: "Tokyo, Japan", shortCity: "Tokyo" },
  PEK: { name: "Beijing Capital International Airport", location: "Beijing, China", shortCity: "Beijing" },
  PVG: { name: "Shanghai Pudong International Airport", location: "Shanghai, China", shortCity: "Shanghai" },
  CAN: { name: "Guangzhou Baiyun International Airport", location: "Guangzhou, China", shortCity: "Guangzhou" },
  SZX: { name: "Shenzhen Bao'an International Airport", location: "Shenzhen, China", shortCity: "Shenzhen" },
};

function getEnglishAirport(ap) {
  const code = String(ap?.code || "").toUpperCase();
  const mapped = ENGLISH_AIRPORT_META[code];
  if (mapped) {
    return { code, ...mapped };
  }
  const fallbackCity = String(ap?.city || code).replace(/\s*\(.*?\)/g, "").trim();
  return {
    code,
    name: ap?.name || `${fallbackCity} Airport`,
    location: ap?.city || "Vietnam",
    shortCity: fallbackCity,
  };
}

export default function SkyAirportPicker({
  label = "Điểm đi",
  placeholder = "Chọn điểm đi",
  value = "",
  onChange,
  airports = [],
  disabledCode = "",
  variant = "departure",
  allowClear = false,
  compact = false,
  richCompact = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const list = useMemo(() => {
    const raw = Array.isArray(airports) ? [...airports] : [];
    return raw.sort((a, b) => {
      const ia = POPULAR_ORDER.indexOf(String(a.code || "").toUpperCase());
      const ib = POPULAR_ORDER.indexOf(String(b.code || "").toUpperCase());
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }, [airports]);

  const selectedAirport = useMemo(() => {
    const found = list.find(
      (a) => String(a.code).toUpperCase() === String(value).toUpperCase()
    );
    return found ? getEnglishAirport(found) : null;
  }, [list, value]);

  const TriggerIcon = variant === "arrival" ? AirplaneLanding : AirplaneTakeoff;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full cursor-pointer text-left transition-all"
        style={
          richCompact
            ? {
                background: "#ffffff",
                border: open ? "1.5px solid #0284c7" : "1px solid #d5e2f2",
                borderRadius: 12,
                padding: "0 14px",
                height: 54,
                display: "flex",
                alignItems: "center",
                boxShadow: open ? "0 0 0 3px rgba(2, 132, 199, 0.14)" : "none",
              }
            : compact
            ? {
                background: "#ffffff",
                border: open ? "1.5px solid #1d75f2" : "1px solid #d5e2f2",
                borderRadius: 12,
                padding: "0 14px",
                height: 44,
                display: "flex",
                alignItems: "center",
                boxShadow: open ? "0 0 0 3px rgba(29, 117, 242, 0.14)" : "none",
              }
            : {
                background: open ? "#ffffff" : "#f7faff",
                border: open ? "1.5px solid #1d75f2" : "1px solid #dbe7fb",
                borderRadius: 16,
                padding: "10px 13px",
                boxShadow: open ? "0 0 0 3px rgba(29, 117, 242, 0.14)" : "none",
              }
        }
        aria-expanded={open}
        aria-label={label}
      >
        {!compact && !richCompact && (
          <span
            className="block font-bold uppercase tracking-wider text-slate-400"
            style={{ fontSize: 10.5, marginBottom: 3 }}
          >
            {label}
          </span>
        )}
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <TriggerIcon
              size={richCompact ? 20 : compact ? 18 : 17}
              weight="duotone"
              className={selectedAirport ? "shrink-0 text-slate-700" : "shrink-0 text-slate-400"}
            />
            {selectedAirport ? (
              richCompact ? (
                <div className="min-w-0 leading-tight">
                  <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 13.5 }}>
                    {selectedAirport.shortCity} ({selectedAirport.code})
                  </div>
                  <div className="truncate font-medium text-slate-400" style={{ fontSize: 11, marginTop: 1 }}>
                    {selectedAirport.airportName}
                  </div>
                </div>
              ) : (
                <span
                  className="truncate font-bold text-[#091e47]"
                  style={{ fontSize: 13.5 }}
                >
                  {selectedAirport.shortCity} ({selectedAirport.code})
                </span>
              )
            ) : (
              <span className="truncate font-semibold text-slate-400" style={{ fontSize: 13 }}>
                {placeholder}
              </span>
            )}
          </div>
          {!compact && !richCompact && (
            <CaretDown
              size={14}
              weight="bold"
              className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180 text-blue-600" : ""}`}
            />
          )}
        </div>
      </button>

      {/* Clean Minimalist Dropdown matching mockup 1:1 */}
      {open && (
        <div
          className="absolute left-0 top-full z-[90] mt-2 overflow-hidden bg-white"
          style={{
            width: "min(410px, calc(100vw - 32px))",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 18px 46px rgba(15, 23, 42, 0.16)",
          }}
        >
          {/* Header: Popular Cities or Airports */}
          <div
            className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5"
            style={{ background: "#ffffff" }}
          >
            <span className="font-semibold text-slate-600" style={{ fontSize: 14 }}>
              Popular Cities or Airports
            </span>
            {allowClear && value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="cursor-pointer bg-transparent font-bold text-blue-600 hover:underline"
                style={{ border: "none", fontSize: 12 }}
              >
                All
              </button>
            )}
          </div>

          {/* Scrollable Airport List */}
          <div style={{ maxHeight: 370, overflowY: "auto" }}>
            {list.map((ap) => {
              const info = getEnglishAirport(ap);
              const isSelected = info.code === String(value).toUpperCase();
              const isDisabled =
                disabledCode && info.code === String(disabledCode).toUpperCase();

              return (
                <button
                  key={ap.id || info.code}
                  type="button"
                  disabled={Boolean(isDisabled)}
                  onClick={() => {
                    onChange(info.code);
                    setOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-4 border-b border-slate-100 px-5 py-3.5 text-left transition last:border-b-0 disabled:cursor-not-allowed disabled:opacity-45"
                  style={{
                    background: isSelected ? "#f2f8ff" : "#ffffff",
                    borderLeft: "none",
                    borderRight: "none",
                    borderTop: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) e.currentTarget.style.background = "#f4f9ff";
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !isSelected) e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <AirplaneTilt
                    size={19}
                    weight="fill"
                    className={isSelected ? "shrink-0 text-blue-600" : "shrink-0 text-slate-900"}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="truncate font-bold text-slate-900"
                        style={{ fontSize: 14 }}
                      >
                        {info.name}
                      </span>
                      <span
                        className="shrink-0 font-bold text-slate-500"
                        style={{ fontSize: 13.5 }}
                      >
                        {info.code}
                      </span>
                    </div>
                    <div
                      className="mt-0.5 truncate font-medium text-slate-500"
                      style={{ fontSize: 12.5 }}
                    >
                      {info.location}
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle size={18} weight="fill" className="shrink-0 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

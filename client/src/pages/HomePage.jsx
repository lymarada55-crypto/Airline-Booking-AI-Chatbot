import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import {
  AirplaneTakeoff,
  Armchair,
  CaretDown,
  CaretLeft,
  CaretRight,
  DoorOpen,
  MagnifyingGlass,
  MapPinLine,
  Minus,
  Plus,
  CalendarBlank,
  ArrowsLeftRight,
  Users,
  User,
  PaperPlaneTilt,
  ArrowRight,
  CheckCircle,
  Tag,
  Headset,
  ShieldCheck,
  ArrowsClockwise,
  Buildings,
  Compass,
  Car,
  AirplaneInFlight,
  WarningCircle,
  X,
  Ticket,
  Crown,
  ForkKnife,
  QrCode,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkyDatePicker from "../components/SkyDatePicker";
import SkyAirportPicker from "../components/SkyAirportPicker";

const TOP_DESTINATIONS = [
  // ─── 10 ĐIỂM ĐẾN NỘI ĐỊA VIỆT NAM ───
  {
    city: "Hà Nội",
    code: "HAN",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Thủ đô nghìn năm",
    price: "850.000đ",
    image:
      "https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "TP. Hồ Chí Minh",
    code: "SGN",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Thành phố năng động",
    price: "850.000đ",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Đà Nẵng",
    code: "DAD",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Điểm đến Hot",
    price: "550.000đ",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Phú Quốc",
    code: "PQC",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Đảo ngọc nghỉ dưỡng",
    price: "590.000đ",
    image:
      "https://images.unsplash.com/photo-1516815231560-8f41ec531527?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Đà Lạt",
    code: "DLI",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: true,
    badge: "Thành phố ngàn hoa",
    price: "550.000đ",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Nha Trang",
    code: "CXR",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Thiên đường biển ngọc",
    price: "650.000đ",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Huế",
    code: "HUI",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Cố đô di sản",
    price: "550.000đ",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Hải Phòng",
    code: "HPH",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Cửa ngõ Vịnh Lan Hạ",
    price: "850.000đ",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Cần Thơ",
    code: "VCA",
    from: "HAN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Thủ phủ Miền Tây",
    price: "850.000đ",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
  },
  {
    city: "Quy Nhơn",
    code: "UIH",
    from: "SGN",
    country: "Việt Nam",
    region: "domestic",
    featured: false,
    badge: "Kỳ Co – Eo Gió",
    price: "590.000đ",
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000&auto=format&fit=crop",
  },
  // ─── 9 ĐIỂM ĐẾN QUỐC TẾ (ĐNA, ĐBA & TRUNG QUỐC) ───
  {
    city: "Singapore",
    code: "SIN",
    from: "SGN",
    country: "Singapore",
    region: "international",
    featured: true,
    badge: "Quốc đảo sư tử",
    price: "2.150.000đ",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Seoul",
    code: "ICN",
    from: "HAN",
    country: "Hàn Quốc",
    region: "international",
    featured: true,
    badge: "Xứ sở Kim Chi",
    price: "4.650.000đ",
    image:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Tokyo",
    code: "NRT",
    from: "SGN",
    country: "Nhật Bản",
    region: "international",
    featured: true,
    badge: "Xứ sở Hoa Anh Đào",
    price: "5.450.000đ",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Thượng Hải",
    code: "PVG",
    from: "HAN",
    country: "Trung Quốc",
    region: "international",
    featured: true,
    badge: "Bến Thượng Hải",
    price: "3.840.000đ",
    image:
      "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Bắc Kinh",
    code: "PEK",
    from: "HAN",
    country: "Trung Quốc",
    region: "international",
    featured: false,
    badge: "Vạn Lý Trường Thành",
    price: "4.150.000đ",
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Quảng Châu",
    code: "CAN",
    from: "SGN",
    country: "Trung Quốc",
    region: "international",
    featured: false,
    badge: "Thủ phủ thương mại",
    price: "2.650.000đ",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Thâm Quyến",
    code: "SZX",
    from: "SGN",
    country: "Trung Quốc",
    region: "international",
    featured: false,
    badge: "Thung lũng công nghệ",
    price: "2.750.000đ",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Kuala Lumpur",
    code: "KUL",
    from: "SGN",
    country: "Malaysia",
    region: "international",
    featured: false,
    badge: "Tháp đôi Petronas",
    price: "2.190.000đ",
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=85",
  },
  {
    city: "Phnom Penh",
    code: "PNH",
    from: "SGN",
    country: "Campuchia",
    region: "international",
    featured: false,
    badge: "Đường bay ngắn 55 phút",
    price: "1.750.000đ",
    image:
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1000&q=85",
  },
];

const SERVICE_CITY_META = [
  { dbKey: "Đà Lạt", en: "Da Lat", region: "Lam Dong, Vietnam", count: "1,939" },
  { dbKey: "Nha Trang", en: "Nha Trang", region: "Khanh Hoa, Vietnam", count: "1,481" },
  { dbKey: "Đà Nẵng", en: "Da Nang", region: "Da Nang, Vietnam", count: "2,145" },
  { dbKey: "Phú Quốc", en: "Phu Quoc", region: "Kien Giang, Vietnam", count: "1,264" },
  { dbKey: "Hồ Chí Minh", en: "Ho Chi Minh City", region: "Ho Chi Minh, Vietnam", count: "4,820" },
  { dbKey: "Hà Nội", en: "Hanoi", region: "Hanoi, Vietnam", count: "3,650" },
  { dbKey: "Kuala Lumpur (Malaysia)", en: "Kuala Lumpur", region: "Malaysia", count: "6,636" },
  { dbKey: "Singapore", en: "Singapore", region: "Singapore", count: "2,490" },
  { dbKey: "Tokyo (Nhật Bản)", en: "Tokyo", region: "Japan", count: "5,310" },
  { dbKey: "Seoul (Hàn Quốc)", en: "Seoul", region: "South Korea", count: "4,120" },
  { dbKey: "Huế", en: "Hue", region: "Thua Thien Hue, Vietnam", count: "684" },
  { dbKey: "Hải Phòng", en: "Hai Phong", region: "Hai Phong, Vietnam", count: "520" },
  { dbKey: "Cần Thơ", en: "Can Tho", region: "Can Tho, Vietnam", count: "415" },
  { dbKey: "Quy Nhơn", en: "Quy Nhon", region: "Binh Dinh, Vietnam", count: "590" },
  { dbKey: "Hội An", en: "Hoi An", region: "Quang Nam, Vietnam", count: "845" },
  { dbKey: "Phnom Penh (Campuchia)", en: "Phnom Penh", region: "Cambodia", count: "1,180" },
  { dbKey: "Bắc Kinh (Trung Quốc)", en: "Beijing", region: "China", count: "3,940" },
  { dbKey: "Thượng Hải (Trung Quốc)", en: "Shanghai", region: "China", count: "4,470" },
  { dbKey: "Quảng Châu (Trung Quốc)", en: "Guangzhou", region: "China", count: "3,210" },
  { dbKey: "Thâm Quyến (Trung Quốc)", en: "Shenzhen", region: "China", count: "2,890" },
];

function normalizeSearchStr(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function getEnglishCityMeta(rawCity) {
  const norm = normalizeSearchStr(rawCity).replace(/^tp\.?\s*/i, "").trim();
  const found = SERVICE_CITY_META.find((m) => {
    const k = normalizeSearchStr(m.dbKey);
    const e = normalizeSearchStr(m.en);
    return k === norm || e === norm || norm.includes(k) || norm.includes(e) || k.includes(norm);
  });
  if (found) return found;
  return {
    dbKey: rawCity,
    en: rawCity,
    region: "Vietnam",
    count: "320",
  };
}

function ServiceCityPicker({
  icon: Icon,
  value,
  options,
  placeholder,
  onChange,
  unitLabel = "hotels nearby",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [typedText, setTypedText] = useState("");

  const displayItems = useMemo(() => {
    const sourceList =
      Array.isArray(options) && options.length > 0
        ? options.map((city) => {
            const meta = getEnglishCityMeta(city);
            return { ...meta, dbValue: city };
          })
        : SERVICE_CITY_META.map((m) => ({ ...m, dbValue: m.dbKey }));

    // Deduplicate by English name and sort by SERVICE_CITY_META popularity order
    const seen = new Set();
    const unique = [];
    for (const item of sourceList) {
      if (seen.has(item.en)) continue;
      seen.add(item.en);
      unique.push(item);
    }
    return unique.sort((a, b) => {
      const ia = SERVICE_CITY_META.findIndex((m) => m.en === a.en);
      const ib = SERVICE_CITY_META.findIndex((m) => m.en === b.en);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }, [options]);

  const selectedMeta = useMemo(() => {
    if (!value) return null;
    return displayItems.find((i) => i.dbValue === value) || getEnglishCityMeta(value);
  }, [displayItems, value]);

  const inputValue = isOpen ? typedText : selectedMeta ? selectedMeta.en : value;
  const normalizedQuery = normalizeSearchStr(typedText.trim());

  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return displayItems;
    return displayItems.filter((item) =>
      normalizeSearchStr(`${item.en} ${item.region} ${item.dbValue}`).includes(normalizedQuery)
    );
  }, [displayItems, normalizedQuery]);

  const selectItem = (item) => {
    onChange(item.dbValue);
    setTypedText(item.en);
    setIsOpen(false);
  };

  const handleNearMe = () => {
    const hcm = displayItems.find((i) => i.en === "Ho Chi Minh City") || displayItems[0];
    if (hcm) selectItem(hcm);
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <Icon size={17} className="shrink-0 text-slate-500" />
        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400"
          style={{ fontSize: 13 }}
          value={inputValue}
          onFocus={() => {
            setTypedText(selectedMeta ? selectedMeta.en : value || "");
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onChange={(event) => {
            setTypedText(event.target.value);
            onChange(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 140)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && filteredOptions.length > 0) {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex((index) => (index + 1) % filteredOptions.length);
            } else if (event.key === "ArrowUp" && filteredOptions.length > 0) {
              event.preventDefault();
              setActiveIndex((index) => (index <= 0 ? filteredOptions.length - 1 : index - 1));
            } else if (event.key === "Enter" && isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
              event.preventDefault();
              selectItem(filteredOptions[activeIndex]);
            } else if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+14px)] z-[90] overflow-hidden bg-white"
          style={{
            width: "min(450px, calc(100vw - 32px))",
            borderRadius: 18,
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
          }}
        >
          {/* Near Me Button Card matching mockup */}
          <div className="p-3.5 pb-2">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleNearMe}
              className="flex w-full cursor-pointer items-center gap-2.5 bg-white px-4 py-3 text-left transition hover:bg-[#f4f9ff]"
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#0284c7]">
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2.2" fill="currentColor" />
                <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-extrabold text-[#0284c7]" style={{ fontSize: 14 }}>
                Near me
              </span>
            </button>
          </div>

          {/* Popular Destination Heading */}
          <div className="px-4 pt-2 pb-2">
            <span className="font-black text-[#0f172a]" style={{ fontSize: 16 }}>
              Popular Destination
            </span>
          </div>

          {/* Scrollable Destinations List */}
          <div style={{ maxHeight: 330, overflowY: "auto" }}>
            {filteredOptions.map((item, index) => {
              const isSelected = value === item.dbValue;
              return (
                <button
                  key={item.en}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectItem(item)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0"
                  style={{
                    background:
                      isSelected || activeIndex === index ? "#f4f9ff" : "#ffffff",
                    borderLeft: "none",
                    borderRight: "none",
                    borderTop: "none",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-[#0f172a]" style={{ fontSize: 14.5 }}>
                      {item.en}
                    </div>
                    <div className="mt-0.5 truncate font-medium text-slate-500" style={{ fontSize: 12.5 }}>
                      {item.region}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className="inline-block px-3 py-0.5 font-bold"
                      style={{
                        borderRadius: 9999,
                        background: "#eff6ff",
                        color: "#0284c7",
                        fontSize: 11.5,
                      }}
                    >
                      City
                    </span>
                    <div className="mt-1 font-medium text-slate-500" style={{ fontSize: 11.5 }}>
                      {item.count} {unitLabel}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <p className="px-4 py-6 text-center text-xs font-semibold text-slate-500">
                No matching destinations found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const HOTEL_MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HOTEL_MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const HOTEL_DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseHotelIso(iso) {
  if (!iso) return null;
  const parts = String(iso).split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function toHotelIso(dt) {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function formatHotelShortDay(iso) {
  const dt = parseHotelIso(iso);
  if (!dt) return "";
  return `${HOTEL_DAY_SHORT[dt.getDay()]}, ${String(dt.getDate()).padStart(2, "0")} ${HOTEL_MONTH_SHORT[dt.getMonth()]}`;
}

function buildHotelMonthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay.getDay();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    cells.push({ day: d, iso: toHotelIso(dt), isSunday: dt.getDay() === 0 });
  }
  return cells;
}

function HotelDateRangePicker({
  startDate,
  endDate,
  minDate,
  onChange,
  unitSingular = "night",
  unitPlural = "nights",
  startPrompt = "Select Check-in date",
  endPrompt = "Select Check-out date",
}) {
  const [open, setOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const wrapRef = useRef(null);

  const initialDt = parseHotelIso(startDate) || new Date();
  const [viewYear, setViewYear] = useState(initialDt.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDt.getMonth());

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSelectingEnd(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSelectingEnd(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const secondMonth = viewMonth === 11 ? { year: viewYear + 1, month: 0 } : { year: viewYear, month: viewMonth + 1 };
  const cells1 = useMemo(() => buildHotelMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);
  const cells2 = useMemo(() => buildHotelMonthCells(secondMonth.year, secondMonth.month), [secondMonth.year, secondMonth.month]);

  const nights = useMemo(() => {
    const d1 = parseHotelIso(startDate);
    const d2 = parseHotelIso(endDate);
    if (!d1 || !d2) return 1;
    return Math.max(1, Math.round((d2 - d1) / 86400000));
  }, [startDate, endDate]);

  const handleDayClick = (iso) => {
    if (minDate && iso < minDate) return;
    if (!selectingEnd || iso <= startDate) {
      const nextDay = parseHotelIso(iso);
      nextDay.setDate(nextDay.getDate() + 1);
      onChange(iso, toHotelIso(nextDay));
      setSelectingEnd(true);
    } else {
      onChange(startDate, iso);
      setSelectingEnd(false);
      setOpen(false);
    }
  };

  const renderGrid = (cells) => (
    <>
      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
        {HOTEL_DAY_SHORT.map((wd) => (
          <span key={wd} className="py-1 text-[11px] font-bold" style={{ color: wd === "Sun" ? "#dc2626" : "#64748b" }}>
            {wd}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`e-${idx}`} className="h-9" />;
          const disabled = Boolean(minDate && cell.iso < minDate);
          const isStart = cell.iso === startDate;
          const isEnd = cell.iso === endDate;
          const inRange = startDate && endDate && cell.iso > startDate && cell.iso < endDate;

          return (
            <button
              key={cell.iso}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(cell.iso)}
              className="flex h-9 w-full items-center justify-center text-xs font-extrabold transition"
              style={
                isStart || isEnd
                  ? {
                      background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                      color: "#ffffff",
                      borderRadius: 9999,
                      border: "none",
                      cursor: "pointer",
                    }
                  : inRange
                  ? {
                      background: "#e0f2fe",
                      color: "#0264c8",
                      borderRadius: 0,
                      border: "none",
                      cursor: "pointer",
                    }
                  : disabled
                  ? { background: "transparent", color: "#cbd5e1", border: "none", cursor: "not-allowed" }
                  : {
                      background: "transparent",
                      color: cell.isSunday ? "#dc2626" : "#0f172a",
                      borderRadius: 9999,
                      border: "none",
                      cursor: "pointer",
                    }
              }
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-2.5 bg-white px-3.5 text-left transition"
        style={{
          height: 54,
          borderRadius: 12,
          border: open ? "1.5px solid #0284c7" : "1px solid #d5e2f2",
          boxShadow: open ? "0 0 0 3px rgba(2, 132, 199, 0.14)" : "none",
        }}
      >
        <CalendarBlank size={19} weight="duotone" className="shrink-0 text-[#091e47]" />
        <span className="truncate font-bold text-[#091e47]" style={{ fontSize: 13.5 }}>
          {formatHotelShortDay(startDate)} - {formatHotelShortDay(endDate)} ({nights}{" "}
          {nights > 1 ? unitPlural : unitSingular})
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 bottom-[calc(100%+12px)] z-[95] bg-white p-5 shadow-2xl"
          style={{
            width: "min(600px, calc(100vw - 32px))",
            borderRadius: 20,
            border: "1px solid #dbe7fb",
          }}
        >
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs font-bold text-slate-600">
            <span>
              {selectingEnd ? endPrompt : startPrompt}
            </span>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 font-extrabold text-[#0284c7]">
              {nights} {nights > 1 ? unitPlural : unitSingular}
            </span>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else {
                    setViewMonth((m) => m - 1);
                  }
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#f4f8ff] text-[#0b5ed7]"
                style={{ border: "1px solid #dbe7fb" }}
              >
                <CaretLeft size={13} weight="bold" />
              </button>
              <span className="text-sm font-black text-[#091e47]">
                {HOTEL_MONTH_FULL[viewMonth]} {viewYear}
              </span>
              <span className="w-7" />
            </div>

            <div className="hidden items-center justify-between sm:flex">
              <span className="w-7" />
              <span className="text-sm font-black text-[#091e47]">
                {HOTEL_MONTH_FULL[secondMonth.month]} {secondMonth.year}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else {
                    setViewMonth((m) => m + 1);
                  }
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#f4f8ff] text-[#0b5ed7]"
                style={{ border: "1px solid #dbe7fb" }}
              >
                <CaretRight size={13} weight="bold" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>{renderGrid(cells1)}</div>
            <div className="hidden border-l border-slate-100 pl-6 sm:block">{renderGrid(cells2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const dateAfterDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => { });
    }
  }, []);

  const [airports, setAirports] = useState([]);
  const [activeTab, setActiveTab] = useState("flights");
  const [destFilter, setDestFilter] = useState("featured"); // "featured" | "domestic" | "international"
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [serviceSearch, setServiceSearch] = useState({
    hotel: { q: "", start_date: dateAfterDays(1), end_date: dateAfterDays(2) },
    experience: { q: "", start_date: dateAfterDays(1) },
    car: { q: "", start_date: dateAfterDays(1), end_date: dateAfterDays(2) },
  });
  const [serviceSuggestions, setServiceSuggestions] = useState({});

  const [searchData, setSearchData] = useState({
    departure: "",
    arrival: "",
    date: dateAfterDays(1),
    returnDate: dateAfterDays(3),
    tripType: "one-way",
    flightClass: "economy",
    passengers: { adults: 1, children: 0 }
  });
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showCabinDropdown, setShowCabinDropdown] = useState(false);
  const [hotelGuests, setHotelGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [showHotelGuestsDropdown, setShowHotelGuestsDropdown] = useState(false);
  const [expGuests, setExpGuests] = useState({ adults: 2, children: 0 });
  const [showExpGuestsDropdown, setShowExpGuestsDropdown] = useState(false);
  const [carOptions, setCarOptions] = useState({ cars: 1, passengers: 2 });
  const [showCarOptionsDropdown, setShowCarOptionsDropdown] = useState(false);
  const [directOnly, setDirectOnly] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleUpdatePassengers = (type, change) => {
    setSearchData(prev => {
      const total = prev.passengers.adults + prev.passengers.children;
      if (change > 0 && total >= 9) return prev;
      const current = prev.passengers[type];
      const next = Math.max(0, current + change);
      if (type === "adults" && next < 1) return prev;
      return {
        ...prev,
        passengers: {
          ...prev.passengers,
          [type]: next
        }
      };
    });
  };

  const handleSwap = () => {
    setSearchError("");
    setSearchData(prev => ({
      ...prev,
      departure: prev.arrival,
      arrival: prev.departure
    }));
  };

  const handleBookDestination = (fromCode, toCode) => {
    const departDate = searchData.date || dateAfterDays(1);
    localStorage.setItem(
      "search_params",
      JSON.stringify({
        departure: fromCode,
        arrival: toCode,
        date: departDate,
        returnDate: "",
        tripType: "one-way",
        flightClass: searchData.flightClass || "economy",
        passengers: searchData.passengers || { adults: 1, children: 0 },
      })
    );
    navigate("/flights");
  };

  useEffect(() => {
    axios.get("/api/airports")
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        setAirports(list);
      })
      .catch(err => {
        console.error("Failed to load airports:", err);
        setAirports([]);
      });
  }, []);

  useEffect(() => {
    setSearchError("");
    if (activeTab === "flights") return;

    const type = activeTab === "hotels" ? "hotel" : activeTab === "experiences" ? "experience" : "car";
    axios.get(`/api/travel-services/${type}`, { params: { per_page: 200 } })
      .then(({ data }) => {
        const products = data.data?.data || [];
        const suggestions = [...new Set(products.map((product) => product.city).filter(Boolean))];
        setServiceSuggestions((previous) => ({ ...previous, [type]: suggestions }));
      })
      .catch((error) => {
        console.error(`Failed to load ${type} suggestions:`, error);
        setServiceSuggestions((previous) => ({ ...previous, [type]: [] }));
      });
  }, [activeTab]);

  const handleSearch = () => {
    setSearchError("");
    if (activeTab !== "flights") {
      const type = activeTab === "hotels" ? "hotel" : activeTab === "experiences" ? "experience" : "car";
      const search = serviceSearch[type];

      if (!search.start_date) {
        setSearchError("Vui lòng chọn ngày bắt đầu.");
        return;
      }
      if (type !== "experience" && (!search.end_date || search.end_date <= search.start_date)) {
        setSearchError("Ngày trả phải sau ngày bắt đầu.");
        return;
      }

      const params = new URLSearchParams({
        ...search,
        guests:
          type === "hotel"
            ? String(hotelGuests.adults + hotelGuests.children)
            : type === "experience"
              ? String(expGuests.adults + expGuests.children)
              : String(carOptions.passengers),
        ...(type === "hotel" ? { rooms: String(hotelGuests.rooms) } : {}),
        ...(type === "car" ? { rooms: String(carOptions.cars) } : {}),
      });
      navigate(`/travel/${type}?${params.toString()}`);
      return;
    }

    if (!searchData.departure || !searchData.arrival) {
      setSearchError("Vui lòng chọn đầy đủ điểm đi và điểm đến.");
      return;
    }
    if (searchData.departure === searchData.arrival) {
      setSearchError("Điểm đi và điểm đến không được trùng nhau. Vui lòng chọn lại.");
      return;
    }
    if (!searchData.date) {
      setSearchError("Vui lòng chọn ngày đi.");
      return;
    }
    if (searchData.date < today) {
      setSearchError("Ngày đi không thể ở trong quá khứ.");
      return;
    }
    if (searchData.tripType === "round-trip" && !searchData.returnDate) {
      setSearchError("Vui lòng chọn ngày về cho chuyến khứ hồi.");
      return;
    }
    if (searchData.tripType === "round-trip" && searchData.returnDate < searchData.date) {
      setSearchError("Ngày về phải sau hoặc cùng ngày với ngày đi.");
      return;
    }
    localStorage.setItem("search_params", JSON.stringify(searchData));
    navigate("/flights");
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[100dvh] bg-[#f8fafc] text-slate-900 font-sans font-medium selection:bg-blue-600 selection:text-white"
    >
      {/* 1. TOP NAVIGATION */}
      <Navbar />

      {/* 2. HERO SECTION matching Genesis Model (Image 2) */}
      <section className="relative pt-16 flex flex-col items-center w-full">
        {/* Background Image / Video Area with Sunset Terminal Scenery */}
        <div
          className="w-full h-[50vh] md:h-[58vh] overflow-hidden relative bg-cover bg-center bg-slate-900"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop')" }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>

          {/* Golden Sunset Ambient Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-black/40"></div>

          {/* Hero Typography */}
          <div className="absolute top-[19%] left-1/2 -translate-x-1/2 text-center text-white z-10 w-full max-w-4xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white/95 text-[11px] font-extrabold uppercase tracking-[0.18em] mb-3 border border-white/25 shadow-md"
            >
              <PaperPlaneTilt size={13} weight="fill" className="text-sky-300" />
              HÀNH TRÌNH 5 SAO BẮT ĐẦU TỪ ĐÂY <ArrowRight size={11} weight="bold" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-black text-4xl md:text-6xl tracking-tight leading-none mb-2.5 drop-shadow-2xl text-white font-sans"
            >
              SkyLink Airlines
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-slate-100 font-medium max-w-xl mx-auto drop-shadow-md tracking-wide"
            >
              Trải nghiệm bay đẳng cấp, kết nối mọi điểm đến Việt Nam &amp; quốc tế
            </motion.p>
          </div>
        </div>

        {/* 3. FLOATING SEARCH ENGINE CARD */}
        <div className="relative z-20 w-full max-w-6xl px-4 -mt-20 md:-mt-28 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.4 }}
            className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-[0_25px_70px_-15px_rgba(13,62,145,0.20)] border border-blue-100/90"
          >
            {/* Inline Validation Error Banner */}
            {searchError && (
              <div
                role="alert"
                className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700"
              >
                <div className="flex items-center gap-2">
                  <WarningCircle size={18} weight="fill" className="shrink-0 text-red-500" />
                  <span>{searchError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchError("")}
                  className="cursor-pointer rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-700"
                  aria-label="Đóng thông báo lỗi"
                >
                  <X size={15} weight="bold" />
                </button>
              </div>
            )}

            {/* Top Service Category Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
                <button
                  type="button"
                  onClick={() => setActiveTab("flights")}
                  className={`flex items-center gap-2 pb-2 -mb-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === "flights"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent hover:text-slate-800"
                  }`}
                  style={{ background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none" }}
                >
                  <AirplaneTakeoff size={18} weight="bold" />
                  <span>Flights · Chuyến bay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("hotels")}
                  className={`flex items-center gap-2 pb-2 -mb-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === "hotels"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent hover:text-slate-800"
                  }`}
                  style={{ background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none" }}
                >
                  <Buildings size={18} />
                  <span>Hotels · Khách sạn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("experiences")}
                  className={`flex items-center gap-2 pb-2 -mb-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === "experiences"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent hover:text-slate-800"
                  }`}
                  style={{ background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none" }}
                >
                  <Compass size={18} />
                  <span>Experiences</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("cars")}
                  className={`flex items-center gap-2 pb-2 -mb-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === "cars"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent hover:text-slate-800"
                  }`}
                  style={{ background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none" }}
                >
                  <Car size={18} />
                  <span>Car Rental</span>
                </button>
              </div>
            </div>

            {/* FLIGHTS SEARCH FORM — Traveloka 1-Row Style matching Mockup */}
            {activeTab === "flights" && (
              <div>
                {/* Row 1: One-way / Round-trip Pills (left) + Direct only / 1 Adult / Economy (right) */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  {/* Trip Type Pills */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchError("");
                        setSearchData((prev) => ({ ...prev, tripType: "one-way" }));
                      }}
                      className="cursor-pointer px-4 py-1.5 text-xs font-extrabold transition"
                      style={
                        searchData.tripType === "one-way"
                          ? {
                              background: "#d6eeff",
                              color: "#0264c8",
                              borderRadius: 9999,
                              border: "none",
                            }
                          : {
                              background: "#f1f5f9",
                              color: "#475569",
                              borderRadius: 9999,
                              border: "none",
                            }
                      }
                    >
                      One-way
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchError("");
                        setSearchData((prev) => ({
                          ...prev,
                          tripType: "round-trip",
                          returnDate:
                            prev.returnDate && prev.returnDate >= (prev.date || today)
                              ? prev.returnDate
                              : dateAfterDays(3),
                        }));
                      }}
                      className="cursor-pointer px-4 py-1.5 text-xs font-extrabold transition"
                      style={
                        searchData.tripType === "round-trip"
                          ? {
                              background: "#d6eeff",
                              color: "#0264c8",
                              borderRadius: 9999,
                              border: "none",
                            }
                          : {
                              background: "#f1f5f9",
                              color: "#475569",
                              borderRadius: 9999,
                              border: "none",
                            }
                      }
                    >
                      Round-trip
                    </button>
                  </div>

                  {/* Right Inline Controls: Direct only + 1 Adult + Economy */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#091e47]">
                    <label
                      className="cursor-pointer gap-2 select-none"
                      style={{ display: "inline-flex", alignItems: "center", marginBottom: 0 }}
                    >
                      <input
                        type="checkbox"
                        checked={directOnly}
                        onChange={(e) => setDirectOnly(e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-blue-300 accent-[#0284c7]"
                      />
                      <span className="font-bold text-[#091e47]">Direct only</span>
                    </label>

                    {/* Passengers Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCabinDropdown(false);
                          setShowPassengerDropdown((v) => !v);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 bg-transparent font-bold text-[#091e47] transition hover:text-[#0284c7]"
                        style={{ border: "none", padding: "4px 2px", fontSize: 12.5 }}
                      >
                        <Users size={16} weight="duotone" className="text-[#0284c7]" />
                        <span>
                          {searchData.passengers.adults + searchData.passengers.children}{" "}
                          {searchData.passengers.adults + searchData.passengers.children > 1
                            ? "Passengers"
                            : "Adult"}
                        </span>
                        <CaretDown size={13} weight="bold" className="text-[#0284c7]" />
                      </button>

                      {showPassengerDropdown && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowPassengerDropdown(false)} />
                          <div
                            className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 bg-white p-4 shadow-2xl"
                            style={{ borderRadius: 18, border: "1px solid #dbe7fb" }}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-extrabold text-slate-900">Adults · Người lớn</div>
                                  <div className="text-[11px] text-slate-400">Age 12+</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePassengers("adults", -1)}
                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 font-bold text-slate-600 hover:border-blue-400"
                                  >
                                    -
                                  </button>
                                  <span className="w-4 text-center text-sm font-black text-slate-900">
                                    {searchData.passengers.adults}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePassengers("adults", 1)}
                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 font-bold text-slate-600 hover:border-blue-400"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-extrabold text-slate-900">Children · Trẻ em</div>
                                  <div className="text-[11px] text-slate-400">Age 2 – 11</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePassengers("children", -1)}
                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 font-bold text-slate-600 hover:border-blue-400"
                                  >
                                    -
                                  </button>
                                  <span className="w-4 text-center text-sm font-black text-slate-900">
                                    {searchData.passengers.children}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePassengers("children", 1)}
                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 font-bold text-slate-600 hover:border-blue-400"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-semibold text-slate-400">
                                <span>Max 9 passengers</span>
                                <button
                                  type="button"
                                  onClick={() => setShowPassengerDropdown(false)}
                                  className="cursor-pointer bg-transparent font-extrabold text-[#0284c7] hover:underline"
                                  style={{ border: "none" }}
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Cabin Class Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPassengerDropdown(false);
                          setShowCabinDropdown((v) => !v);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 bg-transparent font-bold text-[#091e47] transition hover:text-[#0284c7]"
                        style={{ border: "none", padding: "4px 2px", fontSize: 12.5 }}
                      >
                        <Armchair size={16} weight="duotone" className="text-[#0284c7]" />
                        <span>{searchData.flightClass === "business" ? "Business" : "Economy"}</span>
                        <CaretDown size={13} weight="bold" className="text-[#0284c7]" />
                      </button>

                      {showCabinDropdown && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowCabinDropdown(false)} />
                          <div
                            className="absolute right-0 top-[calc(100%+8px)] z-40 w-44 overflow-hidden bg-white p-1.5 shadow-xl"
                            style={{ borderRadius: 14, border: "1px solid #dbe7fb" }}
                          >
                            {[
                              { id: "economy", label: "Economy · Phổ thông" },
                              { id: "business", label: "Business · Thương gia" },
                            ].map((c) => {
                              const active = searchData.flightClass === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSearchData((prev) => ({ ...prev, flightClass: c.id }));
                                    setShowCabinDropdown(false);
                                  }}
                                  className="block w-full cursor-pointer rounded-xl px-3 py-2 text-left text-xs font-extrabold transition"
                                  style={{
                                    border: "none",
                                    background: active ? "#eff6ff" : "transparent",
                                    color: active ? "#0264c8" : "#334155",
                                  }}
                                >
                                  {c.label}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Unified Single-Row 54px-Tall Search Bar matching Mockup */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                  {/* From + Swap + To Group */}
                  <div className="relative flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <span
                        className="mb-1 block font-bold text-[#091e47]"
                        style={{ fontSize: 12 }}
                      >
                        From
                      </span>
                      <SkyAirportPicker
                        label="From"
                        placeholder="Origin city / airport"
                        variant="departure"
                        richCompact
                        airports={airports}
                        value={searchData.departure}
                        disabledCode={searchData.arrival}
                        onChange={(code) => {
                          setSearchError("");
                          setSearchData((prev) => ({ ...prev, departure: code }));
                        }}
                      />
                    </div>

                    {/* Overlapping Soft Sky Swap Button */}
                    <div className="z-10 -my-3.5 flex justify-center sm:-mx-4 sm:my-0 sm:pb-[10px]">
                      <button
                        type="button"
                        onClick={handleSwap}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center shadow-xs transition hover:rotate-180 hover:bg-sky-200"
                        style={{
                          borderRadius: 9999,
                          background: "#e0f2fe",
                          color: "#0284c7",
                          border: "2px solid #ffffff",
                        }}
                        title="Swap origin & destination"
                      >
                        <ArrowsLeftRight size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span
                        className="mb-1 block font-bold text-[#091e47]"
                        style={{ fontSize: 12 }}
                      >
                        To
                      </span>
                      <SkyAirportPicker
                        label="To"
                        placeholder="Destination city / airport"
                        variant="arrival"
                        richCompact
                        airports={airports}
                        value={searchData.arrival}
                        disabledCode={searchData.departure}
                        onChange={(code) => {
                          setSearchError("");
                          setSearchData((prev) => ({ ...prev, arrival: code }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Departure Date Box (54px) */}
                  <div className="w-full lg:w-[175px] shrink-0">
                    <span
                      className="mb-1 block font-bold text-[#091e47]"
                      style={{ fontSize: 12 }}
                    >
                      Departure
                    </span>
                    <div
                      className="flex items-center px-3.5 transition hover:border-sky-400"
                      style={{
                        height: 54,
                        borderRadius: 12,
                        background: "#ffffff",
                        border: "1px solid #d5e2f2",
                      }}
                    >
                      <SkyDatePicker
                        value={searchData.date}
                        min={today}
                        align="right"
                        dualMonth
                        shortFormat
                        hideCaret
                        placeholder="Departure date"
                        onChange={(nextDate) => {
                          setSearchError("");
                          setSearchData((prev) => ({
                            ...prev,
                            date: nextDate,
                            returnDate:
                              prev.returnDate && prev.returnDate < nextDate
                                ? nextDate
                                : prev.returnDate,
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Return Date Box (54px, tinted in One-way, active white in Round-trip) */}
                  <div className="w-full lg:w-[190px] shrink-0">
                    <span
                      className="mb-1 block font-bold text-[#091e47]"
                      style={{ fontSize: 12 }}
                    >
                      Return
                    </span>
                    <div
                      className="flex items-center justify-between gap-1 px-3.5 transition hover:border-sky-400"
                      style={{
                        height: 54,
                        borderRadius: 12,
                        background: searchData.tripType === "round-trip" ? "#ffffff" : "#f1f5f9",
                        border: "1px solid #d5e2f2",
                      }}
                    >
                      <SkyDatePicker
                        value={searchData.tripType === "round-trip" ? searchData.returnDate : ""}
                        min={searchData.date || today}
                        align="right"
                        dualMonth
                        shortFormat
                        hideCaret
                        placeholder="Select return date"
                        onOpenRequest={() => {
                          if (searchData.tripType !== "round-trip") {
                            setSearchData((prev) => ({
                              ...prev,
                              tripType: "round-trip",
                              returnDate:
                                prev.returnDate && prev.returnDate >= (prev.date || today)
                                  ? prev.returnDate
                                  : dateAfterDays(3),
                            }));
                          }
                        }}
                        onChange={(nextReturn) => {
                          setSearchError("");
                          setSearchData((prev) => ({
                            ...prev,
                            tripType: "round-trip",
                            returnDate: nextReturn,
                          }));
                        }}
                      />
                      {searchData.tripType === "round-trip" && (
                        <button
                          type="button"
                          onClick={() =>
                            setSearchData((prev) => ({ ...prev, tripType: "one-way" }))
                          }
                          aria-label="Clear return date"
                          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sky-100 text-[#0284c7] transition hover:bg-sky-200"
                          style={{ border: "none", padding: 0 }}
                        >
                          <X size={11} weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search Flights Pill CTA (54px) */}
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full shrink-0 cursor-pointer font-extrabold text-white shadow-md transition hover:brightness-105 lg:w-auto"
                    style={{
                      height: 54,
                      padding: "0 28px",
                      borderRadius: 9999,
                      border: "none",
                      background: "linear-gradient(90deg, #0ea5e9 0%, #1d75f2 100%)",
                      boxShadow: "0 8px 20px rgba(2, 132, 199, 0.30)",
                      fontSize: 14,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Search Flights
                  </button>
                </div>

                {/* Row 3: Bottom Inspiration Strip matching Mockup */}
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
                  <Compass size={16} weight="duotone" className="text-slate-600" />
                  <span>Need travel inspiration?</span>
                  <button
                    type="button"
                    onClick={() => navigate("/promotions")}
                    className="inline-flex cursor-pointer items-center gap-1 bg-transparent font-extrabold text-[#0284c7] hover:underline"
                    style={{ border: "none", padding: 0, fontSize: 12 }}
                  >
                    <span>Discover flight ideas</span>
                    <ArrowRight size={13} weight="bold" />
                  </button>
                </div>
              </div>
            )}

            {/* HOTELS SEARCH FORM — Traveloka 1-Row Style matching Mockup */}
            {activeTab === "hotels" && (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                {/* Col 1: City, destination, or hotel name */}
                <div className="min-w-0 flex-1">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    City, destination, or hotel name
                  </span>
                  <div
                    className="flex items-center bg-white px-3.5 transition hover:border-sky-400"
                    style={{
                      height: 54,
                      borderRadius: 12,
                      border: "1px solid #d5e2f2",
                    }}
                  >
                    <ServiceCityPicker
                      icon={MapPinLine}
                      value={serviceSearch.hotel.q}
                      options={serviceSuggestions.hotel || []}
                      placeholder="City, hotel, place to go"
                      unitLabel="hotels nearby"
                      onChange={(value) =>
                        setServiceSearch((prev) => ({
                          ...prev,
                          hotel: { ...prev.hotel, q: value },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Col 2: Check-in & Check-out Dates (Combined Range Picker) */}
                <div className="w-full shrink-0 lg:w-[295px]">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    Check-in &amp; Check-out Dates
                  </span>
                  <HotelDateRangePicker
                    startDate={serviceSearch.hotel.start_date}
                    endDate={serviceSearch.hotel.end_date}
                    minDate={today}
                    onChange={(nextStart, nextEnd) =>
                      setServiceSearch((prev) => ({
                        ...prev,
                        hotel: { ...prev.hotel, start_date: nextStart, end_date: nextEnd },
                      }))
                    }
                  />
                </div>

                {/* Col 3: Guests and Rooms Picker matching Mockup */}
                <div className="relative w-full shrink-0 lg:w-[270px]">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    Guests and Rooms
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHotelGuestsDropdown((v) => !v)}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 bg-white px-3.5 text-left transition hover:border-sky-400"
                    style={{
                      height: 54,
                      borderRadius: 12,
                      border: showHotelGuestsDropdown ? "1.5px solid #0284c7" : "1px solid #d5e2f2",
                      boxShadow: showHotelGuestsDropdown ? "0 0 0 3px rgba(2, 132, 199, 0.14)" : "none",
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Users size={19} weight="duotone" className="shrink-0 text-[#091e47]" />
                      <span className="truncate font-bold text-[#091e47]" style={{ fontSize: 13 }}>
                        {hotelGuests.adults} {hotelGuests.adults > 1 ? "adults" : "adult"},{" "}
                        {hotelGuests.children} {hotelGuests.children === 1 ? "child" : "children"},{" "}
                        {hotelGuests.rooms} {hotelGuests.rooms > 1 ? "rooms" : "room"}
                      </span>
                    </div>
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition"
                      style={
                        showHotelGuestsDropdown
                          ? {
                              background: "#eff6ff",
                              border: "1.5px solid #22c55e",
                              color: "#0284c7",
                            }
                          : {
                              background: "#f1f5f9",
                              color: "#64748b",
                            }
                      }
                    >
                      <CaretDown
                        size={12}
                        weight="bold"
                        style={{
                          transform: showHotelGuestsDropdown ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.15s",
                        }}
                      />
                    </span>
                  </button>

                  {showHotelGuestsDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowHotelGuestsDropdown(false)}
                      />
                      <div
                        className="absolute right-0 bottom-[calc(100%+10px)] z-40 w-[325px] bg-white p-4 shadow-2xl"
                        style={{ borderRadius: 18, border: "1px solid #dbe7fb" }}
                      >
                        <div className="space-y-4">
                          {/* Adult Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <User size={20} weight="duotone" className="text-[#091e47]" />
                              <span className="text-sm font-extrabold text-[#091e47]">Adult</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setHotelGuests((p) => ({ ...p, adults: Math.max(1, p.adults - 1) }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-5 text-center text-sm font-black text-[#091e47]">
                                {hotelGuests.adults}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setHotelGuests((p) => ({ ...p, adults: Math.min(12, p.adults + 1) }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Children Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Users size={20} weight="duotone" className="text-[#091e47]" />
                              <div>
                                <div className="text-sm font-extrabold leading-tight text-[#091e47]">
                                  Children
                                </div>
                                <div className="text-[11px] font-medium text-slate-400">
                                  Maximum 17 years old
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setHotelGuests((p) => ({
                                    ...p,
                                    children: Math.max(0, p.children - 1),
                                  }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-5 text-center text-sm font-black text-[#091e47]">
                                {hotelGuests.children}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setHotelGuests((p) => ({
                                    ...p,
                                    children: Math.min(8, p.children + 1),
                                  }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Room Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <DoorOpen size={20} weight="duotone" className="text-[#091e47]" />
                              <span className="text-sm font-extrabold text-[#091e47]">Room</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setHotelGuests((p) => ({ ...p, rooms: Math.max(1, p.rooms - 1) }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-5 text-center text-sm font-black text-[#091e47]">
                                {hotelGuests.rooms}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setHotelGuests((p) => ({ ...p, rooms: Math.min(8, p.rooms + 1) }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Done Pill CTA */}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setShowHotelGuestsDropdown(false)}
                              className="cursor-pointer px-6 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105"
                              style={{
                                background: "linear-gradient(90deg, #0ea5e9 0%, #1d75f2 100%)",
                                borderRadius: 9999,
                                border: "none",
                              }}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Col 4: Search Pill CTA (54px) */}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 font-extrabold text-white shadow-md transition hover:brightness-105 lg:w-auto"
                  style={{
                    height: 54,
                    padding: "0 28px",
                    borderRadius: 9999,
                    border: "none",
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d75f2 100%)",
                    boxShadow: "0 8px 20px rgba(2, 132, 199, 0.30)",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>Search</span>
                  <MagnifyingGlass size={17} weight="bold" />
                </button>
              </div>
            )}

            {/* EXPERIENCES SEARCH FORM — Traveloka 1-Row Style matching Hotels */}
            {activeTab === "experiences" && (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                {/* Col 1: Destination, tour, or activity */}
                <div className="min-w-0 flex-1">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    Destination, tour, or activity
                  </span>
                  <div
                    className="flex items-center bg-white px-3.5 transition hover:border-sky-400"
                    style={{
                      height: 54,
                      borderRadius: 12,
                      border: "1px solid #d5e2f2",
                    }}
                  >
                    <ServiceCityPicker
                      icon={Compass}
                      value={serviceSearch.experience.q}
                      options={serviceSuggestions.experience || []}
                      placeholder="City, experience, place to go"
                      unitLabel="tours nearby"
                      onChange={(value) =>
                        setServiceSearch((prev) => ({
                          ...prev,
                          experience: { ...prev.experience, q: value },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Col 2: Activity Date (54px) */}
                <div className="w-full shrink-0 lg:w-[235px]">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    Activity Date
                  </span>
                  <div
                    className="flex items-center bg-white px-3.5 transition hover:border-sky-400"
                    style={{
                      height: 54,
                      borderRadius: 12,
                      border: "1px solid #d5e2f2",
                    }}
                  >
                    <SkyDatePicker
                      value={serviceSearch.experience.start_date}
                      min={today}
                      align="right"
                      dualMonth
                      shortFormat
                      hideCaret
                      placeholder="Select date"
                      onChange={(val) =>
                        setServiceSearch((prev) => ({
                          ...prev,
                          experience: { ...prev.experience, start_date: val },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Col 3: Travelers Picker matching Hotels */}
                <div className="relative w-full shrink-0 lg:w-[250px]">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    Travelers
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowExpGuestsDropdown((v) => !v)}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 bg-white px-3.5 text-left transition hover:border-sky-400"
                    style={{
                      height: 54,
                      borderRadius: 12,
                      border: showExpGuestsDropdown ? "1.5px solid #0284c7" : "1px solid #d5e2f2",
                      boxShadow: showExpGuestsDropdown ? "0 0 0 3px rgba(2, 132, 199, 0.14)" : "none",
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Users size={19} weight="duotone" className="shrink-0 text-[#091e47]" />
                      <span className="truncate font-bold text-[#091e47]" style={{ fontSize: 13 }}>
                        {expGuests.adults} {expGuests.adults > 1 ? "adults" : "adult"},{" "}
                        {expGuests.children} {expGuests.children === 1 ? "child" : "children"}
                      </span>
                    </div>
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition"
                      style={
                        showExpGuestsDropdown
                          ? {
                              background: "#eff6ff",
                              border: "1.5px solid #22c55e",
                              color: "#0284c7",
                            }
                          : {
                              background: "#f1f5f9",
                              color: "#64748b",
                            }
                      }
                    >
                      <CaretDown
                        size={12}
                        weight="bold"
                        style={{
                          transform: showExpGuestsDropdown ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.15s",
                        }}
                      />
                    </span>
                  </button>

                  {showExpGuestsDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowExpGuestsDropdown(false)}
                      />
                      <div
                        className="absolute right-0 bottom-[calc(100%+10px)] z-40 w-[310px] bg-white p-4 shadow-2xl"
                        style={{ borderRadius: 18, border: "1px solid #dbe7fb" }}
                      >
                        <div className="flex flex-col gap-4">
                          {/* Adult Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <User size={20} weight="duotone" className="text-[#091e47]" />
                              <span className="text-sm font-extrabold text-[#091e47]">Adult</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpGuests((p) => ({ ...p, adults: Math.max(1, p.adults - 1) }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-5 text-center text-sm font-black text-[#091e47]">
                                {expGuests.adults}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpGuests((p) => ({ ...p, adults: Math.min(12, p.adults + 1) }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Children Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Users size={20} weight="duotone" className="text-[#091e47]" />
                              <div>
                                <div className="text-sm font-extrabold leading-tight text-[#091e47]">
                                  Children
                                </div>
                                <div className="text-[11px] font-medium text-slate-400">
                                  Maximum 17 years old
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpGuests((p) => ({
                                    ...p,
                                    children: Math.max(0, p.children - 1),
                                  }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-5 text-center text-sm font-black text-[#091e47]">
                                {expGuests.children}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpGuests((p) => ({
                                    ...p,
                                    children: Math.min(8, p.children + 1),
                                  }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Done Pill CTA */}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setShowExpGuestsDropdown(false)}
                              className="cursor-pointer px-6 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105"
                              style={{
                                background: "linear-gradient(90deg, #0ea5e9 0%, #1d75f2 100%)",
                                borderRadius: 9999,
                                border: "none",
                              }}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Col 4: Search Pill CTA (54px) */}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 font-extrabold text-white shadow-md transition hover:brightness-105 lg:w-auto"
                  style={{
                    height: 54,
                    padding: "0 28px",
                    borderRadius: 9999,
                    border: "none",
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d75f2 100%)",
                    boxShadow: "0 8px 20px rgba(2, 132, 199, 0.30)",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>Search</span>
                  <MagnifyingGlass size={17} weight="bold" />
                </button>
              </div>
            )}

            {/* CAR RENTAL SEARCH FORM — Traveloka 1-Row Style matching Hotels */}
            {activeTab === "cars" && (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                {/* Col 1: Pick-up city or airport */}
                <div className="min-w-0 flex-1">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    Pick-up city or airport
                  </span>
                  <div
                    className="flex items-center bg-white px-3.5 transition hover:border-sky-400"
                    style={{
                      height: 54,
                      borderRadius: 12,
                      border: "1px solid #d5e2f2",
                    }}
                  >
                    <ServiceCityPicker
                      icon={Car}
                      value={serviceSearch.car.q}
                      options={serviceSuggestions.car || []}
                      placeholder="City, airport, pickup location"
                      unitLabel="cars nearby"
                      onChange={(value) =>
                        setServiceSearch((prev) => ({
                          ...prev,
                          car: { ...prev.car, q: value },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Col 2: Pick-up & Drop-off Dates (Combined Range Picker) */}
                <div className="w-full shrink-0 lg:w-[295px]">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    Pick-up &amp; Drop-off Dates
                  </span>
                  <HotelDateRangePicker
                    startDate={serviceSearch.car.start_date}
                    endDate={serviceSearch.car.end_date}
                    minDate={today}
                    unitSingular="day"
                    unitPlural="days"
                    startPrompt="Select Pick-up date"
                    endPrompt="Select Drop-off date"
                    onChange={(nextStart, nextEnd) =>
                      setServiceSearch((prev) => ({
                        ...prev,
                        car: { ...prev.car, start_date: nextStart, end_date: nextEnd },
                      }))
                    }
                  />
                </div>

                {/* Col 3: Cars and Passengers Picker */}
                <div className="relative w-full shrink-0 lg:w-[250px]">
                  <span className="mb-1.5 block font-bold text-[#091e47]" style={{ fontSize: 12 }}>
                    Cars &amp; Passengers
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCarOptionsDropdown((v) => !v)}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 bg-white px-3.5 text-left transition hover:border-sky-400"
                    style={{
                      height: 54,
                      borderRadius: 12,
                      border: showCarOptionsDropdown ? "1.5px solid #0284c7" : "1px solid #d5e2f2",
                      boxShadow: showCarOptionsDropdown ? "0 0 0 3px rgba(2, 132, 199, 0.14)" : "none",
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Users size={19} weight="duotone" className="shrink-0 text-[#091e47]" />
                      <span className="truncate font-bold text-[#091e47]" style={{ fontSize: 13 }}>
                        {carOptions.cars} {carOptions.cars > 1 ? "cars" : "car"},{" "}
                        {carOptions.passengers} {carOptions.passengers > 1 ? "passengers" : "passenger"}
                      </span>
                    </div>
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition"
                      style={
                        showCarOptionsDropdown
                          ? {
                              background: "#eff6ff",
                              border: "1.5px solid #22c55e",
                              color: "#0284c7",
                            }
                          : {
                              background: "#f1f5f9",
                              color: "#64748b",
                            }
                      }
                    >
                      <CaretDown
                        size={12}
                        weight="bold"
                        style={{
                          transform: showCarOptionsDropdown ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.15s",
                        }}
                      />
                    </span>
                  </button>

                  {showCarOptionsDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowCarOptionsDropdown(false)}
                      />
                      <div
                        className="absolute right-0 bottom-[calc(100%+10px)] z-40 w-[310px] bg-white p-4 shadow-2xl"
                        style={{ borderRadius: 18, border: "1px solid #dbe7fb" }}
                      >
                        <div className="flex flex-col gap-4">
                          {/* Cars Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Car size={20} weight="duotone" className="text-[#091e47]" />
                              <span className="text-sm font-extrabold text-[#091e47]">Cars</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setCarOptions((p) => ({ ...p, cars: Math.max(1, p.cars - 1) }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-5 text-center text-sm font-black text-[#091e47]">
                                {carOptions.cars}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCarOptions((p) => ({ ...p, cars: Math.min(5, p.cars + 1) }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Passengers Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Users size={20} weight="duotone" className="text-[#091e47]" />
                              <div>
                                <div className="text-sm font-extrabold leading-tight text-[#091e47]">
                                  Passengers
                                </div>
                                <div className="text-[11px] font-medium text-slate-400">
                                  Including driver
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setCarOptions((p) => ({
                                    ...p,
                                    passengers: Math.max(1, p.passengers - 1),
                                  }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-5 text-center text-sm font-black text-[#091e47]">
                                {carOptions.passengers}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCarOptions((p) => ({
                                    ...p,
                                    passengers: Math.min(16, p.passengers + 1),
                                  }))
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:brightness-95"
                                style={{ background: "#e0f2fe", color: "#0284c7", border: "none" }}
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Done Pill CTA */}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setShowCarOptionsDropdown(false)}
                              className="cursor-pointer px-6 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105"
                              style={{
                                background: "linear-gradient(90deg, #0ea5e9 0%, #1d75f2 100%)",
                                borderRadius: 9999,
                                border: "none",
                              }}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Col 4: Search Pill CTA (54px) */}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 font-extrabold text-white shadow-md transition hover:brightness-105 lg:w-auto"
                  style={{
                    height: 54,
                    padding: "0 28px",
                    borderRadius: 9999,
                    border: "none",
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d75f2 100%)",
                    boxShadow: "0 8px 20px rgba(2, 132, 199, 0.30)",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>Search</span>
                  <MagnifyingGlass size={17} weight="bold" />
                </button>
              </div>
            )}

            {/* Legacy Bottom Form Row hidden (all 4 tabs now use unified 1-row bar above) */}
            {false && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
              
              {/* Passengers Picker */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-[#f4f8ff] border border-blue-100 text-xs font-extrabold text-[#123975] hover:bg-blue-50 transition-colors cursor-pointer w-full sm:w-auto justify-between"
                  style={{ borderRadius: 12 }}
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-600" weight="bold" />
                    <span>
                      Số khách: {searchData.passengers.adults + searchData.passengers.children} Người
                    </span>
                  </div>
                  <CaretDown size={13} weight="bold" className="text-blue-500" />
                </button>

                {showPassengerDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowPassengerDropdown(false)} />
                    <div className="absolute left-0 mt-2 w-72 bg-white border border-blue-100 rounded-2xl p-4 shadow-2xl z-30">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">Người lớn</div>
                            <div className="text-xs text-slate-400">Từ 12 tuổi trở lên</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdatePassengers("adults", -1)}
                              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-blue-400 text-slate-600 transition-colors cursor-pointer font-bold"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-slate-900 w-4 text-center">
                              {searchData.passengers.adults}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePassengers("adults", 1)}
                              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-blue-400 text-slate-600 transition-colors cursor-pointer font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">Trẻ em</div>
                            <div className="text-xs text-slate-400">2 – 11 tuổi</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdatePassengers("children", -1)}
                              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-blue-400 text-slate-600 transition-colors cursor-pointer font-bold"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-slate-900 w-4 text-center">
                              {searchData.passengers.children}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePassengers("children", 1)}
                              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-blue-400 text-slate-600 transition-colors cursor-pointer font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {activeTab === "flights" && (
                          <div className="border-t border-slate-100 pt-3">
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                              Hạng ghế
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "economy", label: "Phổ thông" },
                                { id: "business", label: "Thương gia" },
                              ].map((cabin) => {
                                const isActive = searchData.flightClass === cabin.id;
                                return (
                                  <button
                                    key={cabin.id}
                                    type="button"
                                    onClick={() =>
                                      setSearchData((prev) => ({ ...prev, flightClass: cabin.id }))
                                    }
                                    className="cursor-pointer rounded-xl py-2 text-xs font-extrabold transition"
                                    style={
                                      isActive
                                        ? {
                                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                                            color: "#ffffff",
                                            border: "1px solid #0b5ed7",
                                          }
                                        : {
                                            background: "#f4f8ff",
                                            color: "#1e3f77",
                                            border: "1px solid #d5e6fc",
                                          }
                                    }
                                  >
                                    {cabin.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400 font-semibold">
                          <span>Tối đa 9 hành khách / lần đặt</span>
                          <button
                            type="button"
                            onClick={() => setShowPassengerDropdown(false)}
                            className="cursor-pointer font-extrabold text-blue-600 hover:underline"
                          >
                            Xong
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Search Button */}
              <button
                type="button"
                onClick={handleSearch}
                className="w-full sm:w-auto text-white font-black px-8 py-3.5 text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  boxShadow: "0 10px 24px rgba(13, 97, 225, 0.30)",
                  borderRadius: 9999,
                  border: "none",
                }}
              >
                <span>
                  {activeTab === "flights" && "Tìm chuyến bay"}
                  {activeTab === "hotels" && "Tìm khách sạn"}
                  {activeTab === "experiences" && "Tìm trải nghiệm"}
                  {activeTab === "cars" && "Tìm xe dịch vụ"}
                </span>
                <ArrowRight size={16} weight="bold" />
              </button>

            </div>
            )}

          </motion.div>

          {/* Quick Actions Bar for Returning Passengers */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {[
              {
                label: "Check-in trực tuyến",
                sub: "Nhận thẻ QR",
                icon: QrCode,
                to: "/check-in",
                accent: "#0b57d0",
                bg: "#eff6ff",
              },
              {
                label: "Tình trạng chuyến bay",
                sub: "Giờ bay & Cửa Gate",
                icon: AirplaneInFlight,
                to: "/flight-status",
                accent: "#0284c7",
                bg: "#f0f9ff",
              },
              {
                label: "Quản lý đặt chỗ (PNR)",
                sub: "Đổi / Hủy vé",
                icon: Ticket,
                to: "/my-bookings",
                accent: "#059669",
                bg: "#ecfdf5",
              },
              {
                label: "eSIM 5G & SkyLounge",
                sub: "Tiện ích quốc tế",
                icon: Crown,
                to: "/services/esim-lounge",
                accent: "#d97706",
                bg: "#fffbeb",
              },
              {
                label: "Suất ăn đặc biệt",
                sub: "Đăng ký miễn phí",
                icon: ForkKnife,
                to: "/services/meals",
                accent: "#7c3aed",
                bg: "#f5f3ff",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="inline-flex cursor-pointer items-center gap-2.5 bg-white px-4 py-2.5 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderRadius: 9999,
                    border: "1px solid #d5e6fc",
                  }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: item.bg, color: item.accent }}
                  >
                    <Icon size={15} weight="fill" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-xs font-extrabold text-[#091e47]">
                      {item.label}
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      {item.sub}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. VALUE PROPOSITION FEATURE STRIP (Clickable) */}
        <div className="w-full max-w-6xl px-6 mx-auto mb-16">
          <div className="relative bg-gradient-to-r from-[#edf4ff] via-[#e6f1fe] to-[#edf4ff] border border-blue-100/90 rounded-[28px] p-4 sm:p-5 shadow-xs overflow-hidden">
            
            {/* Background dashed flight path & plane illustration */}
            <div className="absolute right-6 top-3 pointer-events-none hidden sm:flex items-center gap-1 opacity-40">
              <svg width="120" height="30" viewBox="0 0 120 30" fill="none" className="text-blue-400">
                <path d="M0 25 C 40 25, 80 5, 120 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
              <AirplaneInFlight size={22} weight="fill" className="text-blue-500 transform rotate-12 -ml-2 -mt-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
              
              {/* Card 1: Giá tốt nhất */}
              <button
                type="button"
                onClick={() => navigate("/promotions")}
                className="group bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#eaf2ff] border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                    <Tag size={22} weight="fill" className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#13234d] leading-snug">Đảm bảo giá tốt nhất</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Xem ưu đãi mới nhất</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={11} weight="bold" />
                </div>
              </button>

              {/* Card 2: Hỗ trợ 24/7 */}
              <button
                type="button"
                onClick={() => navigate("/support")}
                className="group bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8faee] border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                    <Headset size={22} weight="fill" className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#13234d] leading-snug">Hỗ trợ 24/7</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Luôn sẵn sàng tư vấn</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={11} weight="bold" />
                </div>
              </button>

              {/* Card 3: Đặt vé an toàn */}
              <button
                type="button"
                onClick={() => navigate("/flight-safety/policy")}
                className="group bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#e6f4ff] border border-sky-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                    <ShieldCheck size={22} weight="fill" className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#13234d] leading-snug">An toàn chuẩn 5 sao</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tiêu chuẩn IOSA / ICAO</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-sky-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={11} weight="bold" />
                </div>
              </button>

              {/* Card 4: Linh hoạt đổi vé */}
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="group bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#fff2e8] border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-inner">
                    <ArrowsClockwise size={22} weight="bold" className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#13234d] leading-snug">Linh hoạt đổi vé</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Quản lý &amp; đổi lịch trình</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={11} weight="bold" />
                </div>
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* 5. POPULAR DESTINATIONS & EXCLUSIVE OFFERS GRID */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Điểm đến hàng đầu
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Khám phá trọn bộ 19 điểm đến Nội địa Việt Nam &amp; Quốc tế cùng SkyLink Airlines
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center gap-1 border border-blue-100 bg-[#f0f6ff] p-1"
              style={{ borderRadius: 9999 }}
            >
              {[
                { id: "featured", label: "Nổi bật (9)" },
                { id: "domestic", label: "Nội địa (10)" },
                { id: "international", label: "Quốc tế (9)" },
              ].map((tab) => {
                const active = destFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDestFilter(tab.id)}
                    className="cursor-pointer px-4 py-1.5 text-xs font-extrabold transition"
                    style={
                      active
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            borderRadius: 9999,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(13, 97, 225, 0.24)",
                          }
                        : {
                            background: "transparent",
                            color: "#33507f",
                            borderRadius: 9999,
                            border: "none",
                          }
                    }
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Destination Cards Grid (Featured 9 / Domestic 10 / International 9) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {TOP_DESTINATIONS.filter((d) =>
            destFilter === "featured" ? d.featured : d.region === destFilter
          ).map((dest) => (
            <div
              key={dest.code}
              onClick={() => handleBookDestination(dest.from, dest.code)}
              className="relative rounded-3xl overflow-hidden shadow-lg group h-[320px] border border-blue-100/80 cursor-pointer"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-white/30">
                  {dest.badge}
                </span>
                <span className="bg-blue-600/85 backdrop-blur-md text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-full border border-white/25">
                  {dest.from} → {dest.code}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-1">
                <h3 className="text-2xl font-black">
                  {dest.city} ({dest.code})
                </h3>
                <p className="text-xs text-slate-300 font-medium">{dest.country}</p>
                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-[10px] text-slate-300 block uppercase font-bold">
                      Giá từ
                    </span>
                    <span className="text-lg font-black text-white">
                      {dest.price}{" "}
                      <span className="text-xs font-medium text-slate-300">/Vé</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookDestination(dest.from, dest.code);
                    }}
                    className="inline-flex items-center gap-1.5 bg-white text-[#0b4fd0] hover:bg-blue-50 font-extrabold text-xs px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    <span>Đặt vé ngay</span>
                    <ArrowRight size={12} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full-width Exclusive Offers Banner Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[#122754] via-[#0f1f42] to-[#071026] p-8 border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="space-y-2 relative z-10 max-w-xl">
            <h3 className="text-2xl font-black tracking-tight">Ưu đãi độc quyền cho thành viên SkyLink</h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Đăng ký email ngay hôm nay để nhận mã giảm giá lên tới <strong className="text-cyan-400 font-bold text-base">20%</strong> cho mọi chuyến bay nội địa và quốc tế.
            </p>
          </div>

          {/* Airplane illustration in background */}
          <div className="absolute right-1/3 bottom-0 opacity-15 pointer-events-none hidden lg:block">
            <PaperPlaneTilt size={200} weight="fill" className="text-blue-400" />
          </div>

          <form onSubmit={handleNewsletter} className="w-full md:w-auto min-w-[320px] space-y-2 relative z-10">
            <div className="relative">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-400 outline-none focus:border-cyan-400 transition-colors pr-12"
                required
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <PaperPlaneTilt size={20} weight="fill" />
              </button>
            </div>
            {newsletterSubscribed && (
              <p className="text-[11px] text-emerald-400 font-semibold">✓ Đăng ký nhận ưu đãi thành công!</p>
            )}
          </form>
        </div>

      </section>

      {/* 6. PARTNER AIRLINES LOGO STRIP matching Image 2 */}
      <section className="border-t border-slate-200/80 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 transition-all text-xs font-black tracking-widest text-slate-700 uppercase">
            <span>EMIRATES</span>
            <span>QATAR AIRWAYS</span>
            <span>LUFTHANSA</span>
            <span>AIRFRANCE</span>
            <span>DELTA</span>
            <span>TURKISH AIRLINES</span>
            <span>BRITISH AIRWAYS</span>
            <span>SINGAPORE AIRLINES</span>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <Footer />
    </motion.div>
  );
}
import { useMemo, useState } from "react";
import {
  Binoculars,
  CaretRight,
  CheckCircle,
  CircleNotch,
  Clock,
  Compass,
  Crown,
  Gift,
  Heart,
  Lightning,
  MagnifyingGlass,
  MapPinLine,
  MapTrifold,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Tag,
  ThumbsUp,
  Trophy,
  Users,
  X,
} from "@phosphor-icons/react";
import SkyDatePicker from "../SkyDatePicker";
import HotelMapModal from "./HotelMapModal";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatShortEn(iso) {
  if (!iso) return "—";
  const parts = String(iso).split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  return `${DAY_SHORT[dt.getDay()]}, ${MONTH_SHORT[dt.getMonth()]} ${dt.getDate()}`;
}

const POPULAR_EXP_DESTINATIONS = [
  { en: "Ho Chi Minh City", dbValue: "TP. Hồ Chí Minh", region: "Vietnam", count: "420" },
  { en: "Hanoi", dbValue: "Hà Nội", region: "Vietnam", count: "385" },
  { en: "Da Nang", dbValue: "Đà Nẵng", region: "Central Coast, Vietnam", count: "310" },
  { en: "Hoi An", dbValue: "Hội An", region: "Quang Nam, Vietnam", count: "265" },
  { en: "Phu Quoc", dbValue: "Phú Quốc", region: "Kien Giang, Vietnam", count: "290" },
  { en: "Nha Trang", dbValue: "Nha Trang", region: "Khanh Hoa, Vietnam", count: "240" },
  { en: "Da Lat", dbValue: "Đà Lạt", region: "Lam Dong, Vietnam", count: "215" },
  { en: "Hue", dbValue: "Huế", region: "Thua Thien Hue, Vietnam", count: "180" },
  { en: "Quy Nhon", dbValue: "Quy Nhơn", region: "Binh Dinh, Vietnam", count: "135" },
  { en: "Shanghai", dbValue: "Thượng Hải", region: "China", count: "510" },
  { en: "Seoul", dbValue: "Seoul", region: "South Korea", count: "640" },
  { en: "Tokyo", dbValue: "Tokyo", region: "Japan", count: "780" },
  { en: "Singapore", dbValue: "Singapore", region: "Singapore", count: "460" },
];

function resolveExpQueryToDb(raw = "") {
  const clean = String(raw || "").trim();
  if (!clean) return "";
  const lower = clean.toLowerCase();
  const matched = POPULAR_EXP_DESTINATIONS.find(
    (d) =>
      d.en.toLowerCase() === lower ||
      d.dbValue.toLowerCase() === lower ||
      d.en.toLowerCase().includes(lower)
  );
  return matched ? matched.dbValue : clean;
}

const EXP_BADGES = [
  { label: "Best Seller · Bán chạy", Icon: Star, bg: "rgba(218, 248, 232, 0.95)", color: "#065f46" },
  { label: "Instant Confirm", Icon: Lightning, bg: "rgba(219, 238, 255, 0.95)", color: "#1e40af" },
  { label: "Top Rated · Đẳng cấp", Icon: Crown, bg: "rgba(254, 243, 199, 0.95)", color: "#92400e" },
  { label: "Special Deal · Ưu đãi", Icon: Gift, bg: "rgba(243, 232, 255, 0.95)", color: "#6b21a8" },
];

const DURATION_LABELS = [
  { id: "half", label: "Half-day · 3–4 hours" },
  { id: "full", label: "Full-day · 7–8 hours" },
  { id: "evening", label: "Evening · 2.5–3 hours" },
];

const ITEMS_PER_PAGE = 10;

export default function ExperienceResultsView({
  products = [],
  imageUrls = [],
  loading = false,
  error = "",
  q = "",
  startDate = "",
  guests = 2,
  favorites = [],
  toggleFavorite,
  guestContact,
  setGuestContact,
  busyProductId,
  onSearchSubmit,
  onConfirmReserve,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [cityInput, setCityInput] = useState(q || "");
  const [showDestMenu, setShowDestMenu] = useState(false);
  const [expDate, setExpDate] = useState(startDate || today);
  const [adults, setAdults] = useState(Math.max(1, Number(guests) || 2));
  const [children, setChildren] = useState(0);
  const [showGuestsMenu, setShowGuestsMenu] = useState(false);

  // Filters & Sort
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [maxBudget, setMaxBudget] = useState(5000000);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [bookingModalProduct, setBookingModalProduct] = useState(null);
  const [modalError, setModalError] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);

  const totalTravelers = adults + children;

  const toggleInList = (setter, id) => {
    setCurrentPage(1);
    setter((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const hasActiveFilters =
    selectedFilters.length > 0 ||
    selectedBudgetRange !== "" ||
    selectedCategories.length > 0 ||
    selectedLocations.length > 0 ||
    selectedDurations.length > 0 ||
    maxBudget < 5000000;

  const resetAllFilters = () => {
    setSelectedFilters([]);
    setSelectedBudgetRange("");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedDurations([]);
    setMaxBudget(5000000);
    setCurrentPage(1);
  };

  const enrichedExperiences = useMemo(() => {
    return products.map((product, idx) => {
      const rating5 = Number(product.rating || 4.8);
      const score10 = Math.min(9.9, Math.max(8.4, Number((rating5 * 1.94).toFixed(1))));
      const stars = rating5 >= 4.7 ? 5 : 4;
      const reviewCount = 920 + ((product.id || idx + 1) * 283) % 7400;
      const price = Number(product.price || 750000);
      const discountPct = idx % 3 === 0 ? 20 : idx % 3 === 1 ? 15 : 10;
      const originalPrice = Math.round(price / (1 - discountPct / 100));
      const nameLower = String(product.name || "").toLowerCase();
      const category =
        nameLower.includes("ẩm thực") || nameLower.includes("food") || nameLower.includes("cà phê")
          ? "food"
          : nameLower.includes("đảo") || nameLower.includes("biển") || nameLower.includes("du thuyền") || nameLower.includes("lặn")
          ? "island"
          : nameLower.includes("núi") || nameLower.includes("thác") || nameLower.includes("rừng") || nameLower.includes("trek")
          ? "adventure"
          : "culture";
      const durationObj = DURATION_LABELS[idx % DURATION_LABELS.length];

      return {
        ...product,
        imageUrl: imageUrls[idx],
        score10,
        scoreLabel: score10 >= 9.3 ? "Outstanding" : score10 >= 8.8 ? "Excellent" : "Very Good",
        stars,
        reviewCount,
        discountPct,
        originalPrice,
        category,
        durationId: durationObj.id,
        durationLabel: durationObj.label,
        hasInstantConfirm: true,
        hasFreeCancel: true,
        hasPickup: idx % 2 === 0,
        hasGuide: true,
        isSmallGroup: idx % 3 !== 2,
        spotsLeft: (idx % 5) + 2,
        badge: EXP_BADGES[idx % EXP_BADGES.length],
      };
    });
  }, [products, imageUrls]);

  const availableLocations = useMemo(() => {
    const counts = new Map();
    enrichedExperiences.forEach((item) => {
      if (item.city) counts.set(item.city, (counts.get(item.city) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([city, count]) => ({ city, count }));
  }, [enrichedExperiences]);

  const filteredExperiences = useMemo(() => {
    let list = enrichedExperiences.filter((item) => Number(item.price || 0) <= maxBudget);

    if (selectedBudgetRange === "0-500") list = list.filter((i) => i.price <= 500000);
    if (selectedBudgetRange === "500-1000") list = list.filter((i) => i.price > 500000 && i.price <= 1000000);
    if (selectedBudgetRange === "1000-2000") list = list.filter((i) => i.price > 1000000 && i.price <= 2000000);
    if (selectedBudgetRange === "2000-3000") list = list.filter((i) => i.price > 2000000 && i.price <= 3000000);
    if (selectedBudgetRange === "3000+") list = list.filter((i) => i.price > 3000000);

    if (selectedFilters.includes("great9")) list = list.filter((i) => i.score10 >= 9.0);
    if (selectedFilters.includes("instant")) list = list.filter((i) => i.hasInstantConfirm);
    if (selectedFilters.includes("free_cancel")) list = list.filter((i) => i.hasFreeCancel);
    if (selectedFilters.includes("pickup")) list = list.filter((i) => i.hasPickup);
    if (selectedFilters.includes("guide")) list = list.filter((i) => i.hasGuide);
    if (selectedFilters.includes("small_group")) list = list.filter((i) => i.isSmallGroup);

    if (selectedCategories.length > 0) {
      list = list.filter((i) => selectedCategories.includes(i.category));
    }
    if (selectedLocations.length > 0) {
      list = list.filter((i) => selectedLocations.includes(i.city));
    }
    if (selectedDurations.length > 0) {
      list = list.filter((i) => selectedDurations.includes(i.durationId));
    }

    if (sortBy === "price_asc") {
      list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "rating_desc") {
      list = [...list].sort((a, b) => b.score10 - a.score10);
    }

    return list;
  }, [
    enrichedExperiences,
    selectedFilters,
    selectedBudgetRange,
    selectedCategories,
    selectedLocations,
    selectedDurations,
    maxBudget,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredExperiences.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredExperiences.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [totalPages, safePage]);

  const filteredDestOptions = useMemo(() => {
    const query = cityInput.trim().toLowerCase();
    if (!query) return POPULAR_EXP_DESTINATIONS;
    return POPULAR_EXP_DESTINATIONS.filter(
      (d) =>
        d.en.toLowerCase().includes(query) ||
        d.dbValue.toLowerCase().includes(query) ||
        d.region.toLowerCase().includes(query)
    );
  }, [cityInput]);

  const handleSelectDestination = (dest) => {
    setCityInput(dest.en);
    setShowDestMenu(false);
    setCurrentPage(1);
    onSearchSubmit({
      q: dest.dbValue,
      startDate: expDate,
      guests: totalTravelers,
    });
  };

  const handleTopSearch = (e) => {
    e.preventDefault();
    setShowDestMenu(false);
    setCurrentPage(1);
    onSearchSubmit({
      q: resolveExpQueryToDb(cityInput),
      startDate: expDate,
      guests: totalTravelers,
    });
  };

  const handleConfirmModalBook = async () => {
    setModalError("");
    const { name, email, phone } = guestContact;
    if (!name.trim()) {
      setModalError("Vui lòng nhập họ tên hành khách liên hệ.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setModalError("Vui lòng nhập email liên hệ hợp lệ.");
      return;
    }
    if (!phone.trim() || !/^\+?[0-9\s().-]{8,30}$/.test(phone.trim())) {
      setModalError("Vui lòng nhập số điện thoại hợp lệ (8–30 ký tự).");
      return;
    }
    await onConfirmReserve(bookingModalProduct, totalTravelers);
  };

  return (
    <div className="space-y-5">
      {/* 1. UNIFIED BLUE-BORDERED 1-ROW EXPERIENCE SEARCH BAR */}
      <form
        onSubmit={handleTopSearch}
        className="flex flex-col items-stretch gap-2 bg-white p-2 shadow-md lg:flex-row lg:items-center"
        style={{
          borderRadius: 18,
          border: "2px solid #1d64f2",
        }}
      >
        {/* Destination Input with Popular Destination Dropdown */}
        <div className="relative flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 lg:border-r lg:border-slate-200">
          <Compass size={20} weight="duotone" className="shrink-0 text-[#0b5ed7]" />
          <input
            type="text"
            value={cityInput}
            onFocus={() => setShowDestMenu(true)}
            onClick={() => setShowDestMenu(true)}
            onChange={(e) => {
              setCityInput(e.target.value);
              setShowDestMenu(true);
            }}
            placeholder="Destination, tour, or activity..."
            className="w-full min-w-0 bg-transparent text-sm font-bold text-[#091e47] placeholder-slate-400 outline-none"
            style={{ border: "none" }}
          />
          {cityInput && (
            <button
              type="button"
              onClick={() => {
                setCityInput("");
                setShowDestMenu(false);
                onSearchSubmit({ q: "", startDate: expDate, guests: totalTravelers });
              }}
              aria-label="Clear destination"
              className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
              style={{ border: "none", padding: 0 }}
            >
              <X size={11} weight="bold" />
            </button>
          )}

          {showDestMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowDestMenu(false)} />
              <div
                role="listbox"
                className="absolute left-0 top-[calc(100%+12px)] z-40 overflow-hidden bg-white shadow-2xl"
                style={{
                  width: "min(440px, calc(100vw - 32px))",
                  borderRadius: 18,
                  border: "1px solid #dbe7fb",
                }}
              >
                <div className="p-3 pb-1.5">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectDestination({ en: "Da Nang", dbValue: "Đà Nẵng" })}
                    className="flex w-full cursor-pointer items-center gap-2.5 bg-white px-3.5 py-2.5 text-left transition hover:bg-[#f4f9ff]"
                    style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  >
                    <MapPinLine size={18} weight="fill" className="text-[#0284c7]" />
                    <span className="text-xs font-extrabold text-[#0284c7]">Near me · Gần tôi</span>
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-black text-[#091e47]">Popular Destination</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setCityInput("");
                      setShowDestMenu(false);
                      onSearchSubmit({ q: "", startDate: expDate, guests: totalTravelers });
                    }}
                    className="cursor-pointer bg-transparent text-xs font-bold text-[#0b5ed7] hover:underline"
                    style={{ border: "none", padding: 0 }}
                  >
                    All Cities
                  </button>
                </div>

                <div style={{ maxHeight: 310, overflowY: "auto" }}>
                  {filteredDestOptions.map((item) => (
                    <button
                      key={item.en}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectDestination(item)}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-2.5 text-left transition last:border-b-0 hover:bg-[#f4f9ff]"
                      style={{ borderLeft: "none", borderRight: "none", borderTop: "none" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-[#091e47]">{item.en}</div>
                        <div className="truncate text-xs font-medium text-slate-500">{item.region}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className="inline-block px-2.5 py-0.5 text-[11px] font-bold"
                          style={{ borderRadius: 9999, background: "#eff6ff", color: "#0284c7" }}
                        >
                          City
                        </span>
                        <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                          {item.count} tours nearby
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Experience Date */}
        <div className="flex items-center px-3 py-1.5 lg:w-[220px] lg:shrink-0 lg:border-r lg:border-slate-200">
          <SkyDatePicker
            value={expDate}
            min={today}
            align="right"
            dualMonth
            shortFormat
            hideCaret
            placeholder="Select date"
            onChange={(val) => setExpDate(val)}
          />
        </div>

        {/* Travelers Popover */}
        <div className="relative px-3 py-1.5 lg:w-[210px] lg:shrink-0">
          <button
            type="button"
            onClick={() => setShowGuestsMenu((v) => !v)}
            className="flex w-full cursor-pointer items-center gap-2 bg-transparent text-left"
            style={{ border: "none", padding: 0 }}
          >
            <Users size={18} weight="duotone" className="shrink-0 text-[#0b5ed7]" />
            <span className="truncate text-xs font-extrabold text-[#091e47]">
              {adults} {adults > 1 ? "adults" : "adult"}, {children} child
            </span>
          </button>

          {showGuestsMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowGuestsMenu(false)} />
              <div
                className="absolute right-0 top-[calc(100%+12px)] z-40 w-64 bg-white p-4 shadow-2xl"
                style={{ borderRadius: 18, border: "1px solid #dbe7fb" }}
              >
                <div className="space-y-3.5">
                  {[
                    { label: "Adults", val: adults, min: 1, max: 12, set: setAdults },
                    { label: "Children", val: children, min: 0, max: 8, set: setChildren },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#091e47]">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => item.set((v) => Math.max(item.min, v - 1))}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-[#0284c7]"
                          style={{ border: "none" }}
                        >
                          <Minus size={13} weight="bold" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-[#091e47]">
                          {item.val}
                        </span>
                        <button
                          type="button"
                          onClick={() => item.set((v) => Math.min(item.max, v + 1))}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-[#0284c7]"
                          style={{ border: "none" }}
                        >
                          <Plus size={13} weight="bold" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end border-t border-slate-100 pt-2.5">
                    <button
                      type="button"
                      onClick={() => setShowGuestsMenu(false)}
                      className="cursor-pointer px-4 py-1.5 text-xs font-extrabold text-white"
                      style={{
                        background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
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

        {/* Search Button */}
        <button
          type="submit"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
          style={{
            background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
            borderRadius: 12,
            border: "none",
            whiteSpace: "nowrap",
          }}
        >
          <MagnifyingGlass size={16} weight="bold" />
          <span>Search</span>
        </button>
      </form>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* 2. TWO-COLUMN LAYOUT: LEFT FILTER SIDEBAR + RIGHT HORIZONTAL EXPERIENCE CARDS */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT SIDEBAR (3 cols) */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-3">
          {/* Crisp OpenStreetMap Thumbnail for Show on Map */}
          <div
            onClick={() => setShowMapModal(true)}
            className="group relative flex h-32 cursor-pointer items-center justify-center overflow-hidden shadow-xs"
            style={{
              borderRadius: 18,
              border: "1px solid #cde0fc",
              background: "#dceeff",
            }}
          >
            <div className="pointer-events-none absolute inset-0 flex">
              <img
                src="https://tile.openstreetmap.org/12/3283/1869.png"
                alt=""
                className="h-full w-1/2 object-cover transition duration-500 group-hover:scale-105"
              />
              <img
                src="https://tile.openstreetmap.org/12/3284/1869.png"
                alt=""
                className="h-full w-1/2 object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <span className="pointer-events-none absolute left-5 top-4 h-3 w-3 rounded-full border-2 border-white bg-[#0b5ed7] shadow-sm" />
            <span className="pointer-events-none absolute right-7 top-5 h-3 w-3 rounded-full border-2 border-white bg-[#0ea5e9] shadow-sm" />
            <span className="pointer-events-none absolute bottom-4 left-12 h-3 w-3 rounded-full border-2 border-white bg-[#1d4ed8] shadow-sm" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMapModal(true);
              }}
              className="relative z-10 inline-flex cursor-pointer items-center gap-1.5 bg-white px-4 py-2 text-xs font-extrabold text-[#0b5ed7] shadow-md transition hover:bg-blue-50"
              style={{ borderRadius: 10, border: "1px solid #dbe7fb" }}
            >
              <MapTrifold size={16} weight="duotone" />
              <span>Show on Map</span>
            </button>
          </div>

          {/* 5-Section Trip.com Filter Sidebar */}
          <div
            className="divide-y divide-slate-100 bg-white p-5 shadow-xs"
            style={{ borderRadius: 20, border: "1px solid #dbe7fb" }}
          >
            {/* 1. Popular Filters */}
            <div className="pb-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 13.5 }}>
                  {cityInput ? `Popular filters for ${cityInput}` : "Popular filters"}
                </h3>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="shrink-0 cursor-pointer bg-transparent text-xs font-bold text-[#0b5ed7] hover:underline"
                    style={{ border: "none", padding: 0 }}
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { id: "great9", label: "Great 9.0+", sub: "Based on traveler reviews" },
                  { id: "instant", label: "Instant confirmation", sub: null },
                  { id: "free_cancel", label: "Free cancellation", sub: null },
                  { id: "pickup", label: "Hotel pickup included", sub: null },
                  { id: "guide", label: "Local tour guide", sub: null },
                  { id: "small_group", label: "Small group tour", sub: null },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="w-full cursor-pointer gap-2.5 select-none"
                    style={{ display: "flex", alignItems: "flex-start", marginBottom: 0 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(item.id)}
                      onChange={() => toggleInList(setSelectedFilters, item.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#0b5ed7]"
                    />
                    <div className="min-w-0 leading-snug">
                      <span className="block text-xs font-bold text-slate-700">{item.label}</span>
                      {item.sub && (
                        <span className="block text-[10.5px] font-medium text-slate-400">{item.sub}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Budget */}
            <div className="py-4">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 13.5 }}>
                  Budget
                </h3>
                <span className="text-[11px] font-extrabold text-[#0b5ed7]">
                  ≤ {currency.format(maxBudget)}
                </span>
              </div>
              <p className="mb-3 text-[10.5px] font-medium text-slate-400" style={{ margin: "0 0 10px 0" }}>
                Price per traveler
              </p>

              <input
                type="range"
                min="300000"
                max="5000000"
                step="200000"
                value={maxBudget}
                onChange={(e) => {
                  setMaxBudget(Number(e.target.value));
                  setSelectedBudgetRange("");
                  setCurrentPage(1);
                }}
                className="mb-3 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#0b5ed7]"
              />

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "0-500", label: "≤ 500K" },
                  { id: "500-1000", label: "500K – 1Tr" },
                  { id: "1000-2000", label: "1 – 2Tr" },
                  { id: "2000-3000", label: "2 – 3Tr" },
                  { id: "3000+", label: "> 3Tr ₫" },
                ].map((b) => {
                  const active = selectedBudgetRange === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBudgetRange(active ? "" : b.id);
                        setCurrentPage(1);
                      }}
                      className="cursor-pointer px-2 py-1.5 text-[11px] font-bold transition"
                      style={{
                        borderRadius: 8,
                        background: active ? "#eff6ff" : "#f8fafc",
                        color: active ? "#0b5ed7" : "#475569",
                        border: active ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Category */}
            <div className="py-4">
              <h3 className="mb-2.5 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 13.5 }}>
                Category · Loại hình
              </h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { id: "culture", label: "Cultural & Heritage" },
                  { id: "food", label: "Food & Culinary" },
                  { id: "island", label: "Island & Cruise" },
                  { id: "adventure", label: "Adventure & Nature" },
                ].map((cat) => (
                  <label
                    key={cat.id}
                    className="w-full cursor-pointer gap-2.5 select-none"
                    style={{ display: "flex", alignItems: "center", marginBottom: 0 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleInList(setSelectedCategories, cat.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#0b5ed7]"
                    />
                    <span className="text-xs font-bold text-slate-700">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Location */}
            {availableLocations.length > 1 && (
              <div className="py-4">
                <h3 className="mb-2.5 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 13.5 }}>
                  Location · Khu vực
                </h3>
                <div className="flex flex-col gap-2.5">
                  {(showAllLocations ? availableLocations : availableLocations.slice(0, 5)).map(
                    ({ city, count }) => (
                      <label
                        key={city}
                        className="w-full cursor-pointer justify-between gap-2 select-none"
                        style={{ display: "flex", alignItems: "center", marginBottom: 0 }}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(city)}
                            onChange={() => toggleInList(setSelectedLocations, city)}
                            className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#0b5ed7]"
                          />
                          <span className="truncate text-xs font-bold text-slate-700">{city}</span>
                        </div>
                        <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                          {count}
                        </span>
                      </label>
                    )
                  )}
                </div>
                {availableLocations.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllLocations((v) => !v)}
                    className="mt-2.5 cursor-pointer bg-transparent text-xs font-extrabold text-[#0b5ed7] hover:underline"
                    style={{ border: "none", padding: 0 }}
                  >
                    {showAllLocations
                      ? "Show Less"
                      : `Show More (${availableLocations.length - 5})`}
                  </button>
                )}
              </div>
            )}

            {/* 5. Duration */}
            <div className="pt-4">
              <h3 className="mb-2.5 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 13.5 }}>
                Duration · Thời lượng
              </h3>
              <div className="flex flex-col gap-2.5">
                {DURATION_LABELS.map((dur) => (
                  <label
                    key={dur.id}
                    className="w-full cursor-pointer gap-2.5 select-none"
                    style={{ display: "flex", alignItems: "center", marginBottom: 0 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDurations.includes(dur.id)}
                      onChange={() => toggleInList(setSelectedDurations, dur.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#0b5ed7]"
                    />
                    <span className="text-xs font-bold text-slate-700">{dur.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT HORIZONTAL EXPERIENCE LIST (9 cols) */}
        <div className="space-y-4 lg:col-span-9">
          {/* Sort & Count Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3.5 shadow-xs"
            style={{ borderRadius: 18, border: "1px solid #dbe7fb" }}
          >
            <div>
              <span className="text-sm font-black text-[#091e47]">
                {filteredExperiences.length} experiences found
              </span>
              {cityInput && (
                <span className="ml-1.5 text-xs font-semibold text-slate-500">
                  in {cityInput}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "recommended", label: "Recommended" },
                { id: "price_asc", label: "Lowest price" },
                { id: "rating_desc", label: "Top rated" },
              ].map((tab) => {
                const active = sortBy === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSortBy(tab.id);
                      setCurrentPage(1);
                    }}
                    className="cursor-pointer px-3.5 py-1.5 text-xs font-extrabold transition"
                    style={
                      active
                        ? {
                            background: "#eff6ff",
                            color: "#0b5ed7",
                            border: "1px solid #bfd7fb",
                            borderRadius: 9999,
                          }
                        : {
                            background: "transparent",
                            color: "#475569",
                            border: "1px solid transparent",
                            borderRadius: 9999,
                          }
                    }
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Experience Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-20 text-slate-400">
              <CircleNotch size={34} className="animate-spin text-[#0b5ed7]" />
              <p className="text-xs font-bold">Loading experiences · Đang tải danh sách trải nghiệm...</p>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div
              className="rounded-3xl bg-white p-12 text-center shadow-xs"
              style={{ border: "1px solid #dbe7fb" }}
            >
              <p className="text-base font-black text-[#091e47]">
                No experiences match your current filters
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Try clearing a filter or adjusting your budget range.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedItems.map((exp, idx) => {
                const isFav = favorites.includes(exp.id);
                const BadgeIcon = exp.badge.Icon;
                const totalPrice = Math.round(Number(exp.price || 0) * totalTravelers);

                return (
                  <article
                    key={exp.id}
                    className="overflow-hidden bg-white transition hover:shadow-lg"
                    style={{
                      borderRadius: 20,
                      border: "1px solid #dbe7fb",
                      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
                    }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Existing Gorgeous Experience Photo */}
                      <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-100 md:h-[236px] md:w-[255px]">
                        <img
                          src={exp.imageUrl}
                          alt={exp.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          loading="lazy"
                        />

                        <span
                          className="absolute left-3 top-3 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold shadow-xs"
                          style={{
                            background: exp.badge.bg,
                            color: exp.badge.color,
                            borderRadius: 8,
                          }}
                        >
                          <BadgeIcon size={12} weight="fill" />
                          <span>{exp.badge.label}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(exp.id)}
                          aria-label="Favorite experience"
                          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
                          style={{ border: "none", padding: 0 }}
                        >
                          <Heart
                            size={16}
                            weight={isFav ? "fill" : "bold"}
                            className={isFav ? "text-rose-500" : "text-slate-600"}
                          />
                        </button>
                      </div>

                      {/* Center: Full Title + Location + Perks + Duration */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2
                              className="font-black text-[#091e47]"
                              style={{ margin: 0, fontSize: 17, lineHeight: 1.3 }}
                            >
                              {exp.name}
                            </h2>
                            <span className="inline-flex items-center gap-0.5 text-amber-400">
                              {Array.from({ length: exp.stars }).map((_, sIdx) => (
                                <Star key={sIdx} size={13} weight="fill" />
                              ))}
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <MapPinLine size={14} weight="fill" className="shrink-0 text-[#0b5ed7]" />
                            <span>
                              {exp.city}
                              {/\(|singapore|tokyo|seoul|shanghai|kuala|taipei|sydney|manila/i.test(String(exp.city || ""))
                                ? ""
                                : ", Vietnam"}{" "}
                              • Guided Experience
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] font-semibold text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Lightning size={13} weight="fill" className="text-[#0b5ed7]" />
                              Instant confirmation
                            </span>
                            {exp.hasPickup && (
                              <span className="inline-flex items-center gap-1">
                                <ThumbsUp size={13} weight="fill" className="text-emerald-600" />
                                Hotel pickup
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock size={13} weight="fill" className="text-sky-600" />
                              {exp.durationLabel}
                            </span>
                          </div>

                          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                            <Trophy size={13} weight="fill" className="text-amber-500" />
                            <span>
                              Top #{idx + 1} Popular Experience in {exp.city}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3.5 border-t border-slate-100 pt-3">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                              <CheckCircle size={13} weight="fill" />
                              Free cancellation · Miễn phí hủy 24h
                            </span>
                            <span className="font-bold text-rose-600">
                              Only {exp.spotsLeft} spots left today
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Rating Badge + Pricing + Book Now CTA */}
                      <div className="flex shrink-0 items-end justify-between border-t border-slate-100 p-4 md:w-[225px] md:flex-col md:items-end md:justify-between md:border-l md:border-t-0 md:p-5">
                        <div className="flex items-center gap-2">
                          <div className="text-left md:text-right">
                            <div className="text-xs font-black text-[#0b5ed7]">{exp.scoreLabel}</div>
                            <div className="text-[11px] font-semibold text-slate-400">
                              {exp.reviewCount.toLocaleString("en-US")} reviews
                            </div>
                          </div>
                          <span
                            className="flex h-9 w-10 items-center justify-center font-black text-white shadow-xs"
                            style={{
                              background: "linear-gradient(135deg, #0b5ed7 0%, #1d4ed8 100%)",
                              borderRadius: "10px 10px 10px 2px",
                              fontSize: 14,
                            }}
                          >
                            {exp.score10}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-1.5">
                            <span className="text-xs font-semibold text-slate-400 line-through">
                              {currency.format(exp.originalPrice)}
                            </span>
                            <span
                              className="font-black text-[#0b5ed7]"
                              style={{ fontSize: 19, whiteSpace: "nowrap" }}
                            >
                              {currency.format(exp.price)}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[10.5px] font-semibold text-slate-500">
                            Total ({totalTravelers} pax):{" "}
                            <strong className="text-[#091e47]">{currency.format(totalPrice)}</strong>
                          </div>

                          <div className="mt-1.5 flex justify-end">
                            <span
                              className="inline-flex items-center gap-1 font-extrabold"
                              style={{
                                background: "#fff1f2",
                                color: "#e11d48",
                                borderRadius: 6,
                                padding: "2px 8px",
                                fontSize: 10.5,
                              }}
                            >
                              Special Discount {exp.discountPct}% off
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={busyProductId === exp.id}
                            onClick={() => {
                              setModalError("");
                              setBookingModalProduct(exp);
                            }}
                            className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
                            style={{
                              background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                              borderRadius: 10,
                              border: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span>Check Availability</span>
                            <CaretRight size={13} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Windowed Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-bold text-[#163d7a] hover:bg-blue-50 disabled:opacity-40"
                style={{ cursor: safePage <= 1 ? "not-allowed" : "pointer" }}
              >
                ‹
              </button>
              {visiblePages.map((pg, i) =>
                pg === "..." ? (
                  <span key={`d-${i}`} className="flex h-8 w-7 items-center justify-center text-xs text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pg);
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                    className="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-extrabold transition"
                    style={
                      safePage === pg
                        ? {
                            background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                            color: "#ffffff",
                            border: "none",
                            cursor: "pointer",
                          }
                        : {
                            background: "#ffffff",
                            color: "#163d7a",
                            border: "1px solid #cde0fc",
                            cursor: "pointer",
                          }
                    }
                  >
                    {pg}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-bold text-[#163d7a] hover:bg-blue-50 disabled:opacity-40"
                style={{ cursor: safePage >= totalPages ? "not-allowed" : "pointer" }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. FULL-SCREEN INTERACTIVE EXPERIENCE MAP MODAL */}
      {showMapModal && (
        <HotelMapModal
          hotels={filteredExperiences}
          initialCity={cityInput || selectedLocations[0] || ""}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onSelectHotel={(item) => {
            setShowMapModal(false);
            setModalError("");
            setBookingModalProduct(item);
          }}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {/* 4. CLEAN GUEST CONFIRMATION MODAL */}
      {bookingModalProduct && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ background: "rgba(9, 25, 58, 0.55)", backdropFilter: "blur(6px)" }}
          onClick={() => !busyProductId && setBookingModalProduct(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg overflow-hidden bg-white shadow-2xl"
            style={{ borderRadius: 24, border: "1px solid #dbe7fb" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4 text-white"
              style={{ background: "linear-gradient(135deg, #0a3b8e 0%, #1d64f2 100%)" }}
            >
              <div>
                <h3 className="font-black text-white" style={{ margin: 0, fontSize: 16 }}>
                  Confirm Experience · Xác nhận đặt trải nghiệm
                </h3>
                <p className="text-[11px] font-medium text-sky-100" style={{ margin: "2px 0 0 0" }}>
                  {bookingModalProduct.name} • {formatShortEn(expDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalProduct(null)}
                className="cursor-pointer rounded-full p-1 text-white/80 hover:bg-white/20"
                style={{ background: "transparent", border: "none" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {modalError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700">
                  {modalError}
                </div>
              )}

              <div className="flex items-center gap-3.5 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-3">
                <img
                  src={bookingModalProduct.imageUrl}
                  alt={bookingModalProduct.name}
                  className="h-16 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-[#091e47]">
                    {bookingModalProduct.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {totalTravelers} traveler(s) • {formatShortEn(expDate)}
                  </div>
                  <div className="mt-0.5 text-sm font-black text-[#0b5ed7]">
                    {currency.format(Math.round(Number(bookingModalProduct.price || 0) * totalTravelers))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 text-xs font-extrabold text-[#163d7a]" style={{ display: "block" }}>
                    Full Name · Họ và tên khách liên hệ *
                  </label>
                  <input
                    type="text"
                    value={guestContact.name}
                    onChange={(e) => setGuestContact((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#091e47] focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 text-xs font-extrabold text-[#163d7a]" style={{ display: "block" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={guestContact.email}
                      onChange={(e) => setGuestContact((p) => ({ ...p, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#091e47] focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-xs font-extrabold text-[#163d7a]" style={{ display: "block" }}>
                      Phone · Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={guestContact.phone}
                      onChange={(e) => setGuestContact((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+84 90 123 4567"
                      className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#091e47] focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setBookingModalProduct(null)}
                  className="cursor-pointer px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  style={{ borderRadius: 9999, border: "1px solid #e2e8f0", background: "#ffffff" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busyProductId === bookingModalProduct.id}
                  onClick={handleConfirmModalBook}
                  className="inline-flex cursor-pointer items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                    borderRadius: 9999,
                    border: "none",
                  }}
                >
                  <ShieldCheck size={15} weight="fill" />
                  <span>
                    {busyProductId === bookingModalProduct.id
                      ? "Processing..."
                      : "Continue to Payment · Tiếp tục"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

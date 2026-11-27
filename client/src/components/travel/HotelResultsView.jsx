import { useMemo, useState } from "react";
import {
  CalendarBlank,
  CaretRight,
  CheckCircle,
  CircleNotch,
  Crown,
  ForkKnife,
  Gift,
  Heart,
  MagnifyingGlass,
  MapPinLine,
  MapTrifold,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  SwimmingPool,
  Tag,
  ThumbsUp,
  Trophy,
  User,
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

function calcNights(startIso, endIso) {
  if (!startIso || !endIso) return 1;
  const d1 = new Date(`${startIso}T00:00:00`);
  const d2 = new Date(`${endIso}T00:00:00`);
  const diff = Math.round((d2 - d1) / 86400000);
  return Math.max(1, Number.isNaN(diff) ? 1 : diff);
}

const HOTEL_BADGES = [
  { label: "Top Pick · Yêu thích", Icon: Star, bg: "rgba(218, 248, 232, 0.95)", color: "#065f46" },
  { label: "Best Value · Giá tốt", Icon: Tag, bg: "rgba(219, 238, 255, 0.95)", color: "#1e40af" },
  { label: "Luxury · Đẳng cấp", Icon: Crown, bg: "rgba(254, 243, 199, 0.95)", color: "#92400e" },
  { label: "Special Deal · Ưu đãi", Icon: Gift, bg: "rgba(243, 232, 255, 0.95)", color: "#6b21a8" },
];

const ROOM_TYPES = [
  "Deluxe King Room · 1 king bed",
  "Superior Twin Room · 2 single beds",
  "Premier City View Room · 1 double bed",
  "Executive Suite · 1 king bed",
  "Ocean View Balcony Room · 1 queen bed",
];

const POPULAR_HOTEL_DESTINATIONS = [
  { en: "Ho Chi Minh City", dbValue: "TP. Hồ Chí Minh", region: "Vietnam", count: "2,840" },
  { en: "Hanoi", dbValue: "Hà Nội", region: "Vietnam", count: "2,310" },
  { en: "Da Nang", dbValue: "Đà Nẵng", region: "Central Coast, Vietnam", count: "1,860" },
  { en: "Phu Quoc", dbValue: "Phú Quốc", region: "Kien Giang, Vietnam", count: "1,290" },
  { en: "Nha Trang", dbValue: "Nha Trang", region: "Khanh Hoa, Vietnam", count: "1,481" },
  { en: "Da Lat", dbValue: "Đà Lạt", region: "Lam Dong, Vietnam", count: "1,939" },
  { en: "Quy Nhon", dbValue: "Quy Nhơn", region: "Binh Dinh, Vietnam", count: "620" },
  { en: "Hue", dbValue: "Huế", region: "Thua Thien Hue, Vietnam", count: "540" },
  { en: "Hoi An", dbValue: "Hội An", region: "Quang Nam, Vietnam", count: "915" },
  { en: "Shanghai", dbValue: "Thượng Hải", region: "China", count: "5,240" },
  { en: "Seoul", dbValue: "Seoul", region: "South Korea", count: "4,890" },
  { en: "Tokyo", dbValue: "Tokyo", region: "Japan", count: "6,120" },
  { en: "Singapore", dbValue: "Singapore", region: "Singapore", count: "3,450" },
  { en: "Kuala Lumpur", dbValue: "Kuala Lumpur", region: "Malaysia", count: "6,636" },
];

function resolveHotelQueryToDb(raw = "") {
  const clean = String(raw || "").trim();
  if (!clean) return "";
  const lower = clean.toLowerCase();
  const matched = POPULAR_HOTEL_DESTINATIONS.find(
    (d) =>
      d.en.toLowerCase() === lower ||
      d.dbValue.toLowerCase() === lower ||
      d.en.toLowerCase().includes(lower)
  );
  return matched ? matched.dbValue : clean;
}

const ITEMS_PER_PAGE = 10;

export default function HotelResultsView({
  products = [],
  hotelImageUrls = [],
  loading = false,
  error = "",
  q = "",
  startDate = "",
  endDate = "",
  guests = 2,
  roomsInitial = 1,
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
  const [checkIn, setCheckIn] = useState(startDate || today);
  const [checkOut, setCheckOut] = useState(endDate || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })());
  const [adults, setAdults] = useState(Math.max(1, Number(guests) || 2));
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(Math.max(1, Number(roomsInitial) || 1));
  const [showGuestsMenu, setShowGuestsMenu] = useState(false);

  // Filters & Sort
  const [sortBy, setSortBy] = useState("recommended"); // recommended | price_asc | rating_desc
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedBudgetRange, setSelectedBudgetRange] = useState(""); // "" | "0-1500" | "1500-2500" | "2500-4000" | "4000-6000" | "6000+"
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [maxBudget, setMaxBudget] = useState(10000000);
  const [currentPage, setCurrentPage] = useState(1);

  // Booking Modal State
  const [bookingModalProduct, setBookingModalProduct] = useState(null);
  const [modalError, setModalError] = useState("");
  const [showMapPreview, setShowMapPreview] = useState(false);

  const nights = calcNights(checkIn, checkOut);

  const toggleInList = (setter, id) => {
    setCurrentPage(1);
    setter((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const hasActiveFilters =
    selectedFilters.length > 0 ||
    selectedBudgetRange !== "" ||
    selectedPropertyTypes.length > 0 ||
    selectedStars.length > 0 ||
    selectedLocations.length > 0 ||
    selectedMeals.length > 0 ||
    maxBudget < 10000000;

  const resetAllFilters = () => {
    setSelectedFilters([]);
    setSelectedBudgetRange("");
    setSelectedPropertyTypes([]);
    setSelectedStars([]);
    setSelectedLocations([]);
    setSelectedMeals([]);
    setMaxBudget(10000000);
    setCurrentPage(1);
  };

  // Enrich products with their original canonical image URL + deterministic OTA metadata
  const enrichedHotels = useMemo(() => {
    return products.map((product, idx) => {
      const rating5 = Number(product.rating || 4.7);
      const score10 = Math.min(9.9, Math.max(8.2, Number((rating5 * 1.94).toFixed(1))));
      const stars = rating5 >= 4.8 ? 5 : rating5 >= 4.4 ? 4 : 3;
      const reviewCount = 1240 + ((product.id || idx + 1) * 317) % 9800;
      const price = Number(product.price || 1500000);
      const discountPct = idx % 3 === 0 ? 20 : idx % 3 === 1 ? 15 : 12;
      const originalPrice = Math.round(price / (1 - discountPct / 100));
      const hasBreakfast = idx % 2 === 0 || stars === 5;
      const hasDinner = stars === 5 && idx % 3 === 0;
      const hasFreeCancel = true;
      const hasPool = stars === 5 || idx % 3 === 0;
      const hasGym = idx % 2 === 0;
      const hasDoubleBed = idx % 3 !== 1;
      const hasPrivateBath = true;
      const nameLower = String(product.name || "").toLowerCase();
      const propertyType =
        nameLower.includes("villa") || nameLower.includes("homestay") || nameLower.includes("apartment")
          ? "homes"
          : nameLower.includes("hostel") || nameLower.includes("inn")
          ? "hostels"
          : "hotels";
      const roomsLeft = (idx % 4) + 1;

      return {
        ...product,
        imageUrl: hotelImageUrls[idx],
        score10,
        scoreLabel: score10 >= 9.3 ? "Outstanding" : score10 >= 8.8 ? "Excellent" : "Very Good",
        stars,
        reviewCount,
        discountPct,
        originalPrice,
        hasBreakfast,
        hasDinner,
        hasFreeCancel,
        hasPool,
        hasGym,
        hasDoubleBed,
        hasPrivateBath,
        propertyType,
        roomsLeft,
        roomType: ROOM_TYPES[idx % ROOM_TYPES.length],
        badge: HOTEL_BADGES[idx % HOTEL_BADGES.length],
      };
    });
  }, [products, hotelImageUrls]);

  const availableLocations = useMemo(() => {
    const counts = new Map();
    enrichedHotels.forEach((h) => {
      if (h.city) counts.set(h.city, (counts.get(h.city) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([city, count]) => ({ city, count }));
  }, [enrichedHotels]);

  // Apply all sidebar filters + sort
  const filteredHotels = useMemo(() => {
    let list = enrichedHotels.filter((h) => Number(h.price || 0) <= maxBudget);

    if (selectedBudgetRange === "0-1500") list = list.filter((h) => h.price <= 1500000);
    if (selectedBudgetRange === "1500-2500") list = list.filter((h) => h.price > 1500000 && h.price <= 2500000);
    if (selectedBudgetRange === "2500-4000") list = list.filter((h) => h.price > 2500000 && h.price <= 4000000);
    if (selectedBudgetRange === "4000-6000") list = list.filter((h) => h.price > 4000000 && h.price <= 6000000);
    if (selectedBudgetRange === "6000+") list = list.filter((h) => h.price > 6000000);

    if (selectedFilters.includes("great9")) list = list.filter((h) => h.score10 >= 9.0);
    if (selectedFilters.includes("breakfast")) list = list.filter((h) => h.hasBreakfast);
    if (selectedFilters.includes("free_cancel")) list = list.filter((h) => h.hasFreeCancel);
    if (selectedFilters.includes("double_bed")) list = list.filter((h) => h.hasDoubleBed);
    if (selectedFilters.includes("private_bath")) list = list.filter((h) => h.hasPrivateBath);
    if (selectedFilters.includes("pool")) list = list.filter((h) => h.hasPool);
    if (selectedFilters.includes("gym")) list = list.filter((h) => h.hasGym);

    if (selectedPropertyTypes.length > 0) {
      list = list.filter((h) => selectedPropertyTypes.includes(h.propertyType));
    }
    if (selectedStars.length > 0) {
      list = list.filter((h) => selectedStars.includes(h.stars));
    }
    if (selectedLocations.length > 0) {
      list = list.filter((h) => selectedLocations.includes(h.city));
    }
    if (selectedMeals.includes("breakfast")) list = list.filter((h) => h.hasBreakfast);
    if (selectedMeals.includes("dinner")) list = list.filter((h) => h.hasDinner);
    if (selectedMeals.includes("both")) list = list.filter((h) => h.hasBreakfast && h.hasDinner);

    if (sortBy === "price_asc") {
      list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "rating_desc") {
      list = [...list].sort((a, b) => b.score10 - a.score10);
    }

    return list;
  }, [
    enrichedHotels,
    selectedFilters,
    selectedBudgetRange,
    selectedPropertyTypes,
    selectedStars,
    selectedLocations,
    selectedMeals,
    maxBudget,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedHotels = filteredHotels.slice(
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
    if (!query) return POPULAR_HOTEL_DESTINATIONS;
    return POPULAR_HOTEL_DESTINATIONS.filter(
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
      startDate: checkIn,
      endDate: checkOut,
      guests: adults + children,
      rooms,
    });
  };

  const handleTopSearch = (e) => {
    e.preventDefault();
    setShowDestMenu(false);
    setCurrentPage(1);
    onSearchSubmit({
      q: resolveHotelQueryToDb(cityInput),
      startDate: checkIn,
      endDate: checkOut,
      guests: adults + children,
      rooms,
    });
  };

  const handleOpenBookingModal = (hotel) => {
    setModalError("");
    setBookingModalProduct(hotel);
  };

  const handleConfirmModalBook = async () => {
    setModalError("");
    const { name, email, phone } = guestContact;
    if (!name.trim()) {
      setModalError("Vui lòng nhập họ tên khách lưu trú chính.");
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
    await onConfirmReserve(bookingModalProduct, rooms);
  };

  return (
    <div className="space-y-5">
      {/* 1. TRIP.COM-STYLE UNIFIED BLUE-BORDERED 1-ROW SEARCH BAR */}
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
          <MapPinLine size={20} weight="duotone" className="shrink-0 text-[#0b5ed7]" />
          <input
            type="text"
            value={cityInput}
            onFocus={() => setShowDestMenu(true)}
            onClick={() => setShowDestMenu(true)}
            onChange={(e) => {
              setCityInput(e.target.value);
              setShowDestMenu(true);
            }}
            placeholder="City, destination, or hotel name..."
            className="w-full min-w-0 bg-transparent text-sm font-bold text-[#091e47] placeholder-slate-400 outline-none"
            style={{ border: "none" }}
          />
          {cityInput && (
            <button
              type="button"
              onClick={() => {
                setCityInput("");
                setShowDestMenu(false);
                onSearchSubmit({ q: "", startDate: checkIn, endDate: checkOut, guests: adults + children, rooms });
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
                {/* Near me */}
                <div className="p-3 pb-1.5">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      handleSelectDestination({ en: "Da Nang", dbValue: "Đà Nẵng" })
                    }
                    className="flex w-full cursor-pointer items-center gap-2.5 bg-white px-3.5 py-2.5 text-left transition hover:bg-[#f4f9ff]"
                    style={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <MapPinLine size={18} weight="fill" className="text-[#0284c7]" />
                    <span className="text-xs font-extrabold text-[#0284c7]">
                      Near me · Gần tôi
                    </span>
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
                      onSearchSubmit({ q: "", startDate: checkIn, endDate: checkOut, guests: adults + children, rooms });
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
                          {item.count} hotels nearby
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredDestOptions.length === 0 && (
                    <p className="px-4 py-5 text-center text-xs font-semibold text-slate-500">
                      Press Search to find "{cityInput}"
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Check-in & Check-out Dates */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 lg:w-[345px] lg:shrink-0 lg:flex-nowrap lg:border-r lg:border-slate-200">
          <div className="min-w-0 flex-1">
            <SkyDatePicker
              value={checkIn}
              min={today}
              shortFormat
              hideCaret
              placeholder="Check-in"
              onChange={(val) => {
                setCheckIn(val);
                if (checkOut <= val) {
                  const d = new Date(`${val}T00:00:00`);
                  d.setDate(d.getDate() + 1);
                  setCheckOut(d.toISOString().slice(0, 10));
                }
              }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400">–</span>
          <div className="min-w-0 flex-1">
            <SkyDatePicker
              value={checkOut}
              min={checkIn || today}
              align="right"
              shortFormat
              hideCaret
              placeholder="Check-out"
              onChange={(val) => setCheckOut(val)}
            />
          </div>
          <span
            className="shrink-0 font-extrabold text-[#0b5ed7]"
            style={{
              background: "#eff6ff",
              borderRadius: 9999,
              padding: "2px 8px",
              fontSize: 11,
              whiteSpace: "nowrap",
            }}
          >
            {nights} {nights > 1 ? "nights" : "night"}
          </span>
        </div>

        {/* Rooms & Guests Popover */}
        <div className="relative px-3 py-1.5 lg:w-[235px] lg:shrink-0">
          <button
            type="button"
            onClick={() => setShowGuestsMenu((v) => !v)}
            className="flex w-full cursor-pointer items-center gap-2 bg-transparent text-left"
            style={{ border: "none", padding: 0 }}
          >
            <Users size={18} weight="duotone" className="shrink-0 text-[#0b5ed7]" />
            <span className="truncate text-xs font-extrabold text-[#091e47]">
              {rooms} {rooms > 1 ? "rooms" : "room"}, {adults} {adults > 1 ? "adults" : "adult"}, {children} child
            </span>
          </button>

          {showGuestsMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowGuestsMenu(false)} />
              <div
                className="absolute right-0 top-[calc(100%+12px)] z-40 w-72 bg-white p-4 shadow-2xl"
                style={{ borderRadius: 18, border: "1px solid #dbe7fb" }}
              >
                <div className="space-y-3.5">
                  {[
                    { label: "Room", val: rooms, min: 1, max: 8, set: setRooms },
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

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* 2. TWO-COLUMN LAYOUT: LEFT FILTER SIDEBAR + RIGHT HORIZONTAL HOTEL LIST */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT SIDEBAR (3 cols) */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-3">
          {/* Crisp Real OpenStreetMap Thumbnail for Show on Map */}
          <div
            onClick={() => setShowMapPreview(true)}
            className="group relative flex h-32 cursor-pointer items-center justify-center overflow-hidden shadow-xs"
            style={{
              borderRadius: 18,
              border: "1px solid #cde0fc",
              background: "#dceeff",
            }}
          >
            {/* Real Crisp OpenStreetMap 2x1 Tile Strip (zero blur) */}
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

            {/* Subtle Decorative Map Pins */}
            <span
              className="pointer-events-none absolute left-5 top-4 h-3 w-3 rounded-full border-2 border-white bg-[#0b5ed7] shadow-sm"
            />
            <span
              className="pointer-events-none absolute right-7 top-5 h-3 w-3 rounded-full border-2 border-white bg-[#0ea5e9] shadow-sm"
            />
            <span
              className="pointer-events-none absolute bottom-4 left-12 h-3 w-3 rounded-full border-2 border-white bg-[#1d4ed8] shadow-sm"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMapPreview(true);
              }}
              className="relative z-10 inline-flex cursor-pointer items-center gap-1.5 bg-white px-4 py-2 text-xs font-extrabold text-[#0b5ed7] shadow-md transition hover:bg-blue-50"
              style={{ borderRadius: 10, border: "1px solid #dbe7fb" }}
            >
              <MapTrifold size={16} weight="duotone" />
              <span>Show on Map</span>
            </button>
          </div>

          {/* Full Trip.com-Style Multi-Section Filters Sidebar */}
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
                  { id: "great9", label: "Great 9.0+", sub: "Based on guest reviews" },
                  { id: "breakfast", label: "Breakfast included", sub: null },
                  { id: "free_cancel", label: "Free cancellation", sub: null },
                  { id: "double_bed", label: "1 double bed", sub: null },
                  { id: "private_bath", label: "Private bathroom", sub: null },
                  { id: "pool", label: "Swimming Pool", sub: null },
                  { id: "gym", label: "Gym & Fitness", sub: null },
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
                        <span className="block text-[10.5px] font-medium text-slate-400">
                          {item.sub}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Budget (Quick VND Chips + Range Slider) */}
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
                Price per room per night (excl. taxes)
              </p>

              <input
                type="range"
                min="1000000"
                max="10000000"
                step="500000"
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
                  { id: "0-1500", label: "≤ 1.5Tr" },
                  { id: "1500-2500", label: "1.5 – 2.5Tr" },
                  { id: "2500-4000", label: "2.5 – 4Tr" },
                  { id: "4000-6000", label: "4 – 6Tr" },
                  { id: "6000+", label: "> 6Tr ₫" },
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

            {/* 3. Property Type */}
            <div className="py-4">
              <h3 className="mb-3 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 13.5 }}>
                Property Type
              </h3>
              <div className="space-y-3">
                {[
                  { id: "hotels", label: "Hotels & Resorts", sub: "Including hotels, resorts, and more" },
                  { id: "homes", label: "Homes & Villas", sub: "Including villas, apartments, and more" },
                  { id: "hostels", label: "Boutique & Inns", sub: "Including boutique stays and inns" },
                ].map((pt) => (
                  <label
                    key={pt.id}
                    className="w-full cursor-pointer gap-2.5 select-none"
                    style={{ display: "flex", alignItems: "flex-start", marginBottom: 0 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPropertyTypes.includes(pt.id)}
                      onChange={() => toggleInList(setSelectedPropertyTypes, pt.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#0b5ed7]"
                    />
                    <div className="min-w-0 leading-snug">
                      <span className="block text-xs font-bold text-slate-700">{pt.label}</span>
                      <span className="block text-[10.5px] font-medium text-slate-400">{pt.sub}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Star / Diamond Rating */}
            <div className="py-4">
              <h3 className="mb-2.5 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 13.5 }}>
                Star Rating · Hạng sao
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {[5, 4, 3].map((st) => {
                  const active = selectedStars.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleInList(setSelectedStars, st)}
                      className="cursor-pointer py-1.5 text-xs font-extrabold transition"
                      style={{
                        borderRadius: 8,
                        background: active ? "#eff6ff" : "#f8fafc",
                        color: active ? "#0b5ed7" : "#334155",
                        border: active ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                      }}
                    >
                      {st} <span className="text-amber-400">★</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Location (Dynamic Cities with Show More) */}
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

            {/* 6. Meals */}
            <div className="pt-4">
              <h3 className="mb-2.5 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 13.5 }}>
                Meals · Bữa ăn
              </h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { id: "breakfast", label: "Breakfast included" },
                  { id: "dinner", label: "Dinner included" },
                  { id: "both", label: "Breakfast & Dinner Included" },
                ].map((meal) => (
                  <label
                    key={meal.id}
                    className="w-full cursor-pointer gap-2.5 select-none"
                    style={{ display: "flex", alignItems: "center", marginBottom: 0 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMeals.includes(meal.id)}
                      onChange={() => toggleInList(setSelectedMeals, meal.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#0b5ed7]"
                    />
                    <span className="text-xs font-bold text-slate-700">{meal.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT HORIZONTAL HOTEL LIST (9 cols) */}
        <div className="space-y-4 lg:col-span-9">
          {/* Sort & Count Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3.5 shadow-xs"
            style={{ borderRadius: 18, border: "1px solid #dbe7fb" }}
          >
            <div>
              <span className="text-sm font-black text-[#091e47]">
                {filteredHotels.length} properties found
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

          {/* Hotel Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-20 text-slate-400">
              <CircleNotch size={34} className="animate-spin text-[#0b5ed7]" />
              <p className="text-xs font-bold">Loading hotels · Đang tải danh sách khách sạn...</p>
            </div>
          ) : paginatedHotels.length === 0 ? (
            <div
              className="rounded-3xl bg-white p-12 text-center shadow-xs"
              style={{ border: "1px solid #dbe7fb" }}
            >
              <p className="text-base font-black text-[#091e47]">
                No hotels match your current filters
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Try clearing a filter or adjusting your budget range.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedHotels.map((hotel, idx) => {
                const isFav = favorites.includes(hotel.id);
                const BadgeIcon = hotel.badge.Icon;
                const totalStayPrice = Math.round(Number(hotel.price || 0) * nights * rooms);

                return (
                  <article
                    key={hotel.id}
                    className="overflow-hidden bg-white transition hover:shadow-lg"
                    style={{
                      borderRadius: 20,
                      border: "1px solid #dbe7fb",
                      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
                    }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Our Existing Gorgeous Hotel Photo */}
                      <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-100 md:h-auto md:w-[255px]">
                        <img
                          src={hotel.imageUrl}
                          alt={hotel.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          loading="lazy"
                        />

                        {/* Floating Badge */}
                        <span
                          className="absolute left-3 top-3 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold shadow-xs"
                          style={{
                            background: hotel.badge.bg,
                            color: hotel.badge.color,
                            borderRadius: 8,
                          }}
                        >
                          <BadgeIcon size={12} weight="fill" />
                          <span>{hotel.badge.label}</span>
                        </span>

                        {/* Favorite Heart */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(hotel.id)}
                          aria-label="Favorite hotel"
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

                      {/* Center: Full Hotel Name + Stars + Location + Room Details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2
                              className="font-black text-[#091e47]"
                              style={{ margin: 0, fontSize: 17, lineHeight: 1.3 }}
                            >
                              {hotel.name}
                            </h2>
                            <span className="inline-flex items-center gap-0.5 text-amber-400">
                              {Array.from({ length: hotel.stars }).map((_, sIdx) => (
                                <Star key={sIdx} size={13} weight="fill" />
                              ))}
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <MapPinLine size={14} weight="fill" className="shrink-0 text-[#0b5ed7]" />
                            <span>
                              {hotel.city}
                              {hotel.country
                                ? `, ${hotel.country}`
                                : /\(|singapore|tokyo|seoul|shanghai|kuala|taipei|sydney|manila/i.test(String(hotel.city || ""))
                                ? ""
                                : ", Vietnam"}{" "}
                              • Prime Location
                            </span>
                          </div>

                          {/* Perks Line */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] font-semibold text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <ThumbsUp size={13} weight="fill" className="text-[#0b5ed7]" />
                              Excellent service
                            </span>
                            {hotel.hasBreakfast && (
                              <span className="inline-flex items-center gap-1">
                                <ForkKnife size={13} weight="fill" className="text-emerald-600" />
                                Delicious breakfast
                              </span>
                            )}
                            {hotel.hasPool && (
                              <span className="inline-flex items-center gap-1">
                                <SwimmingPool size={13} weight="fill" className="text-sky-600" />
                                Pool
                              </span>
                            )}
                          </div>

                          {/* Ranking Pill */}
                          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                            <Trophy size={13} weight="fill" className="text-amber-500" />
                            <span>
                              No. {idx + 1} of {hotel.stars}-Star Select Hotels in {hotel.city}
                            </span>
                          </div>
                        </div>

                        {/* Room & Cancellation Block */}
                        <div className="mt-3.5 border-t border-slate-100 pt-3">
                          <div className="text-xs font-extrabold text-[#091e47]">
                            {hotel.roomType}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                              <CheckCircle size={13} weight="fill" />
                              Free cancellation · Miễn phí hủy
                            </span>
                            <span className="font-bold text-rose-600">
                              Only {hotel.roomsLeft} left at this price
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Rating Badge + Pricing + Check Availability CTA */}
                      <div className="flex shrink-0 items-end justify-between border-t border-slate-100 p-4 md:w-[225px] md:flex-col md:items-end md:justify-between md:border-l md:border-t-0 md:p-5">
                        {/* Rating Top Right */}
                        <div className="flex items-center gap-2">
                          <div className="text-left md:text-right">
                            <div className="text-xs font-black text-[#0b5ed7]">
                              {hotel.scoreLabel}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400">
                              {hotel.reviewCount.toLocaleString("en-US")} reviews
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
                            {hotel.score10}
                          </span>
                        </div>

                        {/* Price & CTA Bottom Right */}
                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-1.5">
                            <span className="text-xs font-semibold text-slate-400 line-through">
                              {currency.format(hotel.originalPrice)}
                            </span>
                            <span
                              className="font-black text-[#0b5ed7]"
                              style={{ fontSize: 19, whiteSpace: "nowrap" }}
                            >
                              {currency.format(hotel.price)}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[10.5px] font-semibold text-slate-500">
                            Total ({nights}n, {rooms}r):{" "}
                            <strong className="text-[#091e47]">
                              {currency.format(totalStayPrice)}
                            </strong>
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
                              Special Discount {hotel.discountPct}% off
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={busyProductId === hotel.id}
                            onClick={() => handleOpenBookingModal(hotel)}
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

      {/* 3. FULL-SCREEN INTERACTIVE HOTEL MAP MODAL */}
      {showMapPreview && (
        <HotelMapModal
          hotels={filteredHotels}
          initialCity={cityInput || selectedLocations[0] || ""}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onSelectHotel={(hotel) => {
            setShowMapPreview(false);
            handleOpenBookingModal(hotel);
          }}
          onClose={() => setShowMapPreview(false)}
        />
      )}

      {/* 4. CLEAN GUEST CONFIRMATION MODAL (Replaces clunky top-of-page form) */}
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
                  Confirm Hotel Reservation · Xác nhận đặt phòng
                </h3>
                <p className="text-[11px] font-medium text-sky-100" style={{ margin: "2px 0 0 0" }}>
                  {bookingModalProduct.name} • {formatShortEn(checkIn)} – {formatShortEn(checkOut)} ({nights}n)
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
                    {rooms} room(s) • {adults + children} guest(s) • {nights} night(s)
                  </div>
                  <div className="mt-0.5 text-sm font-black text-[#0b5ed7]">
                    {currency.format(Math.round(Number(bookingModalProduct.price || 0) * nights * rooms))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 text-xs font-extrabold text-[#163d7a]" style={{ display: "block" }}>
                    Full Name · Họ và tên khách lưu trú *
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

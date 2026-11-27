import { useMemo, useState } from "react";
import {
  CarProfile,
  CaretRight,
  CheckCircle,
  CircleNotch,
  Crown,
  GasPump,
  GearSix,
  Gift,
  Heart,
  Lightning,
  MagnifyingGlass,
  MapPinLine,
  MapTrifold,
  Minus,
  Plus,
  ShieldCheck,
  Snowflake,
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

function daysBetween(startIso, endIso) {
  if (!startIso || !endIso) return 1;
  const s = new Date(`${startIso}T00:00:00`);
  const e = new Date(`${endIso}T00:00:00`);
  const diff = Math.round((e - s) / 86400000);
  return diff > 0 ? diff : 1;
}

function nextIsoDay(iso) {
  const base = iso ? new Date(`${iso}T00:00:00`) : new Date();
  base.setDate(base.getDate() + 1);
  return base.toISOString().slice(0, 10);
}

const POPULAR_CAR_DESTINATIONS = [
  { en: "Ho Chi Minh City", dbValue: "TP. Hồ Chí Minh", region: "Tan Son Nhat Airport & City", count: "280" },
  { en: "Hanoi", dbValue: "Hà Nội", region: "Noi Bai Airport & City", count: "245" },
  { en: "Da Nang", dbValue: "Đà Nẵng", region: "Da Nang Airport & Beach", count: "210" },
  { en: "Phu Quoc", dbValue: "Phú Quốc", region: "Phu Quoc Airport & Island", count: "185" },
  { en: "Nha Trang", dbValue: "Nha Trang", region: "Cam Ranh Airport & City", count: "160" },
  { en: "Da Lat", dbValue: "Đà Lạt", region: "Lien Khuong Airport & City", count: "145" },
  { en: "Hue", dbValue: "Huế", region: "Phu Bai Airport & City", count: "120" },
  { en: "Hoi An", dbValue: "Hội An", region: "Quang Nam, Vietnam", count: "110" },
  { en: "Quy Nhon", dbValue: "Quy Nhơn", region: "Phu Cat Airport & City", count: "95" },
  { en: "Shanghai", dbValue: "Thượng Hải", region: "Pudong & Hongqiao", count: "310" },
  { en: "Seoul", dbValue: "Seoul", region: "Incheon & Gimpo", count: "340" },
  { en: "Tokyo", dbValue: "Tokyo", region: "Narita & Haneda", count: "390" },
  { en: "Singapore", dbValue: "Singapore", region: "Changi Airport & City", count: "220" },
];

function resolveCarQueryToDb(raw = "") {
  const clean = String(raw || "").trim();
  if (!clean) return "";
  const lower = clean.toLowerCase();
  const matched = POPULAR_CAR_DESTINATIONS.find(
    (d) =>
      d.en.toLowerCase() === lower ||
      d.dbValue.toLowerCase() === lower ||
      d.en.toLowerCase().includes(lower)
  );
  return matched ? matched.dbValue : clean;
}

const CAR_BADGES = [
  { label: "Best Seller · Bán chạy", Icon: Star, bg: "rgba(218, 248, 232, 0.95)", color: "#065f46" },
  { label: "Instant Confirm", Icon: Lightning, bg: "rgba(219, 238, 255, 0.95)", color: "#1e40af" },
  { label: "VIP Choice · Đẳng cấp", Icon: Crown, bg: "rgba(254, 243, 199, 0.95)", color: "#92400e" },
  { label: "Airport Pickup", Icon: Gift, bg: "rgba(243, 232, 255, 0.95)", color: "#6b21a8" },
];

const ITEMS_PER_PAGE = 10;

export default function CarResultsView({
  products = [],
  imageUrls = [],
  loading = false,
  error = "",
  q = "",
  startDate = "",
  endDate = "",
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
  const [pickupDate, setPickupDate] = useState(startDate || today);
  const [dropoffDate, setDropoffDate] = useState(endDate || nextIsoDay(startDate || today));
  const [carsCount, setCarsCount] = useState(1);
  const [passengers, setPassengers] = useState(Math.max(1, Number(guests) || 2));
  const [showCarsMenu, setShowCarsMenu] = useState(false);

  // Filters & Sort
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("");
  const [selectedCarTypes, setSelectedCarTypes] = useState([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [maxBudget, setMaxBudget] = useState(5000000);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [bookingModalProduct, setBookingModalProduct] = useState(null);
  const [modalError, setModalError] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);

  const rentalDays = daysBetween(pickupDate, dropoffDate);

  const toggleInList = (setter, id) => {
    setCurrentPage(1);
    setter((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const hasActiveFilters =
    selectedFilters.length > 0 ||
    selectedBudgetRange !== "" ||
    selectedCarTypes.length > 0 ||
    selectedTransmissions.length > 0 ||
    selectedLocations.length > 0 ||
    maxBudget < 5000000;

  const resetAllFilters = () => {
    setSelectedFilters([]);
    setSelectedBudgetRange("");
    setSelectedCarTypes([]);
    setSelectedTransmissions([]);
    setSelectedLocations([]);
    setMaxBudget(5000000);
    setCurrentPage(1);
  };

  const enrichedCars = useMemo(() => {
    return products.map((product, index) => {
      const numericRating = Number(product.rating || 4.6);
      const score10 = Math.min(9.9, Math.max(8.2, Number((numericRating * 1.98).toFixed(1))));
      const ratingLabel = score10 >= 9.3 ? "Outstanding" : score10 >= 8.8 ? "Excellent" : "Very Good";
      const reviewsCount = 620 + ((product.id * 179 + index * 97) % 3400);
      const stars = numericRating >= 4.7 ? 5 : 4;
      const price = Number(product.price_per_unit || product.price || 750000);
      const discountPct = [10, 15, 20, 12, 18][index % 5];
      const originalPrice = Math.round(price / (1 - discountPct / 100));
      const badge = CAR_BADGES[index % CAR_BADGES.length];

      const rawName = String(product.name || "");
      const lowerName = rawName.toLowerCase();

      // Infer car type
      let carType = "sedan";
      let seats = 5;
      if (/7 chỗ|mpv|innova|xpander|carnival|sedona|limousine|van|16 chỗ|minivan/i.test(lowerName)) {
        carType = "mpv";
        seats = /16 chỗ|limousine|van/i.test(lowerName) ? 16 : 7;
      } else if (/suv|fortuner|cr-v|crv|cx-5|cx5|santafe|everest|tucson|crossover|gầm cao/i.test(lowerName)) {
        carType = "suv";
        seats = /7/i.test(lowerName) ? 7 : 5;
      } else if (/mercedes|bmw|audi|lexus|vip|luxury|sang trọng|camry|porsche/i.test(lowerName)) {
        carType = "luxury";
        seats = 5;
      } else if (/vf|vinfast|điện|electric|ev|hybrid|tesla/i.test(lowerName)) {
        carType = "electric";
        seats = 5;
      }

      // Infer transmission & fuel
      const isElectric = carType === "electric" || /điện|electric|ev|hybrid|vinfast|vf/i.test(lowerName);
      const isManual = /số sàn|manual/i.test(lowerName) && !isElectric;
      const transmission = isElectric ? "electric" : isManual ? "manual" : "automatic";
      const transmissionLabel = isElectric
        ? "Electric · Tự động"
        : isManual
          ? "Manual · Số sàn"
          : "Automatic · Tự động";
      const fuelLabel = isElectric ? "Electric / EV" : /diesel|dầu/i.test(lowerName) ? "Diesel" : "Petrol";

      const hasAirportPickup = index % 4 !== 3;
      const hasUnlimitedKm = index % 3 !== 2;
      const hasFullInsurance = score10 >= 9.0 || index % 2 === 0;

      return {
        ...product,
        imageUrl: imageUrls[index] || product.image_url,
        score10,
        ratingLabel,
        reviewsCount,
        stars,
        price,
        discountPct,
        originalPrice,
        badge,
        carType,
        seats,
        transmission,
        transmissionLabel,
        fuelLabel,
        hasAirportPickup,
        hasUnlimitedKm,
        hasFullInsurance,
        spotsLeft: (index % 3) + 1,
        rankNo: (index % 10) + 1,
      };
    });
  }, [products, imageUrls]);

  const availableLocations = useMemo(() => {
    const counts = new Map();
    enrichedCars.forEach((c) => {
      const city = c.city || "Vietnam";
      counts.set(city, (counts.get(city) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [enrichedCars]);

  const filteredCars = useMemo(() => {
    let list = [...enrichedCars];

    if (selectedFilters.includes("great9")) {
      list = list.filter((c) => c.score10 >= 9.0);
    }
    if (selectedFilters.includes("automatic")) {
      list = list.filter((c) => c.transmission !== "manual");
    }
    if (selectedFilters.includes("airport")) {
      list = list.filter((c) => c.hasAirportPickup);
    }
    if (selectedFilters.includes("unlimited")) {
      list = list.filter((c) => c.hasUnlimitedKm);
    }
    if (selectedFilters.includes("insurance")) {
      list = list.filter((c) => c.hasFullInsurance);
    }

    if (selectedBudgetRange === "under600k") list = list.filter((c) => c.price <= 600000);
    else if (selectedBudgetRange === "600k_1m") list = list.filter((c) => c.price > 600000 && c.price <= 1000000);
    else if (selectedBudgetRange === "1m_1_5m") list = list.filter((c) => c.price > 1000000 && c.price <= 1500000);
    else if (selectedBudgetRange === "1_5m_2_5m") list = list.filter((c) => c.price > 1500000 && c.price <= 2500000);
    else if (selectedBudgetRange === "over2_5m") list = list.filter((c) => c.price > 2500000);

    if (selectedCarTypes.length > 0) {
      list = list.filter((c) => selectedCarTypes.includes(c.carType));
    }
    if (selectedTransmissions.length > 0) {
      list = list.filter((c) => selectedTransmissions.includes(c.transmission));
    }
    if (selectedLocations.length > 0) {
      list = list.filter((c) => selectedLocations.includes(c.city || "Vietnam"));
    }
    if (maxBudget < 5000000) {
      list = list.filter((c) => c.price <= maxBudget);
    }

    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "rating_desc") list.sort((a, b) => b.score10 - a.score10);

    return list;
  }, [
    enrichedCars,
    selectedFilters,
    selectedBudgetRange,
    selectedCarTypes,
    selectedTransmissions,
    selectedLocations,
    maxBudget,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCars = filteredCars.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const visiblePages = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, safePage + 2);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [safePage, totalPages]);

  const handleTopSearch = (e, overrideQuery) => {
    if (e) e.preventDefault();
    const raw = overrideQuery !== undefined ? overrideQuery : cityInput;
    const mappedDbCity = resolveCarQueryToDb(raw);
    setShowDestMenu(false);
    setShowCarsMenu(false);
    setCurrentPage(1);
    onSearchSubmit?.({
      q: mappedDbCity,
      startDate: pickupDate,
      endDate: dropoffDate,
      guests: passengers,
      rooms: carsCount,
    });
  };

  const handleConfirmModal = async () => {
    if (!bookingModalProduct) return;
    const { name, email, phone } = guestContact;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setModalError("Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại người thuê xe.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setModalError("Email liên hệ chưa đúng định dạng.");
      return;
    }
    setModalError("");
    await onConfirmReserve?.(bookingModalProduct, carsCount);
    setBookingModalProduct(null);
  };

  const locationHeading = q ? `for ${q}` : "for your trip";

  return (
    <div className="w-full">
      {/* TOP BLUE-BORDERED SEARCH BAR — Matching Hotel & Experiences */}
      <form
        onSubmit={handleTopSearch}
        className="mb-5 flex flex-col items-stretch bg-white p-2 shadow-lg lg:flex-row lg:items-center"
        style={{
          borderRadius: 16,
          border: "2px solid #2563eb",
          boxShadow: "0 12px 32px rgba(37, 99, 235, 0.14)",
        }}
      >
        {/* Pick-up Location Input + Popular Destination Dropdown */}
        <div className="relative flex min-w-0 flex-1 items-center gap-2.5 border-b border-slate-100 px-3.5 py-2.5 lg:border-b-0 lg:border-r">
          <CarProfile size={20} weight="duotone" className="shrink-0 text-[#091e47]" />
          <input
            type="text"
            value={cityInput}
            onFocus={() => setShowDestMenu(true)}
            onChange={(e) => {
              setCityInput(e.target.value);
              setShowDestMenu(true);
            }}
            placeholder="Pick-up city, airport, or car model..."
            className="w-full bg-transparent text-sm font-extrabold text-[#091e47] outline-none placeholder:font-semibold placeholder:text-slate-400"
            style={{ border: "none" }}
          />
          {cityInput && (
            <button
              type="button"
              onClick={() => {
                setCityInput("");
                handleTopSearch(null, "");
              }}
              aria-label="Clear location"
              className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-200 text-slate-600 transition hover:bg-slate-300"
              style={{ border: "none", padding: 0 }}
            >
              <X size={11} weight="bold" />
            </button>
          )}

          {showDestMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowDestMenu(false)} />
              <div
                className="absolute left-0 top-[calc(100%+10px)] z-40 w-[360px] max-w-[90vw] bg-white p-3.5 shadow-2xl"
                style={{ borderRadius: 16, border: "1px solid #dbe7fb" }}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Popular Pick-up Locations
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCityInput("");
                      handleTopSearch(null, "");
                    }}
                    className="cursor-pointer bg-transparent text-[11px] font-extrabold text-[#0b5ed7] hover:underline"
                    style={{ border: "none", padding: 0 }}
                  >
                    All Cities
                  </button>
                </div>

                {/* Near Me quick row */}
                <button
                  type="button"
                  onClick={() => {
                    setCityInput("Ho Chi Minh City");
                    handleTopSearch(null, "TP. Hồ Chí Minh");
                  }}
                  className="mb-2 flex w-full cursor-pointer items-center gap-2.5 rounded-xl bg-blue-50/80 px-3 py-2 text-left transition hover:bg-blue-100/80"
                  style={{ border: "1px solid #dbeafe" }}
                >
                  <MapPinLine size={16} weight="fill" className="text-[#0b5ed7]" />
                  <div>
                    <div className="text-xs font-extrabold text-[#0b5ed7]">Near me · Gần tôi</div>
                    <div className="text-[10.5px] font-semibold text-slate-500">
                      Tan Son Nhat Airport &amp; Ho Chi Minh City
                    </div>
                  </div>
                </button>

                <div className="max-h-60 overflow-y-auto pr-1">
                  {POPULAR_CAR_DESTINATIONS.filter(
                    (d) =>
                      !cityInput.trim() ||
                      d.en.toLowerCase().includes(cityInput.toLowerCase()) ||
                      d.dbValue.toLowerCase().includes(cityInput.toLowerCase())
                  ).map((dest) => (
                    <button
                      key={dest.en}
                      type="button"
                      onClick={() => {
                        setCityInput(dest.en);
                        handleTopSearch(null, dest.dbValue);
                      }}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left transition hover:bg-slate-50"
                      style={{ border: "none", background: "transparent" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPinLine size={15} weight="duotone" className="text-slate-400" />
                        <div>
                          <div className="text-xs font-extrabold text-[#091e47]">{dest.en}</div>
                          <div className="text-[10.5px] font-semibold text-slate-400">{dest.region}</div>
                        </div>
                      </div>
                      <span className="text-[10.5px] font-bold text-slate-400">{dest.count} cars</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pick-up & Drop-off Dates */}
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3.5 py-2 lg:w-[385px] lg:border-b-0 lg:border-r">
          <div className="min-w-0 flex-1">
            <SkyDatePicker
              value={pickupDate}
              min={today}
              dualMonth
              shortFormat
              hideCaret
              placeholder="Pick-up"
              onChange={(val) => {
                setPickupDate(val);
                if (dropoffDate && dropoffDate <= val) {
                  setDropoffDate(nextIsoDay(val));
                }
              }}
            />
          </div>
          <span className="text-xs font-bold text-slate-300">—</span>
          <div className="min-w-0 flex-1">
            <SkyDatePicker
              value={dropoffDate}
              min={nextIsoDay(pickupDate)}
              dualMonth
              shortFormat
              hideCaret
              align="right"
              placeholder="Drop-off"
              onChange={(val) => setDropoffDate(val)}
            />
          </div>
          <span
            className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-600"
            style={{ whiteSpace: "nowrap" }}
          >
            {rentalDays} {rentalDays > 1 ? "days" : "day"}
          </span>
        </div>

        {/* Cars & Passengers Popover */}
        <div className="relative shrink-0 px-3.5 py-2 lg:w-[195px]">
          <button
            type="button"
            onClick={() => setShowCarsMenu((v) => !v)}
            className="flex w-full cursor-pointer items-center gap-2 bg-transparent text-left"
            style={{ border: "none", padding: 0 }}
          >
            <Users size={18} weight="duotone" className="shrink-0 text-[#091e47]" />
            <span className="truncate text-xs font-extrabold text-[#091e47]">
              {carsCount} {carsCount > 1 ? "cars" : "car"}, {passengers} pax
            </span>
          </button>

          {showCarsMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowCarsMenu(false)} />
              <div
                className="absolute right-0 top-[calc(100%+12px)] z-40 w-[270px] bg-white p-4 shadow-2xl"
                style={{ borderRadius: 16, border: "1px solid #dbe7fb" }}
              >
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#091e47]">Cars · Số xe</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCarsCount((c) => Math.max(1, c - 1))}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-[#0b5ed7]"
                        style={{ border: "none" }}
                      >
                        <Minus size={12} weight="bold" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-[#091e47]">{carsCount}</span>
                      <button
                        type="button"
                        onClick={() => setCarsCount((c) => Math.min(5, c + 1))}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-[#0b5ed7]"
                        style={{ border: "none" }}
                      >
                        <Plus size={12} weight="bold" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#091e47]">Passengers · Hành khách</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600"
                        style={{ border: "none" }}
                      >
                        <Minus size={12} weight="bold" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-[#091e47]">{passengers}</span>
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.min(16, p + 1))}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-[#0b5ed7]"
                        style={{ border: "none" }}
                      >
                        <Plus size={12} weight="bold" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCarsMenu(false)}
                    className="mt-1 w-full cursor-pointer py-2 text-xs font-extrabold text-white"
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
            </>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold text-white shadow-md transition hover:brightness-105"
          style={{
            background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
            borderRadius: 12,
            border: "none",
            minHeight: 46,
            whiteSpace: "nowrap",
          }}
        >
          <MagnifyingGlass size={16} weight="bold" />
          <span>Search</span>
        </button>
      </form>

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* LEFT SIDEBAR */}
        <aside className="w-full shrink-0 lg:w-[286px]">
          {/* Crisp OpenStreetMap "Show on Map" Thumbnail */}
          <div
            onClick={() => setShowMapModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setShowMapModal(true)}
            className="group relative mb-4 cursor-pointer overflow-hidden shadow-sm transition hover:shadow-md"
            style={{
              height: 126,
              borderRadius: 16,
              border: "1px solid #dbe7fb",
              background: "#e5eff9",
            }}
          >
            <div className="pointer-events-none absolute inset-0 grid grid-cols-2">
              <img
                src="https://tile.openstreetmap.org/12/3283/1869.png"
                alt="Map preview left"
                className="h-full w-full object-cover opacity-95 transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <img
                src="https://tile.openstreetmap.org/12/3284/1869.png"
                alt="Map preview right"
                className="h-full w-full object-cover opacity-95 transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <span
              className="pointer-events-none absolute left-9 top-6 h-3 w-3 rounded-full bg-[#2563eb]"
              style={{ border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.28)" }}
            />
            <span
              className="pointer-events-none absolute right-10 top-5 h-3 w-3 rounded-full bg-[#0ea5e9]"
              style={{ border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.28)" }}
            />
            <span
              className="pointer-events-none absolute bottom-5 left-16 h-3 w-3 rounded-full bg-[#1d4ed8]"
              style={{ border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.28)" }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="inline-flex items-center gap-2 bg-white px-4 py-2 text-xs font-extrabold text-[#1d4ed8] shadow-md transition group-hover:bg-[#1d4ed8] group-hover:text-white"
                style={{ borderRadius: 10, border: "1px solid #dbeafe" }}
              >
                <MapTrifold size={16} weight="duotone" />
                <span>Show on Map</span>
              </span>
            </div>
          </div>

          {/* 5-Section Filter Panel */}
          <div
            className="bg-white p-5 shadow-sm"
            style={{ borderRadius: 18, border: "1px solid #e2ecfb" }}
          >
            {/* 1. Popular Filters */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 15 }}>
                Popular filters {locationHeading}
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="cursor-pointer bg-transparent text-[11px] font-extrabold text-[#0b5ed7] hover:underline"
                  style={{ border: "none", padding: 0 }}
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2.5 border-b border-slate-100 pb-4">
              {[
                { id: "great9", label: "Great 9.0+", sub: "Based on driver reviews" },
                { id: "freeCancel", label: "Free cancellation" },
                { id: "automatic", label: "Automatic transmission" },
                { id: "airport", label: "Airport pickup available" },
                { id: "unlimited", label: "Unlimited mileage" },
                { id: "insurance", label: "Full insurance included" },
              ].map((item) => {
                const checked = selectedFilters.includes(item.id);
                return (
                  <label
                    key={item.id}
                    style={{ display: "flex" }}
                    className="cursor-pointer items-start gap-2.5 text-xs font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleInList(setSelectedFilters, item.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#2563eb]"
                    />
                    <span className="leading-snug">
                      <span className="block font-bold text-[#091e47]">{item.label}</span>
                      {item.sub && (
                        <span className="block text-[11px] font-medium text-slate-400">{item.sub}</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* 2. Budget */}
            <div className="border-b border-slate-100 py-4">
              <div className="mb-1 flex items-center justify-between">
                <h4 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 14 }}>
                  Budget
                </h4>
                <span className="text-xs font-extrabold text-[#0b5ed7]">
                  ≤ {currency.format(maxBudget)}
                </span>
              </div>
              <p className="mb-3 text-[11px] font-medium text-slate-400" style={{ margin: "0 0 10px 0" }}>
                Price per car per day
              </p>

              <input
                type="range"
                min={400000}
                max={5000000}
                step={100000}
                value={maxBudget}
                onChange={(e) => {
                  setMaxBudget(Number(e.target.value));
                  setSelectedBudgetRange("");
                  setCurrentPage(1);
                }}
                className="mb-3 w-full cursor-pointer accent-[#2563eb]"
              />

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "under600k", label: "≤ 600K" },
                  { id: "600k_1m", label: "600K – 1Tr" },
                  { id: "1m_1_5m", label: "1 – 1.5Tr" },
                  { id: "1_5m_2_5m", label: "1.5 – 2.5Tr" },
                  { id: "over2_5m", label: "> 2.5Tr ₫" },
                ].map((chip) => {
                  const active = selectedBudgetRange === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        setSelectedBudgetRange(active ? "" : chip.id);
                        setMaxBudget(5000000);
                        setCurrentPage(1);
                      }}
                      className="cursor-pointer rounded-lg px-1.5 py-1.5 text-[11px] font-bold transition"
                      style={{
                        background: active ? "#eff6ff" : "#f8fafc",
                        color: active ? "#1d4ed8" : "#334155",
                        border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Car Type */}
            <div className="border-b border-slate-100 py-4">
              <h4 className="mb-2.5 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 14 }}>
                Car Type · Loại xe
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { id: "sedan", label: "Sedan · 4–5 seats" },
                  { id: "suv", label: "SUV & Crossover" },
                  { id: "mpv", label: "MPV & 7–16 Seater" },
                  { id: "luxury", label: "Luxury & VIP" },
                  { id: "electric", label: "Electric / VinFast EV" },
                ].map((cat) => (
                  <label
                    key={cat.id}
                    style={{ display: "flex" }}
                    className="cursor-pointer items-center gap-2.5 text-xs font-bold text-[#091e47]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCarTypes.includes(cat.id)}
                      onChange={() => toggleInList(setSelectedCarTypes, cat.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[#2563eb]"
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Transmission */}
            <div className="border-b border-slate-100 py-4">
              <h4 className="mb-2.5 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 14 }}>
                Transmission · Hộp số
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { id: "automatic", label: "Automatic · Số tự động" },
                  { id: "manual", label: "Manual · Số sàn" },
                  { id: "electric", label: "Electric / Hybrid" },
                ].map((tr) => (
                  <label
                    key={tr.id}
                    style={{ display: "flex" }}
                    className="cursor-pointer items-center gap-2.5 text-xs font-bold text-[#091e47]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTransmissions.includes(tr.id)}
                      onChange={() => toggleInList(setSelectedTransmissions, tr.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[#2563eb]"
                    />
                    <span>{tr.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Location */}
            <div className="pt-4">
              <h4 className="mb-2.5 font-black text-[#091e47]" style={{ margin: "0 0 10px 0", fontSize: 14 }}>
                Location · Khu vực
              </h4>
              <div className="flex flex-col gap-2">
                {(showAllLocations ? availableLocations : availableLocations.slice(0, 5)).map(
                  ([locName, count]) => (
                    <label
                      key={locName}
                      style={{ display: "flex" }}
                      className="cursor-pointer items-center justify-between gap-2 text-xs font-bold text-[#091e47]"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(locName)}
                          onChange={() => toggleInList(setSelectedLocations, locName)}
                          className="h-4 w-4 shrink-0 cursor-pointer accent-[#2563eb]"
                        />
                        <span className="truncate">{locName}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{count}</span>
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
                  {showAllLocations ? "Show Less" : `Show More (${availableLocations.length - 5})`}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT RESULTS COLUMN */}
        <section className="min-w-0 flex-1">
          {/* Result Count + Sort Bar */}
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3.5 shadow-xs"
            style={{ borderRadius: 16, border: "1px solid #e2ecfb" }}
          >
            <div className="text-sm font-black text-[#091e47]">
              {loading ? "Searching cars..." : `${filteredCars.length} cars found`}
              {q && <span className="ml-1.5 text-xs font-bold text-slate-500">in {q}</span>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "recommended", label: "Recommended" },
                { id: "price_asc", label: "Lowest price" },
                { id: "rating_desc", label: "Top rated" },
              ].map((opt) => {
                const active = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id);
                      setCurrentPage(1);
                    }}
                    className="cursor-pointer px-3.5 py-1.5 text-xs font-extrabold transition"
                    style={{
                      borderRadius: 9999,
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#1d4ed8" : "#475569",
                      border: active ? "1px solid #bfdbfe" : "1px solid transparent",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-56 animate-pulse bg-white/80"
                  style={{ borderRadius: 18, border: "1px solid #e2ecfb" }}
                />
              ))}
            </div>
          ) : paginatedCars.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center bg-white px-6 py-14 text-center"
              style={{ borderRadius: 18, border: "1px solid #e2ecfb" }}
            >
              <CarProfile size={44} weight="duotone" className="mb-3 text-sky-500" />
              <h3 className="font-black text-[#091e47]" style={{ margin: "0 0 6px 0", fontSize: 18 }}>
                No matching cars found
              </h3>
              <p className="mb-4 max-w-md text-xs font-medium text-slate-500">
                Try clearing some filters or picking another pick-up city to explore all available cars.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="cursor-pointer px-5 py-2.5 text-xs font-extrabold text-white"
                style={{
                  background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
                  borderRadius: 9999,
                  border: "none",
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Horizontal Car Cards */}
              <div className="flex flex-col gap-4">
                {paginatedCars.map((car) => {
                  const isFav = favorites.includes(car.id);
                  const BadgeIcon = car.badge.Icon;
                  const totalEstimate = car.price * rentalDays * carsCount;

                  return (
                    <article
                      key={car.id}
                      className="overflow-hidden bg-white shadow-xs transition hover:shadow-md"
                      style={{
                        borderRadius: 18,
                        border: "1px solid #e2ecfb",
                      }}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Left: Existing Gorgeous Car Photo (uniform 236px height on desktop) */}
                        <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-100 md:h-[236px] md:w-[255px]">
                          <img
                            src={car.imageUrl}
                            alt={car.name}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                            loading="lazy"
                          />

                          <span
                            className="absolute left-3 top-3 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold shadow-xs"
                            style={{
                              background: car.badge.bg,
                              color: car.badge.color,
                              borderRadius: 8,
                            }}
                          >
                            <BadgeIcon size={12} weight="fill" />
                            <span>{car.badge.label}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleFavorite(car.id)}
                            aria-label="Favorite car"
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

                        {/* Center: Car Title + Location + Specs + Perks */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2
                                className="font-black text-[#091e47]"
                                style={{ margin: 0, fontSize: 17, lineHeight: 1.3 }}
                              >
                                {car.name}
                              </h2>
                              <span className="inline-flex items-center gap-0.5 text-amber-400">
                                {Array.from({ length: car.stars }).map((_, sIdx) => (
                                  <Star key={sIdx} size={13} weight="fill" />
                                ))}
                              </span>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
                              <MapPinLine size={14} weight="fill" className="shrink-0 text-[#0b5ed7]" />
                              <span>
                                {car.city}
                                {/\(|singapore|tokyo|seoul|shanghai|kuala|taipei|sydney|manila/i.test(
                                  String(car.city || "")
                                )
                                  ? ""
                                  : ", Vietnam"}{" "}
                                • Airport &amp; City Pickup
                              </span>
                            </div>

                            {/* Vehicle Specs Row */}
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-semibold text-slate-600">
                              <span className="inline-flex items-center gap-1">
                                <Users size={13} weight="fill" className="text-[#0b5ed7]" />
                                {car.seats} seats · {car.seats} chỗ
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <GearSix size={13} weight="fill" className="text-sky-600" />
                                {car.transmissionLabel}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Snowflake size={13} weight="fill" className="text-cyan-600" />
                                A/C
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <GasPump size={13} weight="fill" className="text-emerald-600" />
                                {car.fuelLabel}
                              </span>
                            </div>

                            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                              <Trophy size={13} weight="fill" className="text-amber-500" />
                              <span>
                                Top #{car.rankNo} Popular Rental Car in {car.city}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2.5 text-[11.5px]">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                              <CheckCircle size={14} weight="fill" />
                              Free cancellation · Miễn phí hủy 24h
                            </span>
                            {car.hasUnlimitedKm && (
                              <span className="inline-flex items-center gap-1 font-bold text-sky-700">
                                <ThumbsUp size={13} weight="fill" />
                                Unlimited km
                              </span>
                            )}
                            <span className="font-bold text-rose-600">
                              Only {car.spotsLeft} {car.spotsLeft > 1 ? "cars" : "car"} left today
                            </span>
                          </div>
                        </div>

                        {/* Right: Rating + Price + Check Availability CTA (NO flex-row class — Bootstrap safe!) */}
                        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 p-4 md:w-[220px] md:flex-col md:items-end md:justify-between md:border-l md:border-t-0 sm:p-5">
                          {/* Rating Badge */}
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-xs font-extrabold text-[#1d4ed8]">{car.ratingLabel}</div>
                              <div className="text-[10.5px] font-semibold text-slate-400">
                                {car.reviewsCount.toLocaleString("en-US")} reviews
                              </div>
                            </div>
                            <span
                              className="flex h-9 w-10 items-center justify-center text-sm font-black text-white shadow-xs"
                              style={{
                                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                                borderRadius: "10px 10px 10px 2px",
                              }}
                            >
                              {car.score10.toFixed(1)}
                            </span>
                          </div>

                          {/* Price & CTA */}
                          <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-400 line-through">
                                {currency.format(car.originalPrice)}
                              </span>
                              <span className="text-lg font-black text-[#1d4ed8]" style={{ whiteSpace: "nowrap" }}>
                                {currency.format(car.price)}
                              </span>
                            </div>

                            <div className="text-[10.5px] font-semibold text-slate-500">
                              Total ({rentalDays}d, {carsCount} {carsCount > 1 ? "cars" : "car"}):{" "}
                              <strong className="text-[#091e47]">{currency.format(totalEstimate)}</strong>
                            </div>

                            <span
                              className="mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-extrabold"
                              style={{ background: "#fff1f2", color: "#e11d48" }}
                            >
                              <Tag size={10} weight="fill" />
                              Special Discount {car.discountPct}% off
                            </span>

                            <button
                              type="button"
                              disabled={busyProductId === car.id}
                              onClick={() => {
                                setModalError("");
                                setBookingModalProduct(car);
                              }}
                              className="mt-2.5 inline-flex cursor-pointer items-center justify-center gap-1 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
                              style={{
                                background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
                                borderRadius: 10,
                                border: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {busyProductId === car.id ? (
                                <>
                                  <CircleNotch size={14} className="animate-spin" />
                                  <span>Booking...</span>
                                </>
                              ) : (
                                <>
                                  <span>Check Availability</span>
                                  <CaretRight size={13} weight="bold" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 140, behavior: "smooth" });
                    }}
                    className="cursor-pointer rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-xs transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ border: "1px solid #dbe7fb" }}
                  >
                    Prev
                  </button>

                  {visiblePages.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setCurrentPage(p);
                        window.scrollTo({ top: 140, behavior: "smooth" });
                      }}
                      className="cursor-pointer rounded-xl px-3.5 py-2 text-xs font-extrabold transition"
                      style={{
                        background: p === safePage ? "#2563eb" : "#ffffff",
                        color: p === safePage ? "#ffffff" : "#334155",
                        border: p === safePage ? "1px solid #2563eb" : "1px solid #dbe7fb",
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 140, behavior: "smooth" });
                    }}
                    className="cursor-pointer rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-xs transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ border: "1px solid #dbe7fb" }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* DRIVER & RENTAL CONFIRMATION MODAL */}
      {bookingModalProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-white p-6 shadow-2xl"
            style={{ borderRadius: 22, border: "1px solid #dbe7fb" }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0b5ed7]">
                  Car Rental Reservation
                </span>
                <h3 className="mt-0.5 font-black text-[#091e47]" style={{ margin: 0, fontSize: 18 }}>
                  {bookingModalProduct.name}
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500" style={{ margin: "4px 0 0 0" }}>
                  {bookingModalProduct.city} • {formatShortEn(pickupDate)} – {formatShortEn(dropoffDate)} (
                  {rentalDays} {rentalDays > 1 ? "days" : "day"}) • {carsCount} {carsCount > 1 ? "cars" : "car"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalProduct(null)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600"
                style={{ border: "none" }}
              >
                <X size={15} weight="bold" />
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-2xl bg-blue-50/80 px-4 py-3">
              <div className="text-xs font-bold text-[#091e47]">
                Estimated Total ({rentalDays}d × {carsCount} {carsCount > 1 ? "cars" : "car"})
              </div>
              <div className="text-base font-black text-[#1d4ed8]">
                {currency.format(bookingModalProduct.price * rentalDays * carsCount)}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label
                  style={{ display: "block" }}
                  className="mb-1 text-xs font-extrabold text-[#091e47]"
                >
                  Họ và tên người thuê xe *
                </label>
                <input
                  type="text"
                  value={guestContact.name}
                  onChange={(e) => setGuestContact((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-[#091e47] outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    style={{ display: "block" }}
                    className="mb-1 text-xs font-extrabold text-[#091e47]"
                  >
                    Email nhận xác nhận *
                  </label>
                  <input
                    type="email"
                    value={guestContact.email}
                    onChange={(e) => setGuestContact((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-[#091e47] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    style={{ display: "block" }}
                    className="mb-1 text-xs font-extrabold text-[#091e47]"
                  >
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={guestContact.phone}
                    onChange={(e) => setGuestContact((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0901234567"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-[#091e47] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {modalError && (
              <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">
                {modalError}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <ShieldCheck size={15} weight="fill" />
                Free cancellation 24h before pick-up
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBookingModalProduct(null)}
                  className="cursor-pointer rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-600"
                  style={{ border: "none" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmModal}
                  className="cursor-pointer rounded-full px-5 py-2 text-xs font-extrabold text-white shadow-sm"
                  style={{
                    background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
                    border: "none",
                  }}
                >
                  Confirm Rental
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN INTERACTIVE OPENSTREETMAP MODAL */}
      {showMapModal && (
        <HotelMapModal
          onClose={() => setShowMapModal(false)}
          hotels={filteredCars}
          cityQuery={q}
          nights={rentalDays}
          rooms={carsCount}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onSelectHotel={(item) => {
            setShowMapModal(false);
            setModalError("");
            setBookingModalProduct(item);
          }}
        />
      )}
    </div>
  );
}

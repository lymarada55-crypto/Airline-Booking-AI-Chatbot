import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AirplaneInFlight,
  AirplaneTilt,
  Armchair,
  ArrowLeft,
  ArrowRight,
  Check,
  ForkKnife,
  Gift,
  LockKey,
  PencilSimple,
  Plus,
  ShieldCheck,
  Sparkle,
  SuitcaseRolling,
  X,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_SERVICES_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const DEFAULT_MOCK_SERVICES = [
  {
    id: 1,
    name: "Hành lý ký gửi 20kg",
    enLabel: "Checked Baggage",
    highlight: "20kg",
    description: "Tận hưởng hành trình thoải mái hơn với 20kg hành lý ký gửi.",
    price: 250000,
    badge: "Popular · Phổ biến",
    badgeStyle: "primary",
    unit: "gói",
    weightTag: "20kg",
    tags: ["Áp dụng cho mọi hành khách", "Hỗ trợ sân bay"],
    image:
      "https://static.vecteezy.com/system/resources/previews/036/209/973/non_2x/ai-generated-flying-suitcase-on-blue-airplane-business-travel-mode-generated-by-ai-free-photo.jpg",
  },
  {
    id: 2,
    name: "Hành lý ký gửi 30kg",
    enLabel: "Extra Baggage",
    highlight: "30kg",
    description: "Thích hợp cho chuyến đi dài ngày, công tác và mua sắm quà tặng.",
    price: 400000,
    badge: "Best Value · Tiết kiệm hơn",
    badgeStyle: "soft",
    unit: "gói",
    weightTag: "30kg",
    tags: ["Áp dụng cho mọi hành khách", "Hỗ trợ sân bay"],
    image:
      "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Suất ăn nóng trên máy bay",
    enLabel: "Hot In-Flight Meal",
    highlight: "Combo nóng",
    description: "Thực đơn món nóng chuẩn bếp hàng không kèm nước suối hoặc trà.",
    price: 120000,
    badge: "Hot Meal · Suất ăn",
    badgeStyle: "soft",
    unit: "suất",
    tags: ["Phục vụ tận ghế", "Kèm đồ uống"],
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Ưu tiên làm thủ tục (SkyPriority)",
    enLabel: "Priority Check-in",
    highlight: "SkyPriority",
    description: "Quầy check-in riêng, luồng ưu tiên và lên tàu bay trước tiên.",
    price: 150000,
    badge: "VIP Priority",
    badgeStyle: "primary",
    unit: "khách",
    tags: ["Quầy ưu tiên riêng", "Lên máy bay trước"],
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop",
  },
];

const FALLBACK_IMAGES = [
  "https://static.vecteezy.com/system/resources/previews/036/209/973/non_2x/ai-generated-flying-suitcase-on-blue-airplane-business-travel-mode-generated-by-ai-free-photo.jpg",
  "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop",
];

function getSeatMultiplier(seatNumber = "") {
  const match = String(seatNumber).match(/(\d+)/);
  const rowNum = match ? Number(match[1]) : 10;
  if (rowNum >= 1 && rowNum <= 5) return 1.2;
  if (rowNum >= 15) return 0.95;
  return 1;
}

function formatVnd(amount) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(amount) || 0))} ₫`;
}

function formatDateEn(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(String(dateStr).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "—";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTimeHm(dateStr) {
  if (!dateStr) return "--:--";
  const d = new Date(String(dateStr).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getServiceDisplayMeta(service, idx = 0) {
  const nameLower = String(service?.name || "").toLowerCase();
  if (nameLower.includes("20")) {
    return {
      titleTop: "Hành lý ký gửi",
      highlight: "20kg",
      badge: "Popular · Phổ biến",
      badgePrimary: true,
      icon: <SuitcaseRolling size={14} weight="fill" />,
      unit: "gói",
      tag1: "Mọi hành khách",
      tag2: "Hỗ trợ sân bay",
    };
  }
  if (nameLower.includes("30")) {
    return {
      titleTop: "Hành lý ký gửi",
      highlight: "30kg",
      badge: "Best Value · Tiết kiệm",
      badgePrimary: false,
      icon: <SuitcaseRolling size={14} weight="fill" />,
      unit: "gói",
      tag1: "Mọi hành khách",
      tag2: "Hỗ trợ sân bay",
    };
  }
  if (nameLower.includes("ăn") || nameLower.includes("meal")) {
    return {
      titleTop: "Suất ăn nóng",
      highlight: "Hot Meal",
      badge: "In-Flight Meal",
      badgePrimary: false,
      icon: <ForkKnife size={14} weight="fill" />,
      unit: "suất",
      tag1: "Phục vụ tận ghế",
      tag2: "Kèm đồ uống",
    };
  }
  if (nameLower.includes("ưu tiên") || nameLower.includes("priority")) {
    return {
      titleTop: "Ưu tiên thủ tục",
      highlight: "SkyPriority",
      badge: "VIP Priority",
      badgePrimary: true,
      icon: <Sparkle size={14} weight="fill" />,
      unit: "khách",
      tag1: "Quầy check-in riêng",
      tag2: "Lên tàu bay trước",
    };
  }
  return {
    titleTop: service?.name || "Dịch vụ bổ sung",
    highlight: idx === 0 ? "Popular" : "Add-on",
    badge: service?.badge || "Add-on",
    badgePrimary: idx % 2 === 0,
    icon: <Sparkle size={14} weight="fill" />,
    unit: service?.unit || "gói",
    tag1: service?.tags?.[0] || "Áp dụng cho mọi hành khách",
    tag2: service?.tags?.[1] || "Hỗ trợ sân bay",
  };
}

export default function ServiceSelection() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("selected_services") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  let selectedFlights = [];
  let selectedSeats = { outbound: [], return: [] };
  let searchParams = {
    passengers: { adults: 1, children: 0 },
    cabinClass: "economy",
  };

  try {
    selectedFlights = JSON.parse(localStorage.getItem("selected_flights") || "[]");
    selectedSeats = JSON.parse(
      localStorage.getItem("selected_seats") || '{"outbound":[],"return":[]}'
    );
    const parsedSearch = JSON.parse(localStorage.getItem("search_params") || "null");
    if (parsedSearch) searchParams = parsedSearch;
  } catch {
    // ignore storage errors
  }

  const totalPassengers = Math.max(
    1,
    (Number(searchParams.passengers?.adults) || 1) +
      (Number(searchParams.passengers?.children) || 0)
  );

  const primaryFlight = selectedFlights[0] || {
    departure_airport: { code: "HAN", city: "Hà Nội" },
    arrival_airport: { code: "SGN", city: "Hồ Chí Minh" },
    departure_time: new Date().toISOString(),
    arrival_time: new Date(Date.now() + 7200000).toISOString(),
    display_price: 1200000,
    base_price: 1200000,
  };

  const depCity =
    primaryFlight.departure_airport?.city ||
    primaryFlight.departure_airport?.city_name ||
    primaryFlight.departure_airport?.code ||
    "Hà Nội";
  const depCode = primaryFlight.departure_airport?.code || "HAN";
  const arrCity =
    primaryFlight.arrival_airport?.city ||
    primaryFlight.arrival_airport?.city_name ||
    primaryFlight.arrival_airport?.code ||
    "Hồ Chí Minh";
  const arrCode = primaryFlight.arrival_airport?.code || "SGN";

  const cabinLabel =
    String(searchParams.cabinClass || "").toLowerCase().includes("business") ||
    String(searchParams.cabinClass || "").toLowerCase().includes("thương gia")
      ? "Thương gia"
      : "Phổ thông";

  const outboundSeatsList = Array.isArray(selectedSeats?.outbound)
    ? selectedSeats.outbound
    : [];
  const returnSeatsList = Array.isArray(selectedSeats?.return)
    ? selectedSeats.return
    : [];

  const calcLegFare = (flight, seatsList) => {
    if (!flight) return 0;
    const base = Number(flight.display_price || flight.base_price || 0);
    if (seatsList.length > 0) {
      return seatsList.reduce(
        (sum, s) => sum + Math.round(base * getSeatMultiplier(s.seat_number)),
        0
      );
    }
    return base * totalPassengers;
  };

  const flightFareTotal =
    selectedFlights.length > 0
      ? calcLegFare(selectedFlights[0], outboundSeatsList) +
        (selectedFlights[1] ? calcLegFare(selectedFlights[1], returnSeatsList) : 0)
      : Number(primaryFlight.display_price || primaryFlight.base_price || 0);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setServices(list.length > 0 ? list : DEFAULT_MOCK_SERVICES);
      })
      .catch(() => {
        setServices(DEFAULT_MOCK_SERVICES);
      })
      .finally(() => setLoading(false));
  }, []);

  const getServiceImage = (service, idx = 0) => {
    const nameLower = (service?.name || "").toLowerCase();
    const idNum = Number(service?.id || 0);

    if (idNum === 1 || nameLower.includes("20")) return FALLBACK_IMAGES[0];
    if (idNum === 2 || nameLower.includes("30")) return FALLBACK_IMAGES[1];
    if (idNum === 3 || nameLower.includes("ăn") || nameLower.includes("món"))
      return FALLBACK_IMAGES[2];
    if (
      idNum === 4 ||
      nameLower.includes("ưu tiên") ||
      nameLower.includes("thủ tục")
    )
      return FALLBACK_IMAGES[3];

    if (
      service?.image &&
      typeof service.image === "string" &&
      service.image.startsWith("http") &&
      !service.image.includes("dsmcdn") &&
      !service.image.includes("googleapis") &&
      !service.image.includes("1553531384-397c80973a0b")
    ) {
      return service.image;
    }

    return FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
  };

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      if (prev.some((s) => s.id === service.id)) {
        return prev.filter((s) => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const servicesTotal = selectedServices.reduce(
    (sum, s) => sum + Number(s.price || 0),
    0
  );
  const grandTotal = Number(flightFareTotal) + servicesTotal;

  const handleNextStep = () => {
    localStorage.setItem("selected_services", JSON.stringify(selectedServices));
    navigate("/checkout");
  };

  const displayedServices = services.length > 0 ? services : DEFAULT_MOCK_SERVICES;
  const seatSummaryText =
    outboundSeatsList.length > 0
      ? outboundSeatsList.map((s) => s.seat_number).join(", ") +
        (returnSeatsList.length > 0
          ? ` / ${returnSeatsList.map((s) => s.seat_number).join(", ")}`
          : "")
      : "Chưa chọn";

  return (
    <div
      className="relative min-h-screen font-sans text-slate-900"
      style={{
        background:
          "linear-gradient(180deg, #b8dcff 0%, #dceeff 24%, #eef6ff 60%, #d6eaff 100%)",
      }}
    >
      <Navbar />

      {/* 1. HERO HEADER BANNER (Synced 5-Star SkyLink Style matching Mockup) */}
      <div className="relative overflow-hidden pb-6 pt-22">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: 280 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.85) 46%, rgba(225,241,255,0.20) 100%)",
            }}
          />
          <img
            src={HERO_SERVICES_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 32%",
              opacity: 0.9,
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 34%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 34%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 92,
              background:
                "linear-gradient(180deg, rgba(220,238,255,0) 0%, #dceeff 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/seat-selection")}
              className="inline-flex items-center gap-2 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-[#16428b] shadow-sm transition hover:bg-white"
              style={{
                border: "1px solid rgba(255,255,255,0.96)",
                borderRadius: 9999,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Back to Seat Selection · Quay lại</span>
            </button>

            {/* 4-Step Progress Bar with Active Blue Pill on Step 3 matching Mockup */}
            <div
              className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-1 text-xs font-bold shadow-xs"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,255,255,0.98)",
                borderRadius: 9999,
              }}
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-emerald-700">
                <Check size={13} weight="bold" />
                1. Flights
              </span>
              <span className="text-slate-300">›</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-emerald-700">
                <Check size={13} weight="bold" />
                2. Seat Selection
              </span>
              <span className="text-slate-300">›</span>
              <span
                className="inline-flex items-center gap-1 font-extrabold text-white shadow-xs"
                style={{
                  background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                  borderRadius: 9999,
                  padding: "3px 12px",
                }}
              >
                <Check size={12} weight="bold" />
                3. Add-ons · Dịch vụ
              </span>
              <span className="text-slate-300">›</span>
              <span className="px-2 py-0.5 text-slate-400">4. Payment</span>
            </div>
          </div>

          <p
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em]"
            style={{ color: "#0b57d0", margin: "0 0 2px 0" }}
          >
            <AirplaneTilt size={15} weight="fill" />
            STEP 3/4 • FLIGHT ADD-ONS (OPTIONAL) • TIỆN ÍCH CHUYẾN BAY
          </p>
          <h1
            className="font-black tracking-tight"
            style={{
              fontSize: "clamp(1.85rem, 3.2vw, 2.5rem)",
              color: "#091e47",
              lineHeight: 1.12,
              margin: "0 0 6px 0",
            }}
          >
            Dịch vụ bổ sung
          </h1>
          <p
            className="max-w-2xl text-xs font-semibold text-[#2d4b7a] sm:text-sm"
            style={{ margin: 0 }}
          >
            Add extra baggage, hot meals, or priority check-in — tiết kiệm hơn đến 50% so với mua tại sân bay.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
          {/* Left 8 Columns: 2x2 Premium Add-on Cards matching Mockup */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-8">
            {loading
              ? [1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-72 animate-pulse rounded-3xl bg-white/80"
                  />
                ))
              : displayedServices.map((service, idx) => {
                  const isSelected = selectedServices.some(
                    (s) => s.id === service.id
                  );
                  const meta = getServiceDisplayMeta(service, idx);

                  return (
                    <article
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className="relative flex cursor-pointer flex-col justify-between bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        borderRadius: 24,
                        border: isSelected
                          ? "2px solid #1d64f2"
                          : "1px solid #dbe7fb",
                        boxShadow: isSelected
                          ? "0 14px 34px rgba(29, 100, 242, 0.16)"
                          : "0 10px 28px rgba(20, 62, 132, 0.07)",
                      }}
                    >
                      {/* Top Badge Row + Checkmark Circle */}
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 font-extrabold"
                          style={
                            meta.badgePrimary
                              ? {
                                  background:
                                    "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                                  color: "#ffffff",
                                  borderRadius: 9999,
                                  padding: "5px 13px",
                                  fontSize: 11.5,
                                  boxShadow: "0 4px 10px rgba(29, 78, 216, 0.22)",
                                }
                              : {
                                  background: "#eef4fc",
                                  color: "#334e7b",
                                  borderRadius: 9999,
                                  padding: "5px 13px",
                                  fontSize: 11.5,
                                }
                          }
                        >
                          {meta.icon}
                          <span>{meta.badge}</span>
                        </span>

                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition"
                          style={
                            isSelected
                              ? {
                                  background:
                                    "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                                  color: "#ffffff",
                                  boxShadow: "0 3px 10px rgba(29, 78, 216, 0.3)",
                                }
                              : {
                                  background: "#f1f5f9",
                                  border: "1.5px solid #cbd5e1",
                                  color: "transparent",
                                }
                          }
                        >
                          <Check size={14} weight="bold" />
                        </span>
                      </div>

                      {/* Middle Split Row: Tall Rounded Photo + Title / Weight / Price */}
                      <div className="mb-4 flex items-center gap-4">
                        <div
                          className="shrink-0 overflow-hidden bg-sky-50"
                          style={{
                            width: 112,
                            height: 144,
                            borderRadius: 18,
                            border: "1px solid #e2ecfb",
                          }}
                        >
                          <img
                            src={getServiceImage(service, idx)}
                            alt={service.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                            }}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2
                            className="font-extrabold text-[#091e47]"
                            style={{ margin: 0, fontSize: 14.5, lineHeight: 1.25 }}
                          >
                            {meta.titleTop}
                          </h2>
                          <div
                            className="mt-0.5 font-black tracking-tight text-[#091e47]"
                            style={{ fontSize: 22, lineHeight: 1.15 }}
                          >
                            {meta.highlight}
                          </div>
                          <p
                            className="mt-1.5 line-clamp-2 font-medium text-[#526d94]"
                            style={{ margin: "6px 0 10px 0", fontSize: 12, lineHeight: 1.45 }}
                          >
                            {service.description ||
                              "Tận hưởng hành trình thoải mái hơn cùng SkyLink."}
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span
                              className="font-black text-[#0b5ed7]"
                              style={{ fontSize: 19, whiteSpace: "nowrap" }}
                            >
                              +{formatVnd(service.price)}
                            </span>
                            <span
                              className="font-semibold text-slate-400"
                              style={{ fontSize: 11.5, whiteSpace: "nowrap" }}
                            >
                              / {meta.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Full-Width Pill Action Button matching Mockup */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(service);
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold transition"
                        style={
                          isSelected
                            ? {
                                background:
                                  "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                                color: "#ffffff",
                                borderRadius: 9999,
                                border: "none",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                boxShadow: "0 4px 12px rgba(29, 78, 216, 0.25)",
                              }
                            : {
                                background: "#eef6ff",
                                color: "#0b4fd0",
                                border: "1.5px solid #bfd7fb",
                                borderRadius: 9999,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }
                        }
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} weight="bold" />
                            <span>Added · Đã thêm</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} weight="bold" />
                            <span>Thêm dịch vụ</span>
                            <ArrowRight size={13} weight="bold" />
                          </>
                        )}
                      </button>

                      {/* Footer 2-Column Trust Strip matching Mockup */}
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] font-semibold text-[#4d678f]">
                        <span className="inline-flex min-w-0 items-center gap-1 truncate">
                          <ShieldCheck size={14} weight="fill" className="shrink-0 text-[#0ea5e9]" />
                          <span className="truncate">{meta.tag1}</span>
                        </span>
                        <span className="h-3.5 w-[1px] shrink-0 bg-slate-200" />
                        <span className="inline-flex shrink-0 items-center gap-1">
                          <AirplaneTilt size={13} weight="fill" className="text-[#0ea5e9]" />
                          <span>{meta.tag2}</span>
                        </span>
                      </div>
                    </article>
                  );
                })}
          </div>

          {/* Right 4 Columns: Deep Royal Blue Header Flight Summary Card matching Mockup */}
          <aside className="lg:col-span-4">
            <div
              className="sticky top-24 overflow-hidden bg-white shadow-md"
              style={{
                borderRadius: 24,
                border: "1px solid #dbe7fb",
                boxShadow: "0 14px 36px rgba(20, 62, 132, 0.12)",
              }}
            >
              {/* Deep Royal Blue Gradient Header */}
              <div
                className="flex items-center justify-between gap-2 px-5 py-4 text-white"
                style={{
                  background: "linear-gradient(135deg, #0a3b8e 0%, #1d64f2 100%)",
                }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <AirplaneInFlight size={20} weight="fill" className="shrink-0 text-sky-200" />
                  <div className="min-w-0">
                    <h2
                      className="truncate font-black text-white"
                      style={{ margin: 0, fontSize: 15.5, lineHeight: 1.2 }}
                    >
                      Flight Summary
                    </h2>
                    <span className="block text-[11px] font-semibold text-sky-100/90">
                      Tóm tắt chuyến bay
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/seat-selection")}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 font-bold text-white transition hover:bg-white/25"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 9999,
                    padding: "4px 11px",
                    fontSize: 11.5,
                  }}
                >
                  <PencilSimple size={12} weight="bold" />
                  <span>Edit</span>
                </button>
              </div>

              {/* White Summary Body */}
              <div className="space-y-4 p-5">
                {/* Route + Date + Times */}
                <div className="flex items-center justify-between gap-2 text-center">
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate font-black text-[#091e47]" style={{ fontSize: 14 }}>
                      {depCity}
                    </div>
                    <div className="font-extrabold text-[#0b5ed7]" style={{ fontSize: 12 }}>
                      ({depCode})
                    </div>
                    <div className="mt-1 font-semibold text-slate-500" style={{ fontSize: 11 }}>
                      {formatDateEn(primaryFlight.departure_time)}
                    </div>
                    <div className="font-black text-[#091e47]" style={{ fontSize: 13 }}>
                      {formatTimeHm(primaryFlight.departure_time)}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-center px-1">
                    <span className="text-base text-[#0ea5e9]">✈</span>
                    <span className="mt-0.5 text-[10px] font-bold text-slate-400">
                      {selectedFlights.length > 1 ? "Round-trip" : "One-way"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 text-right">
                    <div className="truncate font-black text-[#091e47]" style={{ fontSize: 14 }}>
                      {arrCity}
                    </div>
                    <div className="font-extrabold text-[#0b5ed7]" style={{ fontSize: 12 }}>
                      ({arrCode})
                    </div>
                    <div className="mt-1 font-semibold text-slate-500" style={{ fontSize: 11 }}>
                      {formatDateEn(primaryFlight.arrival_time || primaryFlight.departure_time)}
                    </div>
                    <div className="font-black text-[#091e47]" style={{ fontSize: 13 }}>
                      {formatTimeHm(primaryFlight.arrival_time)}
                    </div>
                  </div>
                </div>

                {/* Soft Ice-Blue 2-Column Strip: Chosen Seat | Cabin Class */}
                <div
                  className="grid grid-cols-2 divide-x divide-blue-100 py-2.5"
                  style={{
                    background: "#f4f8ff",
                    border: "1px solid #e4efff",
                    borderRadius: 14,
                  }}
                >
                  <div className="flex items-center justify-center gap-1 px-1.5 text-center">
                    <Armchair size={14} weight="fill" className="shrink-0 text-[#1d64f2]" />
                    <span className="truncate text-[11px] font-bold text-[#091e47]">
                      Ghế: <strong className="text-[#0b5ed7]">{seatSummaryText}</strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 px-1.5 text-center">
                    <SuitcaseRolling size={14} weight="fill" className="shrink-0 text-[#1d64f2]" />
                    <span className="truncate text-[11px] font-bold text-[#091e47]">
                      <strong>{cabinLabel}</strong>
                    </span>
                  </div>
                </div>

                {/* Special Deal Banner matching Mockup */}
                <div
                  className="flex items-center justify-between gap-3 p-3.5"
                  style={{
                    background: "linear-gradient(90deg, #eef6ff 0%, #e0f2fe 100%)",
                    border: "1px solid #cde4ff",
                    borderRadius: 16,
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-black text-[#0b4fd0]" style={{ fontSize: 12.5 }}>
                      <Gift size={15} weight="fill" />
                      <span>Special Deal · Ưu đãi đặc biệt</span>
                    </div>
                    <p
                      className="mt-1 font-semibold leading-snug text-[#2b4a78]"
                      style={{ margin: "3px 0 0 0", fontSize: 11.5 }}
                    >
                      Thêm hành lý ngay hôm nay để tiết kiệm hơn đến <strong>50%</strong>!
                    </p>
                  </div>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-white shadow-xs"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                      fontSize: 12,
                    }}
                  >
                    -50%
                  </span>
                </div>

                {/* Selected Add-ons Pills (if any chosen) */}
                {selectedServices.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-[#0b5ed7]">
                      Selected Add-ons ({selectedServices.length})
                    </span>
                    {selectedServices.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 text-xs"
                      >
                        <span className="truncate pr-2 font-bold text-[#092152]">{s.name}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="font-extrabold text-[#0b4fd0]">
                            +{formatVnd(s.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleService(s)}
                            aria-label={`Remove ${s.name}`}
                            className="text-slate-400 transition hover:text-rose-500"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            <X size={14} weight="bold" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Transparent Price Breakdown */}
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between font-semibold text-[#47628a]">
                    <span>Base fare · Giá vé ({totalPassengers} khách)</span>
                    <strong className="text-[#092152]">{formatVnd(flightFareTotal)}</strong>
                  </div>
                  <div className="flex justify-between font-semibold text-[#47628a]">
                    <span>Add-ons · Dịch vụ bổ sung</span>
                    <strong className="text-[#0b5ed7]">
                      {servicesTotal > 0 ? `+${formatVnd(servicesTotal)}` : "0 ₫"}
                    </strong>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                    <span className="font-black text-[#091e47]" style={{ fontSize: 14 }}>
                      Total · Tổng cộng
                    </span>
                    <span
                      className="font-black tracking-tight text-[#0b5ed7]"
                      style={{ fontSize: 22, whiteSpace: "nowrap" }}
                    >
                      {formatVnd(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Continue CTA Button matching Mockup */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex w-full items-center justify-center gap-2 px-4 py-3.5 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-105"
                  style={{
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                    borderRadius: 9999,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 6px 18px rgba(29, 78, 216, 0.28)",
                  }}
                >
                  <span>
                    {selectedServices.length > 0
                      ? "Tiếp tục thanh toán"
                      : "Bỏ qua & Thanh toán"}
                  </span>
                  <ArrowRight size={15} weight="bold" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <LockKey size={13} weight="fill" className="text-emerald-500" />
                  <span>Secure Checkout • Bảo mật PCI DSS</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

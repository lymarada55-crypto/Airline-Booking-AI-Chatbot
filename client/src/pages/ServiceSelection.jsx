import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AirplaneInFlight,
  AirplaneTilt,
  Armchair,
  ArrowLeft,
  ArrowRight,
  CalendarBlank,
  Check,
  ForkKnife,
  LockKey,
  ShieldCheck,
  Sparkle,
  Star,
  SuitcaseRolling,
  Users,
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
    description: "Mang theo nhiều hơn những gì bạn cần cho chuyến đi.",
    price: 250000,
    badge: "Phổ biến",
    unit: "kiện",
    weightTag: "20kg",
    iconType: "luggage20",
    tags: ["Tiết kiệm 50% so với sân bay", "Hỗ trợ gửi nhanh"],
    image:
      "https://static.vecteezy.com/system/resources/previews/036/209/973/non_2x/ai-generated-flying-suitcase-on-blue-airplane-business-travel-mode-generated-by-ai-free-photo.jpg",
  },
  {
    id: 2,
    name: "Hành lý ký gửi 30kg",
    description: "Thoải mái mang theo hành lý cá nhân, công tác và quà tặng.",
    price: 400000,
    badge: "Tiết kiệm",
    unit: "kiện",
    weightTag: "30kg",
    iconType: "luggage30",
    tags: ["Phù hợp chuyến đi dài ngày", "Ưu tiên xếp dỡ"],
    image:
      "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Suất ăn nóng trên máy bay",
    description: "Thực đơn món nóng chế biến chuẩn bếp hàng không kèm đồ uống.",
    price: 120000,
    badge: null,
    unit: "suất",
    iconType: "meal",
    tags: ["Phục vụ tận ghế", "Kèm nước suối / trà"],
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Ưu tiên làm thủ tục (SkyPriority)",
    description: "Tiết kiệm thời gian với quầy check-in riêng và ưu tiên lên tàu bay.",
    price: 150000,
    badge: "VIP",
    unit: "khách",
    iconType: "priority",
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

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

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
    cabinClass: "Phổ thông",
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
    departure_airport: { code: "DAD", city: "Đà Nẵng" },
    arrival_airport: { code: "SGN", city: "Hồ Chí Minh" },
    departure_time: new Date().toISOString(),
    display_price: 1200000,
    base_price: 1200000,
  };

  const depCity =
    primaryFlight.departure_airport?.city ||
    primaryFlight.departure_airport?.city_name ||
    primaryFlight.departure_airport?.code ||
    "Đà Nẵng";
  const depCode = primaryFlight.departure_airport?.code || "DAD";
  const arrCity =
    primaryFlight.arrival_airport?.city ||
    primaryFlight.arrival_airport?.city_name ||
    primaryFlight.arrival_airport?.code ||
    "Hồ Chí Minh";
  const arrCode = primaryFlight.arrival_airport?.code || "SGN";

  const outboundSeatsList = Array.isArray(selectedSeats?.outbound)
    ? selectedSeats.outbound
    : [];
  const returnSeatsList = Array.isArray(selectedSeats?.return)
    ? selectedSeats.return
    : [];

  // Calculate accurate flight fare based on chosen seats (or fallback to flight base price * passengers)
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

  const getWeightTag = (service) => {
    if (service.weightTag) return service.weightTag;
    const nameLower = (service.name || "").toLowerCase();
    if (nameLower.includes("20")) return "20kg";
    if (nameLower.includes("30")) return "30kg";
    return null;
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

  const formatDateVi = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const displayedServices = services.length > 0 ? services : DEFAULT_MOCK_SERVICES;

  return (
    <div
      className="relative min-h-screen font-sans text-slate-900"
      style={{
        background:
          "linear-gradient(180deg, #b8dcff 0%, #dceeff 24%, #eef6ff 60%, #d6eaff 100%)",
      }}
    >
      <Navbar />

      {/* 1. HERO HEADER BANNER (Synced 5-Star SkyLink Style) */}
      <div className="relative overflow-hidden pb-8 pt-22">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: 310 }}
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
              <span>Quay lại chọn chỗ ngồi</span>
            </button>

            {/* Clean 4-Step Progress Bar */}
            <div
              className="inline-flex flex-wrap items-center gap-2 px-4 py-1.5 text-xs font-bold"
              style={{
                background: "rgba(255,255,255,0.90)",
                border: "1px solid rgba(255,255,255,0.98)",
                borderRadius: 9999,
              }}
            >
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Check size={13} weight="bold" />
                1. Chuyến bay
              </span>
              <span className="text-slate-300">›</span>
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Check size={13} weight="bold" />
                2. Chọn ghế
              </span>
              <span className="text-slate-300">›</span>
              <span className="font-black text-[#0b5ed7]">3. Dịch vụ</span>
              <span className="text-slate-300">›</span>
              <span className="text-slate-400">4. Thanh toán</span>
            </div>
          </div>

          <p
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em]"
            style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
          >
            <AirplaneTilt size={15} weight="fill" />
            BƯỚC 3/4 • TIỆN ÍCH CHUYẾN BAY (KHÔNG BẮT BUỘC)
          </p>
          <h1
            className="font-black tracking-tight"
            style={{
              fontSize: "clamp(1.95rem, 3.4vw, 2.7rem)",
              color: "#091e47",
              lineHeight: 1.12,
              margin: "0 0 6px 0",
            }}
          >
            Dịch vụ bổ sung
          </h1>
          <p
            className="max-w-xl text-xs font-semibold text-[#2d4b7a] sm:text-sm"
            style={{ margin: 0 }}
          >
            Mua thêm hành lý ký gửi, suất ăn nóng hoặc ưu tiên làm thủ tục với mức giá tiết kiệm
            hơn đến 50% so với mua tại sân bay.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
          {/* Left 8 Columns: 2x2 Services Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-8">
            {loading
              ? [1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-56 animate-pulse rounded-3xl bg-white/80"
                  />
                ))
              : displayedServices.map((service, idx) => {
                  const isSelected = selectedServices.some(
                    (s) => s.id === service.id
                  );

                  return (
                    <article
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className="relative flex cursor-pointer flex-col justify-between bg-white p-5 transition duration-200 hover:-translate-y-0.5"
                      style={{
                        borderRadius: 24,
                        border: isSelected
                          ? "2px solid #16a34a"
                          : "1px solid rgba(255,255,255,0.98)",
                        boxShadow: isSelected
                          ? "0 14px 34px rgba(22, 163, 74, 0.16)"
                          : "0 12px 30px rgba(20, 62, 132, 0.08)",
                      }}
                    >
                      {service.badge && (
                        <span
                          className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                          style={{
                            background: isSelected ? "#16a34a" : "#0b5ed7",
                          }}
                        >
                          <Star size={10} weight="fill" />
                          {service.badge}
                        </span>
                      )}

                      <div>
                        <div className="mb-4 flex items-start gap-4">
                          {/* Service Photo */}
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-blue-100 bg-sky-50">
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
                            {getWeightTag(service) ? (
                              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                                {getWeightTag(service)}
                              </span>
                            ) : (service.name || "").toLowerCase().includes("ăn") ? (
                              <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                                <ForkKnife size={12} weight="bold" />
                              </span>
                            ) : (
                              <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                                <Sparkle size={12} weight="bold" />
                              </span>
                            )}
                          </div>

                          {/* Title & Price */}
                          <div className="min-w-0 flex-1 pr-6">
                            <h2
                              className="text-sm font-black leading-snug text-[#092152] sm:text-base"
                              style={{ margin: "0 0 4px 0" }}
                            >
                              {service.name}
                            </h2>
                            <p
                              className="line-clamp-2 text-xs font-medium leading-relaxed text-[#556f96]"
                              style={{ margin: "0 0 10px 0" }}
                            >
                              {service.description ||
                                "Tận hưởng hành trình thoải mái hơn cùng SkyLink."}
                            </p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-[#0b4fd0]">
                                +{currency.format(Number(service.price || 0))}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                / {service.unit || "gói"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Clear Distinct Action Button (Blue when unselected, Emerald when selected) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleService(service);
                          }}
                          className="inline-flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold transition"
                          style={
                            isSelected
                              ? {
                                  background: "#16a34a",
                                  color: "#ffffff",
                                  borderRadius: 9999,
                                  border: "none",
                                  cursor: "pointer",
                                }
                              : {
                                  background: "#eef6ff",
                                  color: "#0b4fd0",
                                  border: "1.5px solid #bfd7fb",
                                  borderRadius: 9999,
                                  cursor: "pointer",
                                }
                          }
                        >
                          {isSelected ? (
                            <>
                              <Check size={14} weight="bold" />
                              <span>Đã chọn (Bấm để bỏ)</span>
                            </>
                          ) : (
                            <>
                              <span>Thêm dịch vụ</span>
                              <ArrowRight size={13} weight="bold" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Bottom Feature Tags */}
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-blue-50 pt-3 text-[11px] font-semibold text-[#5a749b]">
                        <span className="truncate">
                          ✓ {service.tags?.[0] || "Áp dụng cho mọi hành khách"}
                        </span>
                        <span className="shrink-0">
                          ✈ {service.tags?.[1] || "Hỗ trợ sân bay"}
                        </span>
                      </div>
                    </article>
                  );
                })}
          </div>

          {/* Right 4 Columns: Sticky Accurate Flight Summary */}
          <aside className="lg:col-span-4">
            <div
              className="sticky top-24 space-y-4 bg-white p-6"
              style={{
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.98)",
                boxShadow: "0 14px 36px rgba(20, 62, 132, 0.10)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AirplaneInFlight size={18} weight="fill" className="text-blue-600" />
                  <h2
                    className="text-base font-black tracking-tight text-[#092152]"
                    style={{ margin: 0 }}
                  >
                    Tóm tắt chuyến bay
                  </h2>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                  style={{ background: "#eef6ff", color: "#0b4fd0" }}
                >
                  {selectedFlights.length > 1 ? "Khứ hồi" : "Một chiều"}
                </span>
              </div>

              {/* Accurate Route, Date, Passengers & Chosen Seats */}
              <div className="space-y-2.5 rounded-2xl border border-blue-100 bg-[#f7faff] p-4">
                <div className="flex items-center justify-between text-sm font-black text-[#092152]">
                  <span>
                    {depCity} ({depCode})
                  </span>
                  <span className="text-blue-600">➔</span>
                  <span>
                    {arrCity} ({arrCode})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-[#47628a]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarBlank size={14} weight="fill" className="text-blue-600" />
                    {formatDateVi(primaryFlight.departure_time)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} weight="fill" className="text-blue-600" />
                    {totalPassengers} hành khách
                  </span>
                </div>

                {(outboundSeatsList.length > 0 || returnSeatsList.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-blue-100 pt-2 text-[11px] font-bold text-[#163d7a]">
                    <Armchair size={14} weight="fill" className="text-blue-600" />
                    <span>
                      Ghế đã chọn:{" "}
                      <strong className="text-[#0b4fd0]">
                        {outboundSeatsList.map((s) => s.seat_number).join(", ")}
                      </strong>
                      {returnSeatsList.length > 0 && (
                        <>
                          {" "}
                          | Về:{" "}
                          <strong className="text-[#0b4fd0]">
                            {returnSeatsList.map((s) => s.seat_number).join(", ")}
                          </strong>
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Selected Services Box */}
              <div className="space-y-2.5 rounded-2xl border border-blue-100 bg-[#f4f9ff] p-4">
                {selectedServices.length === 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#102b63]">
                      <SuitcaseRolling size={16} weight="fill" className="text-blue-600" />
                      Chưa chọn dịch vụ bổ sung
                    </div>
                    <p className="pl-5 text-[11px] font-medium text-[#556f96]" style={{ margin: 0 }}>
                      Bạn có thể bỏ qua bước này nếu không cần mua thêm hành lý hay suất ăn nóng.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0b5ed7]">
                      Dịch vụ đã chọn ({selectedServices.length})
                    </span>
                    {selectedServices.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs"
                      >
                        <span className="font-bold text-[#092152]">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0b4fd0]">
                            +{currency.format(Number(s.price || 0))}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleService(s)}
                            aria-label={`Bỏ ${s.name}`}
                            className="text-slate-400 transition hover:text-rose-500"
                            style={{ background: "none", border: "none", cursor: "pointer" }}
                          >
                            <X size={14} weight="bold" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transparent Price Breakdown */}
              <div className="space-y-2 border-t border-blue-100 pt-3 text-xs">
                <div className="flex justify-between font-semibold text-[#47628a]">
                  <span>Giá vé tạm tính ({totalPassengers} khách)</span>
                  <strong className="text-[#092152]">
                    {currency.format(flightFareTotal)}
                  </strong>
                </div>
                <div className="flex justify-between font-semibold text-[#47628a]">
                  <span>Dịch vụ bổ sung</span>
                  <strong className="text-[#0b4fd0]">
                    {servicesTotal > 0 ? `+${currency.format(servicesTotal)}` : "0 ₫"}
                  </strong>
                </div>
                <div className="flex items-baseline justify-between border-t border-blue-50 pt-2.5">
                  <span className="text-xs font-black uppercase text-[#092152]">
                    Tổng cộng
                  </span>
                  <div className="text-right">
                    <span className="block text-xl font-black tracking-tight text-[#0b4fd0]">
                      {currency.format(grandTotal)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Chưa gồm thuế/phí sân bay tại bước thanh toán
                    </span>
                  </div>
                </div>
              </div>

              {/* Continue CTA Button */}
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex w-full items-center justify-center gap-2 py-3.5 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span>
                  {selectedServices.length > 0
                    ? "Tiếp tục thanh toán"
                    : "Bỏ qua & Tiếp tục thanh toán"}
                </span>
                <ArrowRight size={15} weight="bold" />
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-slate-400">
                <LockKey size={13} weight="fill" className="text-emerald-500" />
                <span>Thanh toán an toàn • Bảo mật PCI DSS</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

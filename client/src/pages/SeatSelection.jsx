import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AirplaneTilt,
  Armchair,
  ArrowLeft,
  ArrowRight,
  ArrowsOut,
  CalendarBlank,
  CaretDown,
  CaretUp,
  Check,
  ForkKnife,
  Info,
  Robot,
  SealCheck,
  ShieldCheck,
  Sparkle,
  SuitcaseRolling,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_SEAT_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const AIRPORT_CITY_MAP = {
  HAN: "Hà Nội",
  SGN: "TP. Hồ Chí Minh",
  DAD: "Đà Nẵng",
  PQC: "Phú Quốc",
  CXR: "Nha Trang",
  HPH: "Hải Phòng",
  VCA: "Cần Thơ",
  UIH: "Quy Nhơn",
  DLI: "Đà Lạt",
  HUI: "Huế",
  VCL: "Chu Lai",
  THD: "Thanh Hóa",
  VII: "Vinh",
  VDH: "Đồng Hới",
  PXU: "Pleiku",
  TNN: "Tuy Hòa",
  BMV: "Buôn Ma Thuột",
  VCS: "Côn Đảo",
  VDO: "Vân Đồn",
  VKG: "Rạch Giá",
  DIN: "Điện Biên",
  CAH: "Cà Mau",
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const VietnamAirlinesLogo = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 54,
      height: 54,
      borderRadius: 14,
      background: "linear-gradient(145deg, #00556e 0%, #006d88 100%)",
      padding: "5px 4px",
    }}
  >
    <svg viewBox="0 0 44 26" fill="none" style={{ width: 32, height: 18 }}>
      <path
        d="M22 2C22 2 24.4 9.5 27.6 12C31.2 14.8 38.5 14 38.5 14C38.5 14 32 18.2 28.2 20.5C24.5 22.8 22 24.5 22 24.5C22 24.5 19.5 22.8 15.8 20.5C12 18.2 5.5 14 5.5 14C5.5 14 12.8 14.8 16.4 12C19.6 9.5 22 2 22 2Z"
        fill="#F4B41A"
      />
      <path
        d="M22 7.5C22 7.5 23.6 13.5 26 15.6C24.2 18.2 22 20.2 22 20.2C22 20.2 19.8 18.2 18 15.6C20.4 13.5 22 7.5 22 7.5Z"
        fill="#FFD86B"
      />
    </svg>
    <span
      className="mt-0.5 text-center font-bold leading-tight text-white/95"
      style={{ fontSize: 8.5 }}
    >
      Vietnam
      <br />
      Airlines
    </span>
  </div>
);

const VietjetLogo = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 54,
      height: 54,
      borderRadius: 14,
      background: "linear-gradient(145deg, #d9141d 0%, #f0232b 100%)",
      padding: "5px 4px",
    }}
  >
    <svg viewBox="0 0 40 24" fill="none" style={{ width: 28, height: 16 }}>
      <path
        d="M6 4L20 20L34 4"
        stroke="#FFF200"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="11" r="2.6" fill="#FFFFFF" />
    </svg>
    <span
      className="mt-0.5 text-center font-extrabold leading-tight text-white"
      style={{ fontSize: 8.5 }}
    >
      VietJet
      <br />
      Air
    </span>
  </div>
);

const BambooAirwaysLogo = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 54,
      height: 54,
      borderRadius: 14,
      background: "linear-gradient(145deg, #006633 0%, #009944 100%)",
      padding: "5px 4px",
    }}
  >
    <svg viewBox="0 0 40 26" fill="none" style={{ width: 28, height: 18 }}>
      <path d="M9 21C12 13 19 7 30 4C25 12 18 18 9 21Z" fill="#FFFFFF" />
      <path d="M13 24C16 18 22 13 31 11C27 17 21 21 13 24Z" fill="#38BDF8" />
    </svg>
    <span
      className="mt-0.5 text-center font-bold leading-tight text-white/95"
      style={{ fontSize: 8.5 }}
    >
      Bamboo
      <br />
      Airways
    </span>
  </div>
);

const SkyLinkLogo = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 54,
      height: 54,
      borderRadius: 14,
      background: "linear-gradient(145deg, #092c7a 0%, #0284c7 100%)",
      padding: "5px 4px",
    }}
  >
    <svg viewBox="0 0 40 24" fill="none" style={{ width: 28, height: 16 }}>
      <path d="M20 18L4 6L15 11L20 18Z" fill="#7DD3FC" />
      <path d="M20 18L36 6L25 11L20 18Z" fill="#FFFFFF" />
      <path d="M20 4L23 13L20 18L17 13L20 4Z" fill="#E0F2FE" />
    </svg>
    <span
      className="mt-0.5 text-center font-extrabold leading-tight text-white"
      style={{ fontSize: 8.5 }}
    >
      SkyLink
      <br />
      Airlines
    </span>
  </div>
);

const SEAT_AIRLINE_MAP = {
  VN: {
    name: "Vietnam Airlines",
    tagline: "Bay cùng vẻ đẹp Việt Nam",
    baggage: "7kg + 23kg",
    hasMeal: true,
    logo: <VietnamAirlinesLogo />,
  },
  VJ: {
    name: "VietJet Air",
    tagline: "Bay là thích ngay",
    baggage: "7kg x 1",
    hasMeal: false,
    logo: <VietjetLogo />,
  },
  QH: {
    name: "Bamboo Airways",
    tagline: "Hơn cả một chuyến bay",
    baggage: "7kg + 20kg",
    hasMeal: true,
    logo: <BambooAirwaysLogo />,
  },
  FB: {
    name: "Bamboo Airways",
    tagline: "Hơn cả một chuyến bay",
    baggage: "7kg + 20kg",
    hasMeal: true,
    logo: <BambooAirwaysLogo />,
  },
};

const DEFAULT_SEAT_AIRLINE = {
  name: "SkyLink Airlines",
  tagline: "Trải nghiệm bay 5 sao quốc tế",
  baggage: "10kg + 30kg",
  hasMeal: true,
  logo: <SkyLinkLogo />,
};

function getSeatAirline(flightNumber = "") {
  const prefix = (String(flightNumber).match(/^[A-Za-z]+/) ?? [""])[0].toUpperCase();
  return SEAT_AIRLINE_MAP[prefix] ?? DEFAULT_SEAT_AIRLINE;
}

function formatDateEnShort(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(String(dateStr).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Matches Backend BookingController.php (rows 1–5 Business +20%, 6–14 Standard 0%, 15+ Saver -5%)
function getSeatTierInfo(seatNumber = "", basePrice = 0) {
  const match = String(seatNumber).match(/(\d+)([A-Z])/);
  const rowNum = match ? Number(match[1]) : 0;
  const letter = match ? match[2] : "";
  const positionLabel =
    letter === "A" || letter === "F"
      ? "Cửa sổ"
      : letter === "C" || letter === "D"
        ? "Lối đi"
        : "Ghế giữa";

  const base = Number(basePrice) || 0;
  if (rowNum >= 1 && rowNum <= 5) {
    return {
      rowNum,
      tierKey: "business",
      tierLabel: "Thương gia (+20%)",
      shortLabel: "Thương gia",
      positionLabel,
      multiplier: 1.2,
      estimatedPrice: Math.round(base * 1.2),
      badgeBg: "#ffe4e8",
      badgeColor: "#be123c",
    };
  }
  if (rowNum >= 15) {
    return {
      rowNum,
      tierKey: "saver",
      tierLabel: "Tiết kiệm (-5%)",
      shortLabel: "Tiết kiệm",
      positionLabel,
      multiplier: 0.95,
      estimatedPrice: Math.round(base * 0.95),
      badgeBg: "#e0f2fe",
      badgeColor: "#0369a1",
    };
  }
  return {
    rowNum,
    tierKey: "standard",
    tierLabel: "Tiêu chuẩn",
    shortLabel: "Tiêu chuẩn",
    positionLabel,
    multiplier: 1,
    estimatedPrice: Math.round(base),
    badgeBg: "#dcfce7",
    badgeColor: "#15803d",
  };
}

function formatDuration(dep, arr) {
  if (!dep || !arr) return "—";
  const ms = new Date(String(arr).replace(" ", "T")) - new Date(String(dep).replace(" ", "T"));
  if (Number.isNaN(ms) || ms <= 0) return "—";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return m > 0 ? `${h}h ${m}m` : `${h}h 00m`;
}

export default function SeatSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSeatDetails, setShowSeatDetails] = useState(false);

  const [flights, setFlights] = useState([]);
  const [seatsData, setSeatsData] = useState({});

  const [bookingStage, setBookingStage] = useState("outbound");
  const [selectedSeats, setSelectedSeats] = useState({
    outbound: [],
    return: [],
  });

  let searchParams = { passengers: { adults: 1, children: 0 }, tripType: "one-way" };
  try {
    const parsed = JSON.parse(localStorage.getItem("search_params") || "null");
    if (parsed) searchParams = parsed;
  } catch {
    // ignore storage errors
  }

  const totalPassengers = Math.max(
    1,
    (Number(searchParams.passengers?.adults) || 1) +
      (Number(searchParams.passengers?.children) || 0)
  );
  const backendTripType = (
    searchParams.tripType ||
    searchParams.trip_type ||
    "one-way"
  ).replace("-", "_");

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let savedFlights = [];
    try {
      savedFlights = JSON.parse(localStorage.getItem("selected_flights") || "[]");
    } catch {
      savedFlights = [];
    }

    if (!Array.isArray(savedFlights) || savedFlights.length === 0) {
      navigate("/flights");
      return;
    }
    setFlights(savedFlights);

    const fetchAllSeats = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const newSeatsData = {};
        for (const flight of savedFlights) {
          const res = await fetch(
            `/api/flights/${flight.id}/seats?trip_type=${encodeURIComponent(backendTripType)}`,
            { headers }
          );
          const data = await res.json();
          if (res.ok && data.status === "success") {
            newSeatsData[flight.id] = data.data;
          }
        }
        setSeatsData(newSeatsData);
      } catch (err) {
        console.error("Failed to load seats:", err);
        setError("Lỗi tải sơ đồ ghế. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllSeats();
  }, [navigate, backendTripType]);

  if (flights.length === 0) return null;

  const currentFlight = bookingStage === "outbound" ? flights[0] : flights[1];
  const currentSeats = seatsData[currentFlight?.id] || [];
  const baseFlightPrice = Number(
    currentFlight?.display_price || currentFlight?.base_price || 0
  );

  const handleSeatClick = (seat) => {
    if (seat.is_locked) return;

    setSelectedSeats((prev) => {
      const currentSelection = prev[bookingStage];
      const isAlreadySelected = currentSelection.some((s) => s.id === seat.id);

      if (isAlreadySelected) {
        return {
          ...prev,
          [bookingStage]: currentSelection.filter((s) => s.id !== seat.id),
        };
      }
      if (currentSelection.length >= totalPassengers) {
        window.alert(
          `Bạn chỉ được chọn tối đa ${totalPassengers} ghế cho ${totalPassengers} hành khách.`
        );
        return prev;
      }
      return {
        ...prev,
        [bookingStage]: [...currentSelection, seat],
      };
    });
  };

  const handleNext = async () => {
    if (flights.length > 1 && bookingStage === "outbound") {
      if (selectedSeats.outbound.length !== totalPassengers) {
        window.alert(
          `Vui lòng chọn đủ ${totalPassengers} ghế cho chuyến đi trước khi chọn ghế chuyến về!`
        );
        return;
      }
      setBookingStage("return");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (!token) {
      window.alert("Bạn cần đăng nhập để giữ ghế và đặt vé!");
      navigate("/login");
      return;
    }

    setProcessing(true);
    try {
      if (selectedSeats[bookingStage].length !== totalPassengers) {
        window.alert(`Vui lòng chọn đủ ${totalPassengers} ghế cho hành khách!`);
        return;
      }

      const payload = {
        flight_id: flights[0].id,
        outbound_seat_ids: selectedSeats.outbound.map((s) => s.id),
      };

      if (flights.length > 1 && selectedSeats.return.length > 0) {
        payload.return_flight_id = flights[1].id;
        payload.return_seat_ids = selectedSeats.return.map((s) => s.id);
      }

      const res = await fetch("/api/bookings/lock-seat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (res.ok && data.status === "success") {
        localStorage.setItem("selected_seats", JSON.stringify(selectedSeats));
        navigate("/services");
      } else {
        window.alert(
          "Lỗi giữ ghế: " + (data.message || "Ghế có thể đã bị người khác chọn.")
        );
        window.location.reload();
      }
    } catch (err) {
      console.error("Lock seat error:", err);
      window.alert("Không thể kết nối tới máy chủ.");
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Matches Backend BookingController.php exactly: 1–5 Business (+20%), 6–14 Standard, 15+ Saver (-5%)
  const getSeatColorStyle = (rowNum, isSelected, isLocked) => {
    if (isLocked) {
      return "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-65";
    }
    if (isSelected) {
      return "bg-[#0b5ed7] border-[#083f96] text-white shadow-md scale-105 ring-2 ring-blue-400 ring-offset-1 cursor-pointer";
    }

    const r = Number(rowNum);
    if (r >= 1 && r <= 5) {
      return "bg-[#f43f5e] hover:bg-[#fb7185] border-[#e11d48] text-white cursor-pointer";
    }
    if (r >= 15) {
      return "bg-[#0284c7] hover:bg-[#0ea5e9] border-[#0369a1] text-white cursor-pointer";
    }
    return "bg-[#10b981] hover:bg-[#34d399] border-[#059669] text-white cursor-pointer";
  };

  const renderSeatIcon = (seat) => {
    const isSelected = selectedSeats[bookingStage].some((s) => s.id === seat.id);
    const isLocked = seat.is_locked;
    const tier = getSeatTierInfo(seat.seat_number, baseFlightPrice);
    const colorStyle = getSeatColorStyle(tier.rowNum, isSelected, isLocked);

    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => handleSeatClick(seat)}
        disabled={isLocked}
        className={`relative flex h-8 w-7 flex-col items-center justify-center rounded-t-lg rounded-b-xs border transition-all duration-150 md:h-9 md:w-8 ${colorStyle}`}
        title={`Ghế ${seat.seat_number} • ${tier.tierLabel} (${tier.positionLabel}) – ${currency.format(
          tier.estimatedPrice
        )}`}
      >
        {isLocked ? (
          <span className="text-[10px] font-bold text-slate-400">✕</span>
        ) : (
          <span className="text-[9px] font-extrabold tracking-tighter">
            {seat.seat_number}
          </span>
        )}
      </button>
    );
  };

  const renderSeatGrid = () => {
    if (currentSeats.length === 0) return null;

    const cols = { A: [], B: [], C: [], D: [], E: [], F: [] };
    const rowNums = new Set();

    currentSeats.forEach((seat) => {
      const match = String(seat.seat_number).match(/(\d+)([A-Z])/);
      if (match) {
        const rowNum = Number(match[1]);
        const letter = match[2];
        rowNums.add(rowNum);
        if (cols[letter]) {
          cols[letter].push({ ...seat, rowNum });
        }
      }
    });

    const sortedRowNums = Array.from(rowNums).sort((a, b) => a - b);
    Object.keys(cols).forEach((letter) => {
      cols[letter].sort((a, b) => a.rowNum - b.rowNum);
    });

    return (
      <div
        className="flex flex-col items-center overflow-hidden bg-white px-5 pb-5 pt-4 sm:px-6"
        style={{
          borderRadius: 24,
          border: "1px solid #dbe7fb",
          boxShadow: "0 10px 30px rgba(20, 62, 132, 0.08)",
        }}
      >
        {/* Compact Cabin Map Header + Horizontal Scroll Hint */}
        <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#091e47]" style={{ fontSize: 14 }}>
              Aircraft Seat Map
            </span>
            <span
              className="font-bold text-slate-500"
              style={{
                fontSize: 11.5,
                background: "#f1f5f9",
                borderRadius: 9999,
                padding: "2px 9px",
              }}
            >
              Sơ đồ ghế • {currentSeats.length} seats
            </span>
          </div>
          <span
            className="inline-flex items-center gap-1 font-bold text-[#0b5ed7]"
            style={{
              fontSize: 11.5,
              background: "#eff6ff",
              borderRadius: 9999,
              padding: "3px 10px",
            }}
          >
            Cuộn ngang xem hàng 15–30 (Saver -5%) →
          </span>
        </div>

        {/* Scroll container for Aircraft Fuselage */}
        <div className="custom-scrollbar w-full overflow-x-auto pb-4 pt-2">
          <div className="relative mx-auto flex min-w-max items-center justify-center px-16 py-3">
            {/* AIRCRAFT FUSELAGE */}
            <div
              className="relative flex items-center border-2 border-blue-200/80 bg-[#f2f7fd] px-10 py-6 shadow-inner"
              style={{ borderRadius: 140, minWidth: 820 }}
            >
              {/* Cockpit Nose */}
              <div
                className="absolute -left-20 bottom-0 top-0 flex w-24 items-center justify-center rounded-l-full border-l-2 border-blue-200 bg-gradient-to-r from-blue-100 to-[#f2f7fd] text-[10px] font-extrabold tracking-widest text-slate-400"
                style={{ clipPath: "polygon(0 25%, 100% 0, 100% 100%, 0 75%)" }}
              >
                <div className="text-center">
                  <span className="block text-lg text-blue-300">✈</span>
                  <span>COCKPIT</span>
                </div>
              </div>

              {/* Tail */}
              <div
                className="absolute -right-20 bottom-0 top-0 flex w-24 items-center justify-center rounded-r-full border-r-2 border-blue-200 bg-gradient-to-l from-blue-100 to-[#f2f7fd] text-[10px] font-bold text-slate-400"
                style={{ clipPath: "polygon(0 0, 100% 25%, 100% 75%, 0 100%)" }}
              >
                WC
              </div>

              {/* Seats Grid */}
              <div className="relative flex w-full flex-col">
                {/* Row Numbers */}
                <div className="mb-3 flex w-full items-center gap-2 pl-6 text-[10px] font-extrabold text-slate-400">
                  {sortedRowNums.map((r) => (
                    <div
                      key={`head-${r}`}
                      className="w-7 flex-shrink-0 text-center md:w-8"
                    >
                      {String(r).padStart(2, "0")}
                    </div>
                  ))}
                </div>

                {/* Top Set: A, B, C */}
                <div className="relative mb-3 flex flex-col gap-1.5">
                  <div className="absolute -left-6 bottom-0 top-0 flex flex-col justify-between py-1 text-[11px] font-bold text-slate-400">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                  </div>
                  {["A", "B", "C"].map((letter) => (
                    <div key={letter} className="flex gap-2">
                      {sortedRowNums.map((r) => {
                        const seat = cols[letter].find((s) => s.rowNum === r);
                        return (
                          <div key={`${letter}-${r}`} className="w-7 md:w-8">
                            {seat ? renderSeatIcon(seat) : null}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Aisle */}
                <div className="my-1 flex h-4 items-center justify-center rounded-full border border-blue-200/40 bg-blue-100/60">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-500">
                    Lối đi chính
                  </span>
                </div>

                {/* Bottom Set: D, E, F */}
                <div className="relative mt-3 flex flex-col gap-1.5">
                  <div className="absolute -left-6 bottom-0 top-0 flex flex-col justify-between py-1 text-[11px] font-bold text-slate-400">
                    <span>D</span>
                    <span>E</span>
                    <span>F</span>
                  </div>
                  {["D", "E", "F"].map((letter) => (
                    <div key={letter} className="flex gap-2">
                      {sortedRowNums.map((r) => {
                        const seat = cols[letter].find((s) => s.rowNum === r);
                        return (
                          <div key={`${letter}-${r}`} className="w-7 md:w-8">
                            {seat ? renderSeatIcon(seat) : null}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Accurate Bilingual Legend Bar */}
        <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3.5 text-xs font-bold text-[#2b4776]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-xs bg-[#f43f5e]" />
            <span>Business H1–H5 (+20%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-xs bg-[#10b981]" />
            <span>Standard H6–H14</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-xs bg-[#0284c7]" />
            <span>Saver H15+ (-5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-xs bg-[#0b5ed7] ring-2 ring-blue-300" />
            <span>Selected · Đang chọn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-xs border border-slate-300 bg-slate-200 text-[9px] text-slate-400">
              ✕
            </span>
            <span>Occupied · Đã đặt</span>
          </div>
        </div>
      </div>
    );
  };

  const selectedList = selectedSeats[bookingStage] || [];
  const depCode =
    currentFlight?.departure_airport?.code ||
    currentFlight?.origin ||
    currentFlight?.departure_airport_id ||
    "HAN";
  const arrCode =
    currentFlight?.arrival_airport?.code ||
    currentFlight?.destination ||
    currentFlight?.arrival_airport_id ||
    "DAD";

  const getCityName = (airportObj, codeFallback, defaultName) => {
    if (airportObj?.city) return airportObj.city;
    if (airportObj?.name) return airportObj.name;
    const code = airportObj?.code || codeFallback;
    return AIRPORT_CITY_MAP[code] || defaultName;
  };

  const depCity = getCityName(
    currentFlight?.departure_airport,
    depCode,
    "Hà Nội"
  );
  const arrCity = getCityName(
    currentFlight?.arrival_airport,
    arrCode,
    "Đà Nẵng"
  );
  const flightNo = currentFlight?.flight_number || "VN7211";
  const seatAirline = getSeatAirline(flightNo);
  const flightDuration = formatDuration(
    currentFlight?.departure_time,
    currentFlight?.arrival_time
  );
  const formattedFlightDateEn = formatDateEnShort(
    currentFlight?.departure_time || searchParams.date
  );
  const cabinLabel =
    searchParams.cabinClass === "business"
      ? "Thương gia"
      : "Phổ thông";

  // Calculate real-time estimated fare for selected seats
  const selectedSeatDetails = selectedList.map((seat) => ({
    ...seat,
    tier: getSeatTierInfo(seat.seat_number, baseFlightPrice),
  }));
  const stageEstimatedTotal = selectedSeatDetails.reduce(
    (sum, s) => sum + s.tier.estimatedPrice,
    0
  );

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
      <div className="relative overflow-hidden pb-5 pt-22">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: 270 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.85) 46%, rgba(225,241,255,0.20) 100%)",
            }}
          />
          <img
            src={HERO_SEAT_BG_URL}
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
              onClick={() => navigate("/flights")}
              className="inline-flex items-center gap-2 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-[#16428b] shadow-sm transition hover:bg-white"
              style={{
                border: "1px solid rgba(255,255,255,0.96)",
                borderRadius: 9999,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Back to Flights · Quay lại</span>
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
                1. Flights
              </span>
              <span className="text-slate-300">›</span>
              <span className="font-black text-[#0b5ed7]">2. Seat Selection</span>
              <span className="text-slate-300">›</span>
              <span className="text-slate-400">3. Add-ons</span>
              <span className="text-slate-300">›</span>
              <span className="text-slate-400">4. Payment</span>
            </div>
          </div>

          <p
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em]"
            style={{ color: "#0b57d0", margin: "0 0 2px 0" }}
          >
            <AirplaneTilt size={15} weight="fill" />
            STEP 2/4 • {bookingStage === "outbound" ? "OUTBOUND SEAT · CHỌN GHẾ CHIỀU ĐI" : "RETURN SEAT · CHỌN GHẾ CHIỀU VỀ"}
          </p>
          <h1
            className="font-black tracking-tight"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.35rem)",
              color: "#091e47",
              lineHeight: 1.12,
              margin: "0 0 4px 0",
            }}
          >
            Chọn chỗ ngồi
          </h1>
          <p className="max-w-2xl text-xs font-semibold text-[#2d4b7a] sm:text-sm" style={{ margin: 0 }}>
            Select your preferred seat for {totalPassengers} passenger(s) • Ghế đã chọn được giữ độc quyền trong 15 phút.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID (Left Seat Map + Right Summary) */}
      <main className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-7 px-4 pb-20 pt-2 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left Column (Flight Info + Airplane Seat Map) */}
        <div className="space-y-5 lg:col-span-8">
          {/* Round-trip Stage Tabs when user selected Round-trip */}
          {flights.length > 1 && (
            <div className="flex items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-xs" style={{ border: "1px solid #dbe9fe" }}>
              <button
                type="button"
                onClick={() => setBookingStage("outbound")}
                className="flex-1 rounded-xl py-2 text-xs font-extrabold transition"
                style={
                  bookingStage === "outbound"
                    ? {
                        background:
                          "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                        color: "#ffffff",
                        border: "none",
                        cursor: "pointer",
                      }
                    : {
                        background: "transparent",
                        color: "#365382",
                        border: "none",
                        cursor: "pointer",
                      }
                }
              >
                1. Chiều đi ({selectedSeats.outbound.length}/{totalPassengers} ghế)
              </button>
              <button
                type="button"
                onClick={() => setBookingStage("return")}
                className="flex-1 rounded-xl py-2 text-xs font-extrabold transition"
                style={
                  bookingStage === "return"
                    ? {
                        background:
                          "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                        color: "#ffffff",
                        border: "none",
                        cursor: "pointer",
                      }
                    : {
                        background: "transparent",
                        color: "#365382",
                        border: "none",
                        cursor: "pointer",
                      }
                }
              >
                2. Chiều về ({selectedSeats.return.length}/{totalPassengers} ghế)
              </button>
            </div>
          )}

          {/* Flight Summary Card — Synced 5-Star Style matching FlightCard.jsx */}
          <div
            className="bg-white p-5"
            style={{
              borderRadius: 22,
              border: "1px solid #dbe7fb",
              boxShadow: "0 10px 28px rgba(20, 62, 132, 0.08)",
            }}
          >
            {/* Row 1: Airline Tile + Name + Verified Badge + Flight Code + Date Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                {seatAirline.logo}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2
                      className="truncate font-black text-[#091e47]"
                      style={{ margin: 0, fontSize: 16.5, lineHeight: 1.2 }}
                    >
                      {seatAirline.name}
                    </h2>
                    <SealCheck
                      size={17}
                      weight="fill"
                      className="shrink-0 text-[#2563eb]"
                      title="Verified Airline"
                    />
                    <span
                      className="font-mono font-bold text-slate-600"
                      style={{
                        fontSize: 11,
                        background: "#f1f5f9",
                        borderRadius: 6,
                        padding: "1px 7px",
                      }}
                    >
                      {flightNo}
                    </span>
                  </div>
                  <p
                    className="truncate italic text-slate-500"
                    style={{ margin: "2px 0 0 0", fontSize: 12 }}
                  >
                    {seatAirline.tagline}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 font-extrabold text-[#0b5ed7]"
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #dbeafe",
                    borderRadius: 9999,
                    padding: "5px 12px",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  <CalendarBlank size={14} weight="fill" />
                  <span>{formattedFlightDateEn}</span>
                </span>
                <span
                  className="inline-flex items-center font-extrabold text-white"
                  style={{
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                    borderRadius: 9999,
                    padding: "5px 12px",
                    fontSize: 11.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {bookingStage === "outbound" ? "Departure · Chiều đi" : "Return · Chiều về"}
                </span>
              </div>
            </div>

            {/* Row 2: Visual Flight Timeline (06:00 HAN --- ✈ 2h 00m / Direct --- 08:00 SGN) */}
            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
              <div className="min-w-[115px]">
                <div
                  className="font-black leading-none text-[#091e47]"
                  style={{ fontSize: 23 }}
                >
                  {formatTime(currentFlight?.departure_time)}
                </div>
                <div
                  className="mt-1 truncate font-semibold text-slate-500"
                  style={{ fontSize: 12 }}
                >
                  {depCity} <span className="font-extrabold text-[#091e47]">({depCode})</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col items-center px-2">
                <div className="relative flex w-full items-center justify-center">
                  <div
                    className="w-full"
                    style={{ borderTop: "1.5px dashed #cbd5e1" }}
                  />
                  <span
                    className="absolute flex items-center justify-center bg-white px-2"
                    style={{ color: "#0ea5e9" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ width: 18, height: 18 }}
                    >
                      <path
                        d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                        transform="rotate(90 12 12)"
                      />
                    </svg>
                  </span>
                </div>
                <span
                  className="mt-1.5 font-extrabold text-[#1d4ed8]"
                  style={{
                    background: "#eff6ff",
                    borderRadius: 9999,
                    padding: "1px 10px",
                    fontSize: 11.5,
                  }}
                >
                  {flightDuration}
                </span>
                <span
                  className="mt-0.5 font-extrabold text-[#0264c8]"
                  style={{ fontSize: 11.5 }}
                >
                  Direct · Bay thẳng
                </span>
              </div>

              <div className="min-w-[115px] text-right">
                <div
                  className="font-black leading-none text-[#091e47]"
                  style={{ fontSize: 23 }}
                >
                  {formatTime(currentFlight?.arrival_time)}
                </div>
                <div
                  className="mt-1 truncate font-semibold text-slate-500"
                  style={{ fontSize: 12 }}
                >
                  {arrCity} <span className="font-extrabold text-[#091e47]">({arrCode})</span>
                </div>
              </div>
            </div>

            {/* Row 3: 4-Column Ice-Blue Quick Info Bar (Synced with FlightCard.jsx) */}
            <div
              className="mt-4 grid grid-cols-2 gap-y-2.5 sm:grid-cols-4 sm:divide-x sm:divide-blue-100"
              style={{
                background: "#f4f8ff",
                border: "1px solid #e4efff",
                borderRadius: 14,
                padding: "9px 6px",
              }}
            >
              <div className="flex items-center gap-2 px-3">
                <AirplaneTilt size={18} weight="fill" className="shrink-0 text-[#1d64f2]" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-500" style={{ fontSize: 10.5, lineHeight: 1.2 }}>
                    Aircraft · Tàu bay
                  </div>
                  <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 12 }}>
                    {currentFlight?.aircraft?.model || "Airbus A321neo"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3">
                <SuitcaseRolling size={18} weight="fill" className="shrink-0 text-[#1d64f2]" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-500" style={{ fontSize: 10.5, lineHeight: 1.2 }}>
                    Baggage · Hành lý
                  </div>
                  <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 12 }}>
                    {seatAirline.baggage}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3">
                <Armchair size={18} weight="fill" className="shrink-0 text-[#1d64f2]" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-500" style={{ fontSize: 10.5, lineHeight: 1.2 }}>
                    Cabin · Hạng ghế
                  </div>
                  <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 12 }}>
                    {cabinLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3">
                <ForkKnife size={18} weight="fill" className="shrink-0 text-[#1d64f2]" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-500" style={{ fontSize: 10.5, lineHeight: 1.2 }}>
                    Meal · Suất ăn
                  </div>
                  <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 12 }}>
                    {seatAirline.hasMeal ? "Included · Có" : "Mua thêm"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Map Aircraft View */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-blue-100 bg-white py-24 text-slate-400">
              <span className="animate-spin text-2xl text-blue-600">⌛</span>
              <p className="text-xs font-bold">Đang tải sơ đồ ghế tàu bay...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-xs font-bold text-rose-600">
              {error}
            </div>
          ) : (
            renderSeatGrid()
          )}

          {/* Bottom Info Strip + Working Expandable Seat Class Guide */}
          <div className="space-y-3">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex w-full items-center gap-2 rounded-2xl border border-blue-100 bg-white/90 px-4 py-2.5 text-xs font-semibold text-[#1e4280] sm:w-auto">
                <Info size={16} className="shrink-0 text-blue-600" weight="fill" />
                <span>
                  Hạng ghế & phụ phí khớp 100% theo sơ đồ giá vé khi thanh toán.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowSeatDetails((v) => !v)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-extrabold text-[#0b4fd0] shadow-xs transition hover:bg-blue-50"
                style={{ cursor: "pointer" }}
              >
                <ArrowsOut size={14} weight="bold" />
                <span>{showSeatDetails ? "Ẩn chi tiết ghế" : "Xem chi tiết ghế"}</span>
                {showSeatDetails ? (
                  <CaretUp size={13} weight="bold" />
                ) : (
                  <CaretDown size={13} weight="bold" />
                )}
              </button>
            </div>

            {showSeatDetails && (
              <div
                className="grid grid-cols-1 gap-3 bg-white p-4 sm:grid-cols-3"
                style={{
                  borderRadius: 20,
                  border: "1px solid #dbe9fe",
                  boxShadow: "0 10px 24px rgba(20, 62, 132, 0.07)",
                }}
              >
                <div className="rounded-xl bg-[#fff1f2] p-3">
                  <p className="text-xs font-black text-[#be123c]" style={{ margin: 0 }}>
                    Hàng 01 – 05 • Thương gia (+20%)
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600" style={{ margin: "4px 0 0 0" }}>
                    Khoang đầu yên tĩnh, chỗ để chân rộng rãi, ưu tiên lên xuống tàu bay đầu tiên.
                  </p>
                </div>
                <div className="rounded-xl bg-[#ecfdf5] p-3">
                  <p className="text-xs font-black text-[#15803d]" style={{ margin: 0 }}>
                    Hàng 06 – 14 • Tiêu chuẩn (0%)
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600" style={{ margin: "4px 0 0 0" }}>
                    Khu vực giữa cánh máy bay cân bằng và êm ái nhất, giữ nguyên giá vé cơ bản.
                  </p>
                </div>
                <div className="rounded-xl bg-[#f0f9ff] p-3">
                  <p className="text-xs font-black text-[#0369a1]" style={{ margin: 0 }}>
                    Hàng 15+ • Tiết kiệm (-5%)
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600" style={{ margin: "4px 0 0 0" }}>
                    Tối ưu chi phí với mức giảm 5% giá vé cơ bản, gần khu vực tiện ích phía sau.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sticky Seat Summary with Live Fare Breakdown) */}
        <div className="lg:col-span-4">
          <div
            className="sticky top-24 space-y-4 bg-white p-6"
            style={{
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.10)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2
                  className="truncate font-black tracking-tight text-[#092152]"
                  style={{ margin: 0, fontSize: 17, lineHeight: 1.25 }}
                >
                  Seat Summary
                </h2>
                <span className="mt-0.5 block font-extrabold text-[#0b5ed7]" style={{ fontSize: 11.5 }}>
                  {bookingStage === "outbound" ? "Chi tiết chỗ ngồi · Chiều đi" : "Chi tiết chỗ ngồi · Chiều về"}
                </span>
              </div>
              <span
                className="shrink-0 font-black"
                style={{
                  background: "#eef6ff",
                  color: "#0b4fd0",
                  borderRadius: 9999,
                  padding: "4px 11px",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {selectedList.length}/{totalPassengers} seat
              </span>
            </div>

            {/* Route Mini-Card */}
            <div
              className="p-3.5"
              style={{
                borderRadius: 16,
                background: "#f4f8ff",
                border: "1px solid #e4efff",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="block font-black text-[#092152]" style={{ fontSize: 16 }}>
                    {depCode}
                  </span>
                  <span className="font-semibold text-[#5a749b]" style={{ fontSize: 11 }}>
                    {depCity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center px-2">
                  <div className="relative flex w-full items-center justify-center">
                    <div className="w-full" style={{ borderTop: "1.5px dashed #bfd5f7" }} />
                    <span className="absolute bg-[#f4f8ff] px-1.5 text-xs font-bold text-[#0ea5e9]">
                      ✈
                    </span>
                  </div>
                  <span className="mt-1 font-bold text-[#0b5ed7]" style={{ fontSize: 10.5 }}>
                    {flightDuration}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-black text-[#092152]" style={{ fontSize: 16 }}>
                    {arrCode}
                  </span>
                  <span className="font-semibold text-[#5a749b]" style={{ fontSize: 11 }}>
                    {arrCity}
                  </span>
                </div>
              </div>
              <div
                className="mt-2.5 flex items-center justify-between border-t border-blue-100/80 pt-2 font-semibold text-slate-500"
                style={{ fontSize: 11 }}
              >
                <span>{formattedFlightDateEn}</span>
                <span className="font-extrabold text-[#091e47]">
                  {formatTime(currentFlight?.departure_time)} – {formatTime(currentFlight?.arrival_time)}
                </span>
              </div>
            </div>

            {/* Selected Seats Detailed List */}
            {selectedSeatDetails.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-blue-200 bg-[#f8fbff] p-4 text-center text-xs font-semibold text-slate-500">
                Vui lòng bấm chọn {totalPassengers} ghế trống trên sơ đồ tàu bay bên trái.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedSeatDetails.map((seat, idx) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between rounded-xl border border-blue-100 bg-[#f8fbff] px-3.5 py-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs font-black text-[#092152]">
                          HK {idx + 1}: Ghế {seat.seat_number}
                        </strong>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                          style={{
                            background: seat.tier.badgeBg,
                            color: seat.tier.badgeColor,
                          }}
                        >
                          {seat.tier.shortLabel}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#5a749b]">
                        Vị trí: {seat.tier.positionLabel}
                      </span>
                    </div>
                    <strong className="text-xs font-black text-[#0b4fd0]">
                      {currency.format(seat.tier.estimatedPrice)}
                    </strong>
                  </div>
                ))}

                <div className="flex items-baseline justify-between border-t border-blue-100 pt-2.5">
                  <span className="text-xs font-bold text-[#47628a]">
                    Giá vé tạm tính ({bookingStage === "outbound" ? "chiều đi" : "chiều về"})
                  </span>
                  <strong className="text-lg font-black text-[#0b4fd0]">
                    {currency.format(stageEstimatedTotal)}
                  </strong>
                </div>
              </div>
            )}

            {/* SkyAI Recommendation */}
            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#eef6ff] p-3.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white">
                <Robot size={14} weight="bold" />
              </div>
              <div>
                <span className="mb-0.5 flex items-center gap-1 text-xs font-extrabold text-[#0b2559]">
                  SkyAI gợi ý <Sparkle size={12} weight="fill" className="text-amber-500" />
                </span>
                <p className="text-[11px] font-medium leading-relaxed text-[#2d4b7a]" style={{ margin: 0 }}>
                  Hàng <strong>06–14</strong> (gần cánh) ổn định nhất; chọn hàng{" "}
                  <strong>15+</strong> để tiết kiệm 5% giá vé cơ bản.
                </p>
              </div>
            </div>

            {/* Next Action Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={selectedList.length !== totalPassengers || processing}
              className="inline-flex w-full items-center justify-center gap-2 py-3.5 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                borderRadius: 9999,
                border: "none",
                cursor:
                  selectedList.length !== totalPassengers || processing
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <span>
                {processing
                  ? "Locking seats..."
                  : flights.length > 1 && bookingStage === "outbound"
                    ? "Chọn ghế chiều về"
                    : "Confirm & Continue · Tiếp tục"}
              </span>
              <ArrowRight size={15} weight="bold" />
            </button>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" weight="bold" />
              <span>15-min exclusive seat lock • Bảo mật tuyệt đối</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

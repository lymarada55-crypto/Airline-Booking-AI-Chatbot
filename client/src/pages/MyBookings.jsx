import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AirplaneTilt,
  AirplaneTakeoff,
  AirplaneLanding,
  ArrowLeft,
  Ticket,
  CircleNotch,
  CalendarBlank,
  UserCircle,
  Clock,
  Armchair,
  CheckCircle,
  Copy,
  Check,
  Sparkle,
  ArrowRight,
  Buildings,
  Binoculars,
  CarProfile,
  ForkKnife,
  Hash,
  X
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CountdownTimer from "../components/CountdownTimer";

const HERO_BOOKINGS_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

// ─── Airline Config ─────────────────────────────────────────────────────────

const AIRLINE_CONFIG = {
  VN: {
    name: "Vietnam Airlines",
    badge: "bg-blue-600",
    text: "text-white",
    light: "bg-blue-50 text-blue-700 border-blue-200",
    accent: "from-blue-600 to-blue-400",
    dot: "bg-blue-600",
    logo: (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
        <span className="text-amber-300 font-black text-xs tracking-tight">VNA</span>
      </div>
    ),
  },
  VJ: {
    name: "VietJet Air",
    badge: "bg-red-500",
    text: "text-white",
    light: "bg-red-50 text-red-700 border-red-200",
    accent: "from-red-600 to-red-400",
    dot: "bg-red-500",
    logo: (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
        <span className="text-white font-black text-xs tracking-tight">VJA</span>
      </div>
    ),
  },
  FB: {
    name: "FlightBus",
    badge: "bg-violet-600",
    text: "text-white",
    light: "bg-violet-50 text-violet-700 border-violet-200",
    accent: "from-violet-600 to-purple-400",
    dot: "bg-violet-500",
    logo: (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-700 to-purple-500 flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
        <span className="text-white font-black text-xs tracking-tight">FBS</span>
      </div>
    ),
  },
};

const DEFAULT_AIRLINE = {
  name: "SkyLink Airlines",
  badge: "bg-blue-600",
  text: "text-white",
  light: "bg-blue-50 text-blue-700 border-blue-200",
  accent: "from-blue-600 to-indigo-500",
  dot: "bg-blue-600",
  logo: (
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
      <span className="text-white font-black text-xs tracking-wider">SKY</span>
    </div>
  ),
};

function getAirline(flightNumber = "") {
  const prefix = (flightNumber.match(/^[A-Za-z]+/) ?? [""])[0].toUpperCase();
  return AIRLINE_CONFIG[prefix] ?? DEFAULT_AIRLINE;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const formatDate = (d) =>
  new Date(d).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN").format(amount) + " đ";

const calcDuration = (dep, arr) => {
  const ms = new Date(arr) - new Date(dep);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}g ${m}p`;
};

// ─── Status Helpers ───────────────────────────────────────────────────────────

const STATUS_STYLE = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  pending: "bg-amber-50 text-amber-700 border-amber-200/80",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200/80",
};

const STATUS_TEXT = {
  paid: "✓ Đã thanh toán",
  pending: "⏳ Chờ thanh toán",
  cancelled: "✕ Đã hủy",
};

// ─── BookingCard Component ───────────────────────────────────────────────────

function BookingCard({ booking, idx, onRequestCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const flight = booking.flight;
  const airline = getAirline(flight?.flight_number ?? "");
  const status = booking.status;
  const serviceStartDate = flight?.arrival_time?.slice(0, 10) || flight?.departure_time?.slice(0, 10) || "";

  let attachedSpecialMeal = null;
  try {
    const mealMap = JSON.parse(localStorage.getItem("skylink_flight_special_meals") || "{}");
    attachedSpecialMeal = mealMap[booking.pnr_code] || mealMap[`VE-${booking.id}`] || null;
  } catch {
    attachedSpecialMeal = null;
  }

  const getNextDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-").map(Number);
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
    return nextDate.toISOString().slice(0, 10);
  };

  const openTravelService = (type) => {
    const params = new URLSearchParams({
      q: flight?.arrival_airport?.city || "",
      start_date: serviceStartDate,
      guests: String(Math.max(1, booking.tickets?.length || 1)),
      booking_id: String(booking.id),
    });

    if (type === "hotel" || type === "car") {
      params.set("end_date", getNextDate(serviceStartDate));
    }

    navigate(`/travel/${type}?${params.toString()}`);
  };

  const handleCopyPnr = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(booking.pnr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCheckInStatus = () => {
    if (!flight || status !== "paid") {
      return { isOpen: false, label: "Làm thủ tục (Check-in)" };
    }
    const depTime = new Date(flight.departure_time).getTime();
    const now = new Date().getTime();
    const checkInOpenTime = depTime - 24 * 60 * 60 * 1000;
    const checkInCloseTime = depTime - 2 * 60 * 60 * 1000;

    if (now < checkInOpenTime) {
      return { isOpen: false, label: "Làm thủ tục (Chưa mở)" };
    } else if (now > checkInCloseTime) {
      return { isOpen: false, label: "Làm thủ tục (Đã đóng)" };
    } else {
      return { isOpen: true, label: "Làm thủ tục Check-in ngay" };
    }
  };

  const checkInStatus = getCheckInStatus();

  return (
    <motion.div
      key={booking.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.3 }}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group"
    >
      {/* Top Gradient Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${airline.accent}`} />

      <div className="p-6 sm:p-7">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          
          {/* Left: Airline Branding */}
          <div className="flex items-center gap-3">
            {airline.logo}
            <div>
              <p className="text-base font-extrabold text-slate-900 leading-tight">
                {airline.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-0.5 font-mono">
                  <Hash size={12} weight="bold" /> {flight?.flight_number ?? "—"}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs font-semibold text-slate-400">
                  {flight?.aircraft?.model ?? "Airbus A320neo"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: PNR Code & Status Badge */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {/* PNR Code Pill with Copy */}
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Mã PNR:</span>
              <strong className="font-mono text-sm font-black text-slate-900 tracking-wider">
                {booking.pnr_code}
              </strong>
              <button
                type="button"
                onClick={handleCopyPnr}
                title="Sao chép mã PNR"
                className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-0.5"
              >
                {copied ? <Check size={14} className="text-emerald-600 font-bold" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Status Pill */}
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${STATUS_STYLE[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {STATUS_TEXT[status] ?? status}
            </span>
          </div>
        </div>

        {/* Route Flight Timeline Banner */}
        <div className="bg-slate-50/80 rounded-2xl p-5 mb-5 border border-slate-100">
          <div className="flex items-center gap-4">
            
            {/* Departure Airport */}
            <div className="text-left min-w-[90px]">
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatTime(flight?.departure_time)}
              </div>
              <div className="text-xs font-black text-blue-600 uppercase tracking-wider mt-0.5">
                {flight?.departure_airport?.code ?? "—"}
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate max-w-[110px]">
                {flight?.departure_airport?.city ?? ""}
              </div>
            </div>

            {/* Flight Flight Graphic Line */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/70 shadow-2xs">
                <Clock size={12} weight="bold" />
                {flight ? calcDuration(flight.departure_time, flight.arrival_time) : "—"}
              </span>

              <div className="w-full flex items-center gap-2 my-1">
                <AirplaneTakeoff size={16} weight="fill" className="text-blue-600 shrink-0" />
                <div className="flex-1 h-0.5 bg-slate-200 rounded-full relative">
                  <div className="absolute inset-0 bg-blue-600/40 rounded-full" />
                </div>
                <AirplaneLanding size={16} weight="fill" className="text-blue-600 shrink-0" />
              </div>

              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Bay trực tiếp
              </span>
            </div>

            {/* Arrival Airport */}
            <div className="text-right min-w-[90px]">
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatTime(flight?.arrival_time)}
              </div>
              <div className="text-xs font-black text-blue-600 uppercase tracking-wider mt-0.5">
                {flight?.arrival_airport?.code ?? "—"}
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate max-w-[110px]">
                {flight?.arrival_airport?.city ?? ""}
              </div>
            </div>

          </div>

          {/* Departure Date Row */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <CalendarBlank size={14} weight="bold" className="text-blue-600" />
              Ngày khởi hành: {flight ? formatDate(flight.departure_time) : "—"}
            </span>

            {status === "pending" && booking.expires_at && (
              <CountdownTimer
                expiresAt={booking.expires_at}
                onExpire={() => window.location.reload()}
              />
            )}
          </div>
        </div>

        {/* Passenger & Price Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <UserCircle size={16} className="text-blue-600" weight="bold" />
              <span>{booking.tickets?.length ?? 0} hành khách</span>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              {expanded ? "Thu gọn ▲" : "Xem chi tiết vé ▼"}
            </button>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium block">Tổng cộng:</span>
            <span className="text-xl font-black text-blue-600 tracking-tight">
              {formatCurrency(booking.total_amount ?? booking.total_price ?? 0)}
            </span>
          </div>
        </div>

        {/* Attached Special Meal Detail Strip (when user registered a special meal for this PNR) */}
        {attachedSpecialMeal && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <ForkKnife size={18} weight="fill" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-emerald-950">
                    Suất ăn đặc biệt: {attachedSpecialMeal.code} – {attachedSpecialMeal.title}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                    Miễn phí kèm vé
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] font-medium text-emerald-800">
                  Danh mục: {attachedSpecialMeal.category || "Tiêu chuẩn IATA"} • Phục vụ theo số ghế trên chuyến bay này.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/services/meals")}
              className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100 cursor-pointer"
            >
              Đổi suất ăn
            </button>
          </div>
        )}

        {/* Expandable Tickets Details Drawer */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket size={14} weight="bold" className="text-blue-600" />
                  Danh sách vé & Ghế ngồi hành khách
                </p>

                {booking.tickets?.map((ticket, ti) => (
                  <div
                    key={ti}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-2xs font-bold text-sm">
                        {ti + 1}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 uppercase">
                          {ticket.passenger_name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">
                          CCCD/Passport: {ticket.identity_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Seat Badge */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                        <Armchair size={15} weight="bold" className="text-blue-600" />
                        <span className="text-xs font-extrabold text-slate-900">
                          Ghế {ticket.seat?.seat_number ?? "N/A"}
                        </span>
                      </div>

                      {/* Ticket Code */}
                      <div className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 uppercase font-mono tracking-wider">
                        {ticket.ticket_code?.slice(0, 10)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Row */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">

          {/* Pay Now Button (For Pending Status) */}
          {status === "pending" && (
            <button
              type="button"
              onClick={() => navigate(`/payment-retry/${booking.id}`, { state: { booking } })}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              Thanh toán ngay <ArrowRight size={16} weight="bold" />
            </button>
          )}

          {/* Check-in Button (For Paid Status) */}
          {status === "paid" && (
            <button
              type="button"
              disabled={!checkInStatus.isOpen}
              onClick={() => navigate(`/check-in?pnr=${booking.pnr_code}`)}
              className={`w-full sm:flex-1 py-3.5 px-4 rounded-2xl text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                checkInStatus.isOpen
                  ? "text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 cursor-pointer"
                  : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle size={18} weight="bold" />
              {checkInStatus.label}
            </button>
          )}

          {/* Reschedule & Cancel Action Buttons */}
          {new Date() < new Date(flight?.departure_time) && status !== "cancelled" && (
            <>
              <button
                type="button"
                onClick={() => navigate('/search', { state: { rescheduleBooking: booking } })}
                className="py-3 px-4 rounded-2xl text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all duration-200 cursor-pointer"
              >
                Đổi chuyến bay
              </button>

              <button
                type="button"
                onClick={() => onRequestCancel(booking)}
                className="py-3 px-4 rounded-2xl text-xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all duration-200 cursor-pointer"
              >
                Hủy vé
              </button>
            </>
          )}

        </div>

        {status === "paid" && flight?.arrival_time && new Date(flight.arrival_time) >= new Date() && (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="mb-3">
              <p className="text-sm font-extrabold text-blue-950">Thêm dịch vụ cho chuyến đi</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-800">
                Dịch vụ được đặt riêng và liên kết với vé này; việc hủy dịch vụ không ảnh hưởng đến vé máy bay.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "hotel", label: "Khách sạn", Icon: Buildings },
                { type: "experience", label: "Trải nghiệm", Icon: Binoculars },
                { type: "car", label: "Thuê xe", Icon: CarProfile },
              ].map(({ type, label, Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => openTravelService(type)}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-blue-800 transition hover:border-blue-400 hover:bg-blue-100 cursor-pointer"
                >
                  <Icon size={16} weight="bold" />
                  {label}
                  <ArrowRight size={14} weight="bold" />
                </button>
              ))}
              {!attachedSpecialMeal && (
                <button
                  type="button"
                  onClick={() => navigate("/services/meals")}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-extrabold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 cursor-pointer"
                >
                  <ForkKnife size={16} weight="fill" />
                  Suất ăn đặc biệt (Miễn phí)
                  <ArrowRight size={14} weight="bold" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}

// ─── Main MyBookings Page ──────────────────────────────────────────────────

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusNotice, setStatusNotice] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const loadBookings = async () => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setBookings(list);
      } else {
        setError(data.message || "Lỗi khi tải lịch sử vé.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [navigate]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setError("");
    setStatusNotice("");
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const res = await fetch(`/api/bookings/${cancelTarget.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setStatusNotice(data.message || `Đã hủy vé mã ${cancelTarget.pnr_code} thành công.`);
        setCancelTarget(null);
        await loadBookings();
      } else {
        setError(data.message || "Không thể hủy vé lúc này.");
        setCancelTarget(null);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi khi kết nối tới máy chủ.");
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  };

  // Filter Bookings by activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "paid") return b.status === "paid";
    if (activeTab === "pending") return b.status === "pending";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const getTabCount = (statusKey) => {
    if (statusKey === "all") return bookings.length;
    return bookings.filter((b) => b.status === statusKey).length;
  };

  return (
    <div
      className="min-h-screen font-sans text-slate-900"
      style={{
        background:
          "linear-gradient(180deg, #b8dcff 0%, #dceeff 26%, #eef6ff 64%, #d6eaff 100%)",
      }}
    >
      <Navbar />

      <main className="relative overflow-hidden pb-16 pt-20">
        {/* HERO BACKGROUND LAYER */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: 315 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.85) 46%, rgba(225,241,255,0.20) 100%)",
            }}
          />
          <img
            src={HERO_BOOKINGS_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 32%",
              opacity: 0.9,
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 34%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 34%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 92,
              background: "linear-gradient(180deg, rgba(220,238,255,0) 0%, #dceeff 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
          {/* Top Hero Header */}
          <header className="pb-6 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-[#16428b] shadow-sm transition hover:bg-white"
              style={{
                border: "1px solid rgba(255,255,255,0.96)",
                borderRadius: 9999,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} weight="bold" />
              Quay lại trang chủ
            </Link>

            <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  <Ticket size={15} weight="fill" />
                  SKYLINK AIRLINES • QUẢN LÝ ĐẶT CHỖ
                </p>
                <h1
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                    color: "#091e47",
                    lineHeight: 1.12,
                    margin: "0 0 6px 0",
                  }}
                >
                  Chuyến bay của tôi
                </h1>
                <p className="text-xs font-semibold text-[#2d4b7a] sm:text-sm" style={{ margin: 0 }}>
                  Quản lý mã đặt chỗ (PNR), đăng ký suất ăn đặc biệt, làm thủ tục trực tuyến
                  (Check-in) và đặt thêm dịch vụ.
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 bg-white/95 px-4 py-2.5 shadow-sm"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
              >
                <Sparkle size={17} className="text-blue-600" weight="fill" />
                <span className="text-xs font-bold text-[#163d7a]">
                  Tổng số vé: <strong className="font-black text-[#0b4fd0]">{bookings.length}</strong>
                </span>
              </div>
            </div>
          </header>

          {/* Filter Tabs Pill Bar */}
          <div
            className="mb-6 flex flex-wrap items-center justify-between gap-2"
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 12px 28px rgba(18, 60, 130, 0.08)",
              borderRadius: 9999,
              padding: "8px 10px",
            }}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "Tất cả" },
                { id: "paid", label: "Đã thanh toán" },
                { id: "pending", label: "Chờ thanh toán" },
                { id: "cancelled", label: "Đã hủy" },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                const count = getTabCount(tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="inline-flex items-center gap-2 text-xs font-extrabold transition"
                    style={
                      isSelected
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            boxShadow: "0 6px 16px rgba(13, 97, 225, 0.28)",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                            padding: "8px 14px",
                            whiteSpace: "nowrap",
                          }
                        : {
                            background: "transparent",
                            color: "#1e3f77",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                            padding: "8px 14px",
                            whiteSpace: "nowrap",
                          }
                    }
                  >
                    <span>{tab.label}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-black"
                      style={{
                        background: isSelected ? "rgba(255,255,255,0.22)" : "#e8f1fe",
                        color: isSelected ? "#ffffff" : "#0b4fd0",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <Link
              to="/my-travel-services"
              className="hidden items-center gap-1.5 text-xs font-extrabold text-[#0b4fd0] transition hover:bg-blue-50 sm:inline-flex"
              style={{
                borderRadius: 9999,
                textDecoration: "none",
                padding: "8px 14px",
                whiteSpace: "nowrap",
              }}
            >
              <span>Dịch vụ đã đặt</span>
              <ArrowRight size={13} weight="bold" />
            </Link>
          </div>

          {statusNotice && (
            <div
              role="status"
              className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800"
            >
              {statusNotice}
            </div>
          )}

          {/* Content Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/90 py-20 text-slate-400">
              <CircleNotch size={36} className="animate-spin text-blue-600" />
              <p className="text-xs font-bold text-slate-500">Đang tải lịch sử đặt vé của bạn...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div
              className="rounded-3xl bg-white/95 p-12 text-center shadow-sm sm:p-16"
              style={{ border: "1px solid rgba(255,255,255,0.98)" }}
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner">
                <AirplaneTilt size={32} weight="fill" />
              </div>
              <h3 className="mb-2 text-xl font-black text-[#092152]">
                {activeTab === "all" ? "Chưa có chuyến bay nào" : "Không có vé phù hợp với bộ lọc"}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
                {activeTab === "all"
                  ? "Bạn chưa thực hiện giao dịch đặt vé nào. Hãy bắt đầu tìm chuyến bay đầu tiên để trải nghiệm dịch vụ 5 sao từ SkyLink!"
                  : "Không tìm thấy vé nào thuộc danh mục này. Bạn có thể chuyển về tab Tất cả chuyến bay."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/flights")}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold text-white shadow-md transition hover:opacity-95"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Tìm chuyến bay ngay <ArrowRight size={15} weight="bold" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking, idx) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  idx={idx}
                  onRequestCancel={(b) => setCancelTarget(b)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Clean Confirmation Modal for Ticket Cancellation (Replaces window.confirm) */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ background: "rgba(9, 25, 58, 0.52)", backdropFilter: "blur(6px)" }}
          onClick={() => !cancelling && setCancelTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-white p-6 shadow-2xl"
            style={{ borderRadius: 24, border: "1px solid #dbe9fe" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600" style={{ margin: 0 }}>
                  Xác nhận hủy đặt vé
                </p>
                <h2 className="mt-1 text-lg font-black text-[#092152]" style={{ margin: "4px 0 0 0" }}>
                  Hủy vé mã {cancelTarget.pnr_code}?
                </h2>
              </div>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <p className="mt-3 text-xs font-medium leading-relaxed text-slate-600">
              Bạn có chắc chắn muốn hủy đặt chỗ chuyến bay này? Sau khi hủy, ghế sẽ được mở lại cho
              hành khách khác và thao tác không thể hoàn tác.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                style={{
                  borderRadius: 9999,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Giữ lại vé
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-5 py-2 text-xs font-extrabold text-white transition hover:opacity-95 disabled:opacity-50"
                style={{
                  background: "#e11d48",
                  borderRadius: 9999,
                  border: "none",
                  cursor: cancelling ? "wait" : "pointer",
                }}
              >
                {cancelling ? "Đang hủy vé..." : "Xác nhận hủy vé"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

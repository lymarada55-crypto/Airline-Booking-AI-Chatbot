import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AirplaneTilt,
  Armchair,
  ArrowLeft,
  ArrowRight,
  Binoculars,
  Buildings,
  CalendarBlank,
  CaretDown,
  CaretUp,
  CarProfile,
  Check,
  CheckCircle,
  CircleNotch,
  Clock,
  Copy,
  ForkKnife,
  MagnifyingGlass,
  SealCheck,
  Sparkle,
  Ticket,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CountdownTimer from "../components/CountdownTimer";

const HERO_BOOKINGS_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

// ─── Unified 5-Star Airline Brand Tiles (Synced with FlightCard & SeatSelection) ───

const VietnamAirlinesTile = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 50,
      height: 50,
      borderRadius: 14,
      background: "linear-gradient(145deg, #00556e 0%, #006d88 100%)",
      padding: "4px 3px",
    }}
  >
    <svg viewBox="0 0 44 26" fill="none" style={{ width: 28, height: 16 }}>
      <path
        d="M22 2C22 2 24.4 9.5 27.6 12C31.2 14.8 38.5 14 38.5 14C38.5 14 32 18.2 28.2 20.5C24.5 22.8 22 24.5 22 24.5C22 24.5 19.5 22.8 15.8 20.5C12 18.2 5.5 14 5.5 14C5.5 14 12.8 14.8 16.4 12C19.6 9.5 22 2 22 2Z"
        fill="#F4B41A"
      />
    </svg>
    <span className="mt-0.5 text-center font-bold leading-none text-white/95" style={{ fontSize: 8 }}>
      Vietnam
    </span>
  </div>
);

const VietjetTile = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 50,
      height: 50,
      borderRadius: 14,
      background: "linear-gradient(145deg, #d9141d 0%, #f0232b 100%)",
      padding: "4px 3px",
    }}
  >
    <svg viewBox="0 0 40 24" fill="none" style={{ width: 26, height: 15 }}>
      <path d="M6 4L20 20L34 4" stroke="#FFF200" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="11" r="2.6" fill="#FFFFFF" />
    </svg>
    <span className="mt-0.5 text-center font-extrabold leading-none text-white" style={{ fontSize: 8 }}>
      VietJet
    </span>
  </div>
);

const BambooTile = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 50,
      height: 50,
      borderRadius: 14,
      background: "linear-gradient(145deg, #006633 0%, #009944 100%)",
      padding: "4px 3px",
    }}
  >
    <svg viewBox="0 0 40 26" fill="none" style={{ width: 26, height: 16 }}>
      <path d="M9 21C12 13 19 7 30 4C25 12 18 18 9 21Z" fill="#FFFFFF" />
      <path d="M13 24C16 18 22 13 31 11C27 17 21 21 13 24Z" fill="#38BDF8" />
    </svg>
    <span className="mt-0.5 text-center font-bold leading-none text-white/95" style={{ fontSize: 8 }}>
      Bamboo
    </span>
  </div>
);

const SkyLinkTile = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 50,
      height: 50,
      borderRadius: 14,
      background: "linear-gradient(145deg, #092c7a 0%, #0284c7 100%)",
      padding: "4px 3px",
    }}
  >
    <svg viewBox="0 0 40 24" fill="none" style={{ width: 26, height: 15 }}>
      <path d="M20 18L4 6L15 11L20 18Z" fill="#7DD3FC" />
      <path d="M20 18L36 6L25 11L20 18Z" fill="#FFFFFF" />
      <path d="M20 4L23 13L20 18L17 13L20 4Z" fill="#E0F2FE" />
    </svg>
    <span className="mt-0.5 text-center font-extrabold leading-none text-white" style={{ fontSize: 8 }}>
      SkyLink
    </span>
  </div>
);

const AIRLINE_CONFIG = {
  VN: {
    name: "Vietnam Airlines",
    logo: <VietnamAirlinesTile />,
    defaultAircraft: "Boeing 787",
  },
  VJ: {
    name: "VietJet Air",
    logo: <VietjetTile />,
    defaultAircraft: "Airbus A320neo",
  },
  QH: {
    name: "Bamboo Airways",
    logo: <BambooTile />,
    defaultAircraft: "Embraer 190",
  },
  FB: {
    name: "Bamboo Airways",
    logo: <BambooTile />,
    defaultAircraft: "Embraer 190",
  },
};

const DEFAULT_AIRLINE = {
  name: "SkyLink Airlines",
  logo: <SkyLinkTile />,
  defaultAircraft: "Airbus A350-900",
};

function getAirline(flightNumber = "") {
  const prefix = (String(flightNumber).match(/^[A-Za-z]+/) ?? [""])[0].toUpperCase();
  return AIRLINE_CONFIG[prefix] ?? DEFAULT_AIRLINE;
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

const formatTime = (d) => {
  if (!d) return "--:--";
  const dt = new Date(String(d).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return "--:--";
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
};

const formatDateEn = (d) => {
  if (!d) return "—";
  const dt = new Date(String(d).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return "—";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[dt.getDay()]}, ${String(dt.getDate()).padStart(2, "0")} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
};

const formatCurrency = (amount) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(amount) || 0))} ₫`;

const calcDurationEn = (dep, arr) => {
  if (!dep || !arr) return "—";
  const ms = new Date(String(arr).replace(" ", "T")) - new Date(String(dep).replace(" ", "T"));
  if (Number.isNaN(ms) || ms <= 0) return "—";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const STATUS_BADGE = {
  paid: {
    label: "✓ Paid · Đã thanh toán",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0",
  },
  pending: {
    label: "⏳ Pending · Chờ thanh toán",
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fde68a",
  },
  cancelled: {
    label: "✕ Cancelled · Đã hủy",
    bg: "#ffe4e6",
    color: "#be123c",
    border: "#fecdd3",
  },
};

// ─── Compact 5-Star BookingCard Component ─────────────────────────────────────

function BookingCard({ booking, idx, onRequestCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const flight = booking.flight;
  const airline = getAirline(flight?.flight_number ?? "");
  const status = booking.status;
  const badge = STATUS_BADGE[status] || {
    label: status,
    bg: "#f1f5f9",
    color: "#475569",
    border: "#e2e8f0",
  };
  const serviceStartDate =
    flight?.arrival_time?.slice(0, 10) || flight?.departure_time?.slice(0, 10) || "";

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
    navigator.clipboard?.writeText(booking.pnr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCheckInStatus = () => {
    if (!flight || status !== "paid") {
      return { isOpen: false, label: "Online Check-in" };
    }
    const depTime = new Date(flight.departure_time).getTime();
    const now = Date.now();
    const checkInOpenTime = depTime - 24 * 60 * 60 * 1000;
    const checkInCloseTime = depTime - 2 * 60 * 60 * 1000;

    if (now < checkInOpenTime) {
      return { isOpen: false, label: "Check-in (Chưa mở)" };
    }
    if (now > checkInCloseTime) {
      return { isOpen: false, label: "Check-in (Đã đóng)" };
    }
    return { isOpen: true, label: "Online Check-in · Làm thủ tục ngay" };
  };

  const checkInStatus = getCheckInStatus();
  const seatsLabel =
    booking.tickets?.length > 0
      ? booking.tickets
          .map((t) => t.seat?.seat_number)
          .filter(Boolean)
          .join(", ") || "Auto"
      : "Auto";
  const isUpcoming = flight?.departure_time && new Date() < new Date(flight.departure_time);
  const canAddTripServices =
    status === "paid" && flight?.arrival_time && new Date(flight.arrival_time) >= new Date();

  return (
    <motion.div
      key={booking.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.04, 0.2), duration: 0.25 }}
      className="overflow-hidden bg-white transition hover:shadow-lg"
      style={{
        borderRadius: 22,
        border: status === "pending" ? "1.5px solid #fcd34d" : "1px solid #dbe7fb",
        boxShadow: "0 8px 24px rgba(18, 60, 130, 0.06)",
      }}
    >
      <div className="p-5">
        {/* Row 1: Airline Tile + Name + Code | PNR Pill + Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex min-w-0 items-center gap-3">
            {airline.logo}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3
                  className="truncate font-black text-[#091e47]"
                  style={{ margin: 0, fontSize: 15.5, lineHeight: 1.2 }}
                >
                  {airline.name}
                </h3>
                <SealCheck size={16} weight="fill" className="shrink-0 text-[#2563eb]" />
                <span
                  className="font-mono font-bold text-slate-600"
                  style={{
                    fontSize: 11,
                    background: "#f1f5f9",
                    borderRadius: 6,
                    padding: "1px 7px",
                  }}
                >
                  {flight?.flight_number ?? "—"}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] font-semibold text-slate-400" style={{ margin: "2px 0 0 0" }}>
                {flight?.aircraft?.model ?? airline.defaultAircraft} •{" "}
                {flight ? formatDateEn(flight.departure_time) : "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* PNR Pill */}
            <button
              type="button"
              onClick={handleCopyPnr}
              title="Copy PNR Code"
              className="inline-flex cursor-pointer items-center gap-1.5 transition hover:bg-blue-50"
              style={{
                background: "#f4f8ff",
                border: "1px solid #dbe7fb",
                borderRadius: 9999,
                padding: "4px 11px",
                fontSize: 12,
              }}
            >
              <span className="font-bold text-slate-500">PNR:</span>
              <strong className="font-mono font-black tracking-wider text-[#0b5ed7]">
                {booking.pnr_code}
              </strong>
              {copied ? (
                <Check size={13} weight="bold" className="text-emerald-600" />
              ) : (
                <Copy size={13} className="text-slate-400" />
              )}
            </button>

            {/* Status Pill */}
            <span
              className="inline-flex items-center font-extrabold"
              style={{
                background: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
                borderRadius: 9999,
                padding: "4px 12px",
                fontSize: 11.5,
                whiteSpace: "nowrap",
              }}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Row 2: Compact Flight Timeline + Right Price Column */}
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Timeline */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-[92px]">
              <div className="font-black leading-none text-[#091e47]" style={{ fontSize: 22 }}>
                {formatTime(flight?.departure_time)}
              </div>
              <div className="mt-1 truncate text-xs font-semibold text-slate-500">
                {flight?.departure_airport?.city || ""}{" "}
                <strong className="text-[#091e47]">({flight?.departure_airport?.code ?? "—"})</strong>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center px-2">
              <div className="relative flex h-5 w-full items-center justify-center">
                <div className="w-full" style={{ borderTop: "1.5px dashed #cbd5e1" }} />
                <span className="absolute bg-white px-2 text-[#0ea5e9]">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}>
                    <path
                      d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                      transform="rotate(90 12 12)"
                    />
                  </svg>
                </span>
              </div>
              <span
                className="mt-1 font-extrabold text-[#1d4ed8]"
                style={{
                  background: "#eff6ff",
                  borderRadius: 9999,
                  padding: "1px 9px",
                  fontSize: 11,
                }}
              >
                {flight ? calcDurationEn(flight.departure_time, flight.arrival_time) : "—"}
              </span>
              <span className="mt-0.5 text-[11px] font-extrabold text-[#0264c8]">
                Direct · Bay thẳng
              </span>
            </div>

            <div className="min-w-[92px] text-right">
              <div className="font-black leading-none text-[#091e47]" style={{ fontSize: 22 }}>
                {formatTime(flight?.arrival_time)}
              </div>
              <div className="mt-1 truncate text-xs font-semibold text-slate-500">
                {flight?.arrival_airport?.city || ""}{" "}
                <strong className="text-[#091e47]">({flight?.arrival_airport?.code ?? "—"})</strong>
              </div>
            </div>
          </div>

          {/* Right Total Fare + Countdown */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 pt-3 lg:w-[200px] lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="text-left lg:text-right">
              <span className="block text-[11px] font-semibold text-slate-400">
                Total · Tổng cộng
              </span>
              <span
                className="font-black text-[#0b5ed7]"
                style={{ fontSize: 21, whiteSpace: "nowrap" }}
              >
                {formatCurrency(booking.total_amount ?? booking.total_price ?? 0)}
              </span>
            </div>

            {status === "pending" && booking.expires_at && (
              <div className="mt-1">
                <CountdownTimer
                  expiresAt={booking.expires_at}
                  onExpire={() => window.location.reload()}
                />
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Ice-Blue Meta Strip (Passengers | Seat | Date | Expand Details) */}
        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5"
          style={{
            background: "#f4f8ff",
            border: "1px solid #e4efff",
            borderRadius: 14,
          }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[#1e3f77]">
            <span className="inline-flex items-center gap-1.5">
              <UserCircle size={15} weight="fill" className="text-[#1d64f2]" />
              {booking.tickets?.length ?? 0} passenger(s)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Armchair size={15} weight="fill" className="text-[#1d64f2]" />
              Seat · Ghế: <strong className="text-[#0b5ed7]">{seatsLabel}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlank size={15} weight="fill" className="text-[#1d64f2]" />
              {flight ? formatDateEn(flight.departure_time) : "—"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-1 font-extrabold text-[#0b5ed7] hover:underline"
            style={{ background: "none", border: "none", fontSize: 12, padding: 0 }}
          >
            <span>{expanded ? "Hide details · Thu gọn" : "Ticket details · Chi tiết vé"}</span>
            {expanded ? <CaretUp size={13} weight="bold" /> : <CaretDown size={13} weight="bold" />}
          </button>
        </div>

        {/* Attached Special Meal Strip */}
        {attachedSpecialMeal && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <ForkKnife size={16} weight="fill" />
              </span>
              <div>
                <span className="text-xs font-black text-emerald-950">
                  Special Meal · Suất ăn: {attachedSpecialMeal.code} – {attachedSpecialMeal.title}
                </span>
                <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                  Free · Miễn phí
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/services/meals")}
              className="cursor-pointer rounded-full border border-emerald-300 bg-white px-3 py-1 text-[11px] font-extrabold text-emerald-800 hover:bg-emerald-100"
            >
              Change · Đổi suất ăn
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
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-3.5 space-y-2.5 border-t border-slate-100 pt-3.5">
                <p
                  className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0b5ed7]"
                  style={{ margin: 0 }}
                >
                  <Ticket size={14} weight="fill" />
                  Passengers & E-Tickets · Danh sách vé & Ghế ngồi
                </p>

                {booking.tickets?.map((ticket, ti) => (
                  <div
                    key={ti}
                    className="flex flex-col justify-between gap-2.5 rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-xs font-black text-[#0b5ed7]">
                        {ti + 1}
                      </span>
                      <div>
                        <p className="text-xs font-black uppercase text-[#091e47]" style={{ margin: 0 }}>
                          {ticket.passenger_name}
                        </p>
                        <p className="font-mono text-[11px] font-semibold text-slate-500" style={{ margin: "2px 0 0 0" }}>
                          ID / Passport: {ticket.identity_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-extrabold text-[#091e47]">
                        <Armchair size={13} weight="fill" className="text-[#0b5ed7]" />
                        Seat {ticket.seat?.seat_number ?? "N/A"}
                      </span>
                      <span className="rounded-full border border-blue-200 bg-[#eff6ff] px-3 py-1 font-mono text-[10.5px] font-black uppercase text-[#0b5ed7]">
                        {ticket.ticket_code?.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 4: Clean Pill Action Buttons + Compact Inline Trip Add-ons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Pending -> Pay Now */}
            {status === "pending" && (
              <button
                type="button"
                onClick={() => navigate(`/payment-retry/${booking.id}`, { state: { booking } })}
                className="inline-flex cursor-pointer items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105"
                style={{
                  background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                  borderRadius: 9999,
                  border: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span>Pay Now · Thanh toán ngay</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            )}

            {/* Paid -> Online Check-in */}
            {status === "paid" && (
              <button
                type="button"
                disabled={!checkInStatus.isOpen}
                onClick={() => navigate(`/check-in?pnr=${booking.pnr_code}`)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold transition"
                style={
                  checkInStatus.isOpen
                    ? {
                        background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                        color: "#ffffff",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        boxShadow: "0 4px 12px rgba(29, 78, 216, 0.25)",
                      }
                    : {
                        background: "#f1f5f9",
                        color: "#94a3b8",
                        border: "1px solid #e2e8f0",
                        borderRadius: 9999,
                        cursor: "not-allowed",
                        whiteSpace: "nowrap",
                      }
                }
              >
                <CheckCircle size={15} weight="bold" />
                <span>{checkInStatus.label}</span>
              </button>
            )}

            {/* Reschedule & Cancel */}
            {isUpcoming && status !== "cancelled" && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/search", { state: { rescheduleBooking: booking } })}
                  className="inline-flex cursor-pointer items-center gap-1 px-4 py-2 text-xs font-extrabold text-amber-800 transition hover:bg-amber-100"
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: 9999,
                    whiteSpace: "nowrap",
                  }}
                >
                  Reschedule · Đổi chuyến
                </button>

                <button
                  type="button"
                  onClick={() => onRequestCancel(booking)}
                  className="inline-flex cursor-pointer items-center gap-1 px-4 py-2 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100"
                  style={{
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: 9999,
                    whiteSpace: "nowrap",
                  }}
                >
                  Cancel · Hủy vé
                </button>
              </>
            )}
          </div>

          {/* Compact Inline Trip Add-on Pills for Upcoming Paid Flights */}
          {canAddTripServices && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { type: "hotel", label: "Hotel", Icon: Buildings },
                { type: "experience", label: "Tours", Icon: Binoculars },
                { type: "car", label: "Car", Icon: CarProfile },
              ].map(({ type, label, Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => openTravelService(type)}
                  className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-[11px] font-extrabold text-[#0b5ed7] transition hover:bg-blue-50"
                  style={{
                    background: "#f8fbff",
                    border: "1px solid #d5e5fc",
                    borderRadius: 9999,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={13} weight="bold" />
                  <span>{label}</span>
                </button>
              ))}
              {!attachedSpecialMeal && (
                <button
                  type="button"
                  onClick={() => navigate("/services/meals")}
                  className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-[11px] font-extrabold text-emerald-700 transition hover:bg-emerald-100"
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: 9999,
                    whiteSpace: "nowrap",
                  }}
                >
                  <ForkKnife size={13} weight="fill" />
                  <span>Free Meal</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main MyBookings Page ─────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6;

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusNotice, setStatusNotice] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  // Filter Bookings by activeTab + searchQuery (PNR, flight number, airport code/city)
  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      if (activeTab !== "all" && b.status !== activeTab) return false;
      if (!q) return true;
      const haystack = [
        b.pnr_code,
        b.flight?.flight_number,
        b.flight?.departure_airport?.code,
        b.flight?.departure_airport?.city,
        b.flight?.arrival_airport?.code,
        b.flight?.arrival_airport?.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [bookings, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBookings = filteredBookings.slice(
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
          style={{ height: 290 }}
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
          <header className="pb-5 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                <span>Back to Home · Trang chủ</span>
              </Link>

              <Link
                to="/my-travel-services"
                className="inline-flex items-center gap-1.5 bg-white/95 px-4 py-1.5 text-xs font-extrabold text-[#0b4fd0] shadow-sm transition hover:bg-blue-50"
                style={{
                  border: "1px solid #d5e6fc",
                  borderRadius: 9999,
                  textDecoration: "none",
                }}
              >
                <span>My Travel Services · Dịch vụ đã đặt</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em]"
                  style={{ color: "#0b57d0", margin: "0 0 3px 0" }}
                >
                  <Ticket size={15} weight="fill" />
                  SKYLINK AIRLINES • MY BOOKINGS · QUẢN LÝ ĐẶT CHỖ
                </p>
                <h1
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(1.85rem, 3.2vw, 2.5rem)",
                    color: "#091e47",
                    lineHeight: 1.12,
                    margin: "0 0 5px 0",
                  }}
                >
                  Chuyến bay của tôi
                </h1>
                <p className="text-xs font-semibold text-[#2d4b7a] sm:text-sm" style={{ margin: 0 }}>
                  Manage your PNR bookings, online check-in, special meals & travel add-ons.
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 bg-white/95 px-4 py-2 shadow-sm"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
              >
                <Sparkle size={16} className="text-blue-600" weight="fill" />
                <span className="text-xs font-bold text-[#163d7a]">
                  Total Bookings · Tổng số vé:{" "}
                  <strong className="font-black text-[#0b4fd0]">{bookings.length}</strong>
                </span>
              </div>
            </div>
          </header>

          {/* Filter Tabs + PNR/Route Search Bar */}
          <div
            className="mb-5 flex flex-col gap-3 bg-white/95 p-2.5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
            style={{
              border: "1px solid #dbe7fb",
              borderRadius: 22,
            }}
          >
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: "all", label: "All · Tất cả" },
                { id: "paid", label: "Paid · Đã TT" },
                { id: "pending", label: "Pending · Chờ TT" },
                { id: "cancelled", label: "Cancelled · Đã hủy" },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                const count = getTabCount(tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold transition"
                    style={
                      isSelected
                        ? {
                            background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                            color: "#ffffff",
                            boxShadow: "0 4px 12px rgba(29, 78, 216, 0.25)",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                            padding: "6px 12px",
                            whiteSpace: "nowrap",
                          }
                        : {
                            background: "transparent",
                            color: "#1e3f77",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                            padding: "6px 12px",
                            whiteSpace: "nowrap",
                          }
                    }
                  >
                    <span>{tab.label}</span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-black"
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

            {/* PNR / Route Search Input */}
            <div className="relative w-full lg:w-52 shrink-0">
              <MagnifyingGlass
                size={15}
                weight="bold"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search PNR / HAN..."
                className="w-full py-2 pl-9 pr-3 text-xs font-semibold text-[#091e47] placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                style={{
                  background: "#f4f8ff",
                  border: "1px solid #dbe7fb",
                  borderRadius: 9999,
                }}
              />
            </div>
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
              <p className="text-xs font-bold text-slate-500">
                Loading your bookings · Đang tải lịch sử đặt vé...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div
              className="rounded-3xl bg-white/95 p-12 text-center shadow-sm sm:p-16"
              style={{ border: "1px solid #dbe7fb" }}
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner">
                <AirplaneTilt size={32} weight="fill" />
              </div>
              <h3 className="mb-2 text-lg font-black text-[#092152]" style={{ margin: "0 0 8px 0", fontSize: 18 }}>
                {activeTab === "all" && !searchQuery
                  ? "No bookings yet · Chưa có chuyến bay nào"
                  : "No matching bookings · Không tìm thấy vé phù hợp"}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
                {activeTab === "all" && !searchQuery
                  ? "Start searching for your next SkyLink flight to enjoy 5-star service!"
                  : "Try switching tabs or clearing your PNR search filter."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/flights")}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold text-white shadow-md transition hover:brightness-105"
                style={{
                  background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span>Search Flights · Tìm chuyến bay ngay</span>
                <ArrowRight size={15} weight="bold" />
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedBookings.map((booking, idx) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    idx={idx}
                    onRequestCancel={(b) => setCancelTarget(b)}
                  />
                ))}
              </div>

              {/* Clean Windowed Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 180, behavior: "smooth" });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-bold text-[#163d7a] hover:bg-blue-50 disabled:opacity-40"
                    style={{ cursor: safePage <= 1 ? "not-allowed" : "pointer" }}
                  >
                    ‹
                  </button>

                  {visiblePages.map((pg, i) =>
                    pg === "..." ? (
                      <span
                        key={`dots-${i}`}
                        className="flex h-8 w-7 items-center justify-center text-xs font-bold text-slate-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pg);
                          window.scrollTo({ top: 180, behavior: "smooth" });
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
                      window.scrollTo({ top: 180, behavior: "smooth" });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-bold text-[#163d7a] hover:bg-blue-50 disabled:opacity-40"
                    style={{ cursor: safePage >= totalPages ? "not-allowed" : "pointer" }}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Clean Confirmation Modal for Ticket Cancellation */}
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
                  Cancel Booking · Xác nhận hủy vé
                </p>
                <h2 className="mt-1 font-black text-[#092152]" style={{ margin: "4px 0 0 0", fontSize: 18 }}>
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
              Are you sure you want to cancel this reservation? Sau khi hủy, ghế sẽ được mở lại cho
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
                Keep Ticket · Giữ lại
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
                {cancelling ? "Cancelling..." : "Confirm Cancel · Hủy vé"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

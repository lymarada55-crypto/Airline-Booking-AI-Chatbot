// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import {
  Armchair,
  CaretRight,
  Fire,
  ForkKnife,
  Lightning,
  SealCheck,
  ShieldCheck,
  SuitcaseRolling,
  Tag,
} from "@phosphor-icons/react";

const VietnamAirlinesLogo = () => (
  <div
    className="flex shrink-0 flex-col items-center justify-center shadow-xs"
    style={{
      width: 66,
      height: 66,
      borderRadius: 16,
      background: "linear-gradient(145deg, #00556e 0%, #006d88 100%)",
      padding: "6px 4px",
    }}
  >
    <svg viewBox="0 0 44 26" fill="none" style={{ width: 38, height: 22 }}>
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
      className="mt-1 text-center font-bold leading-tight text-white/95"
      style={{ fontSize: 9.5, letterSpacing: "0.01em" }}
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
      width: 66,
      height: 66,
      borderRadius: 16,
      background: "linear-gradient(145deg, #d9141d 0%, #f0232b 100%)",
      padding: "6px 4px",
    }}
  >
    <svg viewBox="0 0 40 24" fill="none" style={{ width: 34, height: 20 }}>
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
      className="mt-1 text-center font-extrabold leading-tight text-white"
      style={{ fontSize: 9.5 }}
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
      width: 66,
      height: 66,
      borderRadius: 16,
      background: "linear-gradient(145deg, #006633 0%, #009944 100%)",
      padding: "6px 4px",
    }}
  >
    <svg viewBox="0 0 40 26" fill="none" style={{ width: 34, height: 22 }}>
      <path d="M9 21C12 13 19 7 30 4C25 12 18 18 9 21Z" fill="#FFFFFF" />
      <path d="M13 24C16 18 22 13 31 11C27 17 21 21 13 24Z" fill="#38BDF8" />
    </svg>
    <span
      className="mt-1 text-center font-bold leading-tight text-white/95"
      style={{ fontSize: 9.5 }}
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
      width: 66,
      height: 66,
      borderRadius: 16,
      background: "linear-gradient(145deg, #092c7a 0%, #0284c7 100%)",
      padding: "6px 4px",
    }}
  >
    <svg viewBox="0 0 40 24" fill="none" style={{ width: 34, height: 20 }}>
      <path d="M20 18L4 6L15 11L20 18Z" fill="#7DD3FC" />
      <path d="M20 18L36 6L25 11L20 18Z" fill="#FFFFFF" />
      <path d="M20 4L23 13L20 18L17 13L20 4Z" fill="#E0F2FE" />
    </svg>
    <span
      className="mt-1 text-center font-extrabold leading-tight text-white"
      style={{ fontSize: 9.5 }}
    >
      SkyLink
      <br />
      Airlines
    </span>
  </div>
);

const AIRLINE_CONFIG = {
  VN: {
    name: "Vietnam Airlines",
    tagline: "Bay cùng vẻ đẹp Việt Nam",
    baggage: "7kg + 23kg",
    hasMeal: true,
    refundLabel: "Theo quy định",
    logo: <VietnamAirlinesLogo />,
  },
  VJ: {
    name: "VietJet Air",
    tagline: "Bay là thích ngay",
    baggage: "7kg x 1",
    hasMeal: false,
    refundLabel: "Theo quy định",
    logo: <VietjetLogo />,
  },
  QH: {
    name: "Bamboo Airways",
    tagline: "Hơn cả một chuyến bay",
    baggage: "7kg + 20kg",
    hasMeal: true,
    refundLabel: "Theo quy định",
    logo: <BambooAirwaysLogo />,
  },
  FB: {
    name: "Bamboo Airways",
    tagline: "Hơn cả một chuyến bay",
    baggage: "7kg + 20kg",
    hasMeal: true,
    refundLabel: "Theo quy định",
    logo: <BambooAirwaysLogo />,
  },
};

const DEFAULT_AIRLINE = {
  name: "SkyLink Airlines",
  tagline: "Trải nghiệm bay 5 sao quốc tế",
  baggage: "10kg + 30kg",
  hasMeal: true,
  refundLabel: "Linh hoạt",
  logo: <SkyLinkLogo />,
};

function getAirline(flightNumber = "") {
  const prefix = (flightNumber.match(/^[A-Za-z]+/) ?? [""])[0].toUpperCase();
  return AIRLINE_CONFIG[prefix] ?? DEFAULT_AIRLINE;
}

function formatTimeHm(dateString) {
  if (!dateString) return "--:--";
  const d = new Date(String(dateString).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatVndSymbol(amount) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(amount) || 0))} ₫`;
}

function calcDurationShort(dep, arr) {
  if (!dep || !arr) return "1h 45m";
  const d1 = new Date(String(dep).replace(" ", "T"));
  const d2 = new Date(String(arr).replace(" ", "T"));
  const ms = d2 - d1;
  if (Number.isNaN(ms) || ms <= 0) return "1h 45m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function isNextDay(dep, arr) {
  if (!dep || !arr) return false;
  const d1 = new Date(String(dep).replace(" ", "T"));
  const d2 = new Date(String(arr).replace(" ", "T"));
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return false;
  return d2.getDate() !== d1.getDate();
}

export default function FlightCard({
  flight,
  onSelect,
  isCheapest = false,
  isFastest = false,
  cabinClass = "economy",
}) {
  const airline = getAirline(flight.flight_number);
  const durationLabel = calcDurationShort(flight.departure_time, flight.arrival_time);
  const depCode = flight.departure_airport?.code ?? "---";
  const arrCode = flight.arrival_airport?.code ?? "---";
  const depCity = flight.departure_airport?.city || depCode;
  const arrCity = flight.arrival_airport?.city || arrCode;

  const price = Number(flight.display_price || flight.base_price || 0);
  const hasRealDiscount =
    flight.display_price && Number(flight.display_price) < Number(flight.base_price);
  const originalPrice = hasRealDiscount
    ? Number(flight.base_price)
    : isCheapest
    ? Math.round(price * 1.2)
    : Math.round(price * 1.12);
  const discountPct =
    originalPrice > price
      ? Math.max(5, Math.round(((originalPrice - price) / originalPrice) * 100))
      : 0;

  const nextDay = isNextDay(flight.departure_time, flight.arrival_time);
  const seatsLeft = Number(flight.available_seats ?? 180);
  const seatLabel = cabinClass === "business" ? "Thương gia" : "Phổ thông";
  const refundText = cabinClass === "business" ? "Linh hoạt" : airline.refundLabel;

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative w-full list-none bg-white transition hover:shadow-lg"
      style={{
        borderRadius: 22,
        border: isCheapest ? "1.5px solid #93c5fd" : "1px solid #dbe7fb",
        boxShadow: isCheapest
          ? "0 8px 24px rgba(29, 78, 216, 0.10)"
          : "0 4px 16px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Top-Left Floating Ribbon Badge matching mockup */}
      {(isCheapest || isFastest) && (
        <div
          className="inline-flex items-center gap-1.5 font-extrabold text-white shadow-xs"
          style={{
            position: "absolute",
            top: -1,
            left: -1,
            background: isCheapest
              ? "linear-gradient(90deg, #1d64f2 0%, #0ea5e9 100%)"
              : "linear-gradient(90deg, #059669 0%, #10b981 100%)",
            borderTopLeftRadius: 21,
            borderBottomRightRadius: 16,
            padding: "5px 14px",
            fontSize: 12,
            zIndex: 2,
          }}
        >
          {isCheapest ? (
            <>
              <Fire size={14} weight="fill" className="text-amber-300" />
              <span>Phổ biến · Giá tốt nhất</span>
            </>
          ) : (
            <>
              <Lightning size={14} weight="fill" className="text-amber-200" />
              <span>Bay nhanh nhất</span>
            </>
          )}
        </div>
      )}

      {/* Main Card Body */}
      <div
        className="px-5 pb-4"
        style={{ paddingTop: isCheapest || isFastest ? 34 : 18 }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Left + Center: Logo Tile + Airline Info + Flight Timeline */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {/* Brand Tile */}
            {airline.logo}

            {/* Airline Header & Timeline */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3
                  className="truncate font-black text-[#091e47]"
                  style={{ margin: 0, fontSize: 16.5, lineHeight: 1.2 }}
                >
                  {airline.name}
                </h3>
                <SealCheck
                  size={17}
                  weight="fill"
                  className="shrink-0 text-[#2563eb]"
                  title="Hãng hàng không đã xác thực"
                />
                <span
                  className="ml-1 font-mono font-bold text-slate-500"
                  style={{
                    fontSize: 11,
                    background: "#f1f5f9",
                    borderRadius: 6,
                    padding: "1px 7px",
                  }}
                >
                  {flight.flight_number}
                </span>
              </div>

              <p
                className="truncate italic text-slate-500"
                style={{ margin: "2px 0 0 0", fontSize: 12 }}
              >
                {airline.tagline}
              </p>

              {/* Schedule Row: 06:00 --- ✈ 2h / Bay thẳng --- 08:00 */}
              <div className="mt-3 flex items-center gap-3">
                {/* Departure */}
                <div className="min-w-[82px]">
                  <div
                    className="font-black leading-none text-[#091e47]"
                    style={{ fontSize: 22 }}
                  >
                    {formatTimeHm(flight.departure_time)}
                  </div>
                  <div
                    className="mt-1 truncate font-semibold text-slate-500"
                    style={{ fontSize: 12 }}
                    title={`${depCity} (${depCode})`}
                  >
                    {depCity} <span className="font-bold text-slate-600">({depCode})</span>
                  </div>
                </div>

                {/* Dashed Timeline + Plane + Duration Pill */}
                <div className="flex flex-1 flex-col items-center px-1">
                  <div className="relative flex w-full items-center justify-center">
                    <div
                      className="w-full"
                      style={{ borderTop: "1.5px dashed #cbd5e1" }}
                    />
                    <span
                      className="absolute flex items-center justify-center bg-white px-1.5"
                      style={{ color: "#0ea5e9" }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ width: 18, height: 18 }}
                      >
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(90 12 12)" />
                      </svg>
                    </span>
                  </div>
                  <span
                    className="mt-1.5 font-extrabold text-[#1d4ed8]"
                    style={{
                      background: "#eff6ff",
                      borderRadius: 9999,
                      padding: "1px 9px",
                      fontSize: 11,
                    }}
                  >
                    {durationLabel}
                  </span>
                  <span
                    className="mt-0.5 font-extrabold text-[#0264c8]"
                    style={{ fontSize: 11.5 }}
                  >
                    Bay thẳng
                  </span>
                </div>

                {/* Arrival */}
                <div className="min-w-[88px] text-left">
                  <div
                    className="flex items-start font-black leading-none text-[#091e47]"
                    style={{ fontSize: 22 }}
                  >
                    <span>{formatTimeHm(flight.arrival_time)}</span>
                    {nextDay && (
                      <span
                        className="ml-0.5 font-bold text-rose-500"
                        style={{ fontSize: 10 }}
                      >
                        +1d
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-1 truncate font-semibold text-slate-500"
                    style={{ fontSize: 12 }}
                    title={`${arrCity} (${arrCode})`}
                  >
                    {arrCity} <span className="font-bold text-slate-600">({arrCode})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Strikethrough Price, Single-line Blue Price, Savings Pill, Gradient CTA */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3 lg:w-[205px] lg:flex-col lg:items-end lg:justify-center lg:gap-1.5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="text-left lg:text-right">
              {originalPrice > price && (
                <div
                  className="font-semibold text-slate-400 line-through"
                  style={{ fontSize: 12.5, whiteSpace: "nowrap" }}
                >
                  {formatVndSymbol(originalPrice)}
                </div>
              )}
              <div
                className="font-black leading-tight"
                style={{
                  fontSize: 22,
                  color: "#0b5ed7",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatVndSymbol(price)}
              </div>
              {discountPct > 0 && (
                <div className="mt-1 inline-flex items-center">
                  <span
                    className="inline-flex items-center gap-1 font-extrabold"
                    style={{
                      background: "linear-gradient(90deg, #fff1f2 0%, #ffedd5 100%)",
                      color: "#e11d48",
                      borderRadius: 9999,
                      padding: "2px 10px",
                      fontSize: 11.5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Tag size={12} weight="fill" />
                    Tiết kiệm {discountPct}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 lg:mt-1.5 lg:w-full">
              <button
                type="button"
                onClick={() => onSelect(flight)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 font-extrabold text-white transition hover:brightness-105 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                  borderRadius: 9999,
                  border: "none",
                  padding: "9px 20px",
                  fontSize: 13.5,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(29, 78, 216, 0.25)",
                }}
              >
                <span>Chọn chuyến</span>
                <CaretRight size={14} weight="bold" />
              </button>
              {seatsLeft <= 15 && seatsLeft > 0 && (
                <span
                  className="inline-flex items-center gap-1 font-bold text-amber-600"
                  style={{ fontSize: 11 }}
                >
                  <Armchair size={12} weight="fill" />
                  Chỉ còn {seatsLeft} ghế
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom 4-Column Ice-Blue Amenities Bar matching mockup */}
        <div
          className="mt-4 grid grid-cols-2 gap-y-2.5 sm:grid-cols-4 sm:divide-x sm:divide-blue-100"
          style={{
            background: "#f4f8ff",
            border: "1px solid #e4efff",
            borderRadius: 14,
            padding: "10px 8px",
          }}
        >
          {/* 1. Baggage */}
          <div className="flex items-center gap-2.5 px-3">
            <SuitcaseRolling size={20} weight="fill" className="shrink-0 text-[#1d64f2]" />
            <div className="min-w-0">
              <div className="font-semibold text-slate-500" style={{ fontSize: 11, lineHeight: 1.2 }}>
                Hành lý
              </div>
              <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 12.5 }}>
                {airline.baggage}
              </div>
            </div>
          </div>

          {/* 2. Seat Class */}
          <div className="flex items-center gap-2.5 px-3">
            <Armchair size={20} weight="fill" className="shrink-0 text-[#1d64f2]" />
            <div className="min-w-0">
              <div className="font-semibold text-slate-500" style={{ fontSize: 11, lineHeight: 1.2 }}>
                Ghế ngồi
              </div>
              <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 12.5 }}>
                {seatLabel}
              </div>
            </div>
          </div>

          {/* 3. Meal */}
          <div className="flex items-center gap-2.5 px-3">
            <ForkKnife size={20} weight="fill" className="shrink-0 text-[#1d64f2]" />
            <div className="min-w-0">
              <div className="font-semibold text-slate-500" style={{ fontSize: 11, lineHeight: 1.2 }}>
                Suất ăn
              </div>
              <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 12.5 }}>
                {airline.hasMeal ? "Có" : "Mua thêm"}
              </div>
            </div>
          </div>

          {/* 4. Refund / Change */}
          <div className="flex items-center gap-2.5 px-3">
            <ShieldCheck size={20} weight="fill" className="shrink-0 text-[#1d64f2]" />
            <div className="min-w-0">
              <div className="font-semibold text-slate-500" style={{ fontSize: 11, lineHeight: 1.2 }}>
                Hoàn/Đổi vé
              </div>
              <div className="truncate font-extrabold text-[#091e47]" style={{ fontSize: 12.5 }}>
                {refundText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

import {
  PaperPlaneTilt,
  AirplaneTakeoff,
  AirplaneLanding,
  QrCode,
  User,
  Clock,
  Users,
  Info,
  Buildings,
  Armchair,
  CalendarBlank,
  ShieldCheck,
} from "@phosphor-icons/react";
import "./BoardingPassDisplay.css";

function parseFlightTimes(rawDepartureTime) {
  if (!rawDepartureTime) {
    return { dateLabel: "—", depTimeLabel: "—", boardingTimeLabel: "—" };
  }
  const normalized = String(rawDepartureTime).replace(" ", "T");
  const dt = new Date(normalized);
  if (Number.isNaN(dt.getTime())) {
    return {
      dateLabel: String(rawDepartureTime),
      depTimeLabel: "—",
      boardingTimeLabel: "—",
    };
  }

  const dateLabel = dt.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const depTimeLabel = dt.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const boardingDt = new Date(dt.getTime() - 40 * 60 * 1000);
  const boardingTimeLabel = boardingDt.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { dateLabel, depTimeLabel, boardingTimeLabel };
}

function formatCheckInTime(raw) {
  if (!raw) return "—";
  const dt = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return String(raw);
  return `${dt.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} • ${dt.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
}

/**
 * BoardingPassDisplay Component
 *
 * Hiển thị Thẻ lên máy bay điện tử (Mobile / Print Boarding Pass) chuẩn 5 sao SkyLink Airlines
 */
export default function BoardingPassDisplay({ boardingPass }) {
  const {
    ticket_code = "LV1K95QRRR",
    passenger_name = "Nguyễn Văn A",
    pnr_code = "BQCVOE",
    flight_number = "VJ565",
    departure_time = "2026-09-10 16:24",
    seat_number = "9D",
    qr_code_url,
    check_in_time = "2026-09-09 21:37:00",
    gate = "A04",
    zone = "GROUP 1",
    cabin_class = "Economy",
    departure_airport = "SGN",
    departure_city = "TP. HỒ CHÍ MINH",
    arrival_airport = "HAN",
    arrival_city = "HÀ NỘI",
  } = boardingPass || {};

  const { dateLabel, depTimeLabel, boardingTimeLabel } = parseFlightTimes(departure_time);

  return (
    <div className="w-full font-sans selection:bg-blue-600 selection:text-white">
      {/* Main Ticket Card */}
      <div
        className="overflow-hidden bg-white"
        style={{
          borderRadius: 30,
          border: "1px solid #d5e6fc",
          boxShadow: "0 20px 50px rgba(13, 62, 145, 0.14)",
        }}
      >
        {/* Ticket Header Banner */}
        <div
          className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden p-6 text-white md:p-8"
          style={{
            background: "linear-gradient(125deg, #0b4fd0 0%, #1d75f2 55%, #38bdf8 100%)",
          }}
        >
          {/* Watermark Plane Outline */}
          <div className="pointer-events-none absolute -bottom-10 right-28 rotate-12 opacity-15">
            <PaperPlaneTilt size={190} weight="fill" />
          </div>

          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <PaperPlaneTilt size={20} weight="fill" className="text-sky-200" />
              <span className="text-base font-black tracking-tight md:text-lg">
                SkyLink Airlines
              </span>
            </div>
            <p className="pt-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-sky-100">
              ELECTRONIC BOARDING PASS
            </p>
            <h2 className="text-2xl font-black leading-none tracking-tight md:text-3xl">
              THẺ LÊN MÁY BAY
            </h2>
          </div>

          <div className="relative z-10 flex flex-col items-end">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-sky-100">
              MÃ ĐẶT CHỖ (PNR)
            </span>
            <span className="font-mono text-2xl font-black tracking-wider text-white md:text-3xl">
              {pnr_code}
            </span>
            <span
              className="mt-1.5 px-3 py-0.5 text-xs font-extrabold text-white"
              style={{
                background: "rgba(255, 255, 255, 0.22)",
                borderRadius: 9999,
                border: "1px solid rgba(255, 255, 255, 0.32)",
              }}
            >
              {cabin_class}
            </span>
          </div>
        </div>

        {/* Ticket Body Content */}
        <div className="grid grid-cols-1 items-start gap-8 p-6 md:p-9 lg:grid-cols-12">
          {/* Left Column (8 cols): Flight & Passenger Details */}
          <div className="space-y-6 lg:col-span-8">
            {/* Row 1: Passenger Name & Ticket Code */}
            <div className="grid grid-cols-1 gap-4 border-b border-slate-100 pb-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-blue-50 text-blue-600"
                  style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                >
                  <User size={20} weight="bold" />
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Họ và tên / Passenger Name
                  </span>
                  <span className="mt-0.5 block text-lg font-black text-[#091e47] md:text-xl">
                    {passenger_name}
                  </span>
                </div>
              </div>

              <div className="pl-12 sm:pl-0 sm:text-right">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Số vé điện tử / E-Ticket
                </span>
                <span className="mt-0.5 block font-mono text-base font-black text-[#123975]">
                  {ticket_code}
                </span>
              </div>
            </div>

            {/* Row 2: Flight Path Container (SGN -> HAN) */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, #f0f7ff 0%, #e7f2ff 100%)",
                border: "1px solid #cde2fd",
              }}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-2.5 text-xs font-bold text-[#1e437f]">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarBlank size={15} weight="bold" className="text-blue-600" />
                  Ngày bay: <strong className="font-black text-[#091e47]">{dateLabel}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={15} weight="bold" className="text-blue-600" />
                  Khởi hành: <strong className="font-black text-[#0b4fd0]">{depTimeLabel}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Departure Airport */}
                <div className="flex items-center gap-3">
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-xs sm:flex">
                    <AirplaneTakeoff size={20} weight="bold" />
                  </div>
                  <div>
                    <span className="block text-2xl font-black leading-none text-[#091e47] md:text-3xl">
                      {departure_airport}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-[#3a5785]">
                      {departure_city}
                    </span>
                  </div>
                </div>

                {/* Middle Flight Path */}
                <div className="flex max-w-[200px] flex-1 flex-col items-center">
                  <span className="mb-1 font-mono text-xs font-black tracking-wider text-blue-700">
                    {flight_number}
                  </span>
                  <div className="flex w-full items-center justify-center gap-2">
                    <div className="h-0.5 flex-1 rounded-full bg-blue-300" />
                    <PaperPlaneTilt size={18} weight="fill" className="rotate-90 text-blue-600" />
                    <div className="h-0.5 flex-1 rounded-full bg-blue-300" />
                  </div>
                  <span className="mt-1 text-[11px] font-semibold text-[#476494]">
                    Bay thẳng / Direct
                  </span>
                </div>

                {/* Arrival Airport */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="block text-2xl font-black leading-none text-[#091e47] md:text-3xl">
                      {arrival_airport}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-[#3a5785]">
                      {arrival_city}
                    </span>
                  </div>
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-xs sm:flex">
                    <AirplaneLanding size={20} weight="bold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: 4 Info Metric Cards (Seat, Gate, Boarding Time, Zone) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
              {/* Seat */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl p-4 text-center"
                style={{ background: "#f4f8ff", border: "1px solid #d5e6fc" }}
              >
                <Armchair size={20} className="mb-1 text-blue-600" weight="bold" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Ghế / Seat
                </span>
                <span className="mt-0.5 font-mono text-xl font-black text-[#0b4fd0] md:text-2xl">
                  {seat_number}
                </span>
              </div>

              {/* Gate */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl p-4 text-center"
                style={{ background: "#f4f8ff", border: "1px solid #d5e6fc" }}
              >
                <Buildings size={20} className="mb-1 text-blue-600" weight="bold" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Cửa / Gate
                </span>
                <span className="mt-0.5 font-mono text-xl font-black text-[#091e47] md:text-2xl">
                  {gate}
                </span>
              </div>

              {/* Boarding Time */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl p-4 text-center"
                style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
              >
                <Clock size={20} className="mb-1 text-amber-600" weight="bold" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                  Lên tàu / Board
                </span>
                <span className="mt-0.5 font-mono text-xl font-black text-amber-800 md:text-2xl">
                  {boardingTimeLabel}
                </span>
              </div>

              {/* Zone */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl p-4 text-center"
                style={{ background: "#f4f8ff", border: "1px solid #d5e6fc" }}
              >
                <Users size={20} className="mb-1 text-blue-600" weight="bold" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Nhóm / Zone
                </span>
                <span className="mt-1 text-xs font-black text-[#091e47] md:text-sm">
                  {zone}
                </span>
              </div>
            </div>

            {/* Row 4: Timestamp & Gate Close Notice */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} weight="fill" className="text-emerald-600" />
                Hoàn tất Check-in lúc: {formatCheckInTime(check_in_time)}
              </span>
              <span className="font-bold text-amber-700">
                Cửa lên tàu đóng trước giờ bay 15 phút
              </span>
            </div>
          </div>

          {/* Right Column (4 cols): QR Code & Gate Notice */}
          <div className="flex h-full flex-col items-center justify-between space-y-4 lg:col-span-4 lg:border-l lg:border-dashed lg:border-slate-200 lg:pl-8">
            <div className="flex w-full flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-200/80 bg-[#f8fbff] p-5">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                {qr_code_url ? (
                  <img
                    src={qr_code_url}
                    alt="Mã QR Thẻ lên máy bay"
                    className="h-44 w-44 object-contain"
                  />
                ) : (
                  <div className="flex h-44 w-44 items-center justify-center bg-slate-50 text-slate-400">
                    <QrCode size={88} />
                  </div>
                )}
              </div>
              <p className="text-center font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                QUÉT MÃ TẠI CỬA AN NINH &amp; LÊN TÀU
              </p>
            </div>

            <div className="flex w-full items-start gap-2.5 rounded-xl border border-blue-100 bg-[#f0f7ff] p-3.5 text-xs font-semibold leading-relaxed text-[#163d7a]">
              <Info size={18} className="mt-0.5 shrink-0 text-blue-600" weight="bold" />
              <span>
                Xuất trình thẻ điện tử này kèm CCCD/VNeID mức 2 (nội địa) hoặc Hộ chiếu hợp lệ
                (quốc tế) tại cửa an ninh.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

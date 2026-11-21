import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AirplaneTilt,
  AirplaneTakeoff,
  AirplaneLanding,
  ArrowLeft,
  ArrowRight,
  Broadcast,
  CalendarBlank,
  Clock,
  MagnifyingGlass,
  MapPinLine,
  ArrowsLeftRight,
  Buildings,
  SuitcaseRolling,
  CheckCircle,
  CircleNotch,
  Ticket,
  Sparkle,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_STATUS_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const INTERNATIONAL_CODES = new Set([
  "SIN",
  "PNH",
  "KUL",
  "ICN",
  "NRT",
  "PEK",
  "PVG",
  "CAN",
  "SZX",
]);

function getAirlineName(flightNumber = "") {
  const code = String(flightNumber).slice(0, 2).toUpperCase();
  if (code === "VN") return { name: "Vietnam Airlines", color: "#0b4fd0", bg: "#eff6ff" };
  if (code === "VJ") return { name: "VietJet Air", color: "#dc2626", bg: "#fef2f2" };
  return { name: "Bamboo Airways", color: "#059669", bg: "#ecfdf5" };
}

function getOperationalMeta(flight) {
  const depCode = flight.departure_airport?.code || "HAN";
  const arrCode = flight.arrival_airport?.code || "SGN";
  const isIntl = INTERNATIONAL_CODES.has(depCode) || INTERNATIONAL_CODES.has(arrCode);

  const hash = String(flight.flight_number || flight.id || "1")
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const terminalDep = isIntl ? "Nhà ga T2 (Quốc tế)" : "Nhà ga T1 (Nội địa)";
  const terminalArr = isIntl ? "Nhà ga T2" : "Nhà ga T1";
  const gateLetter = isIntl ? ["A", "B", "C"][hash % 3] : ["A", "B"][hash % 2];
  const gateNum = String((hash % 14) + 1).padStart(2, "0");
  const counterStart = ((hash % 8) + 1) * 5;
  const beltNum = (hash % 8) + 1;

  const now = Date.now();
  const depMs = new Date(String(flight.departure_time || "").replace(" ", "T")).getTime();
  const arrMs = new Date(String(flight.arrival_time || "").replace(" ", "T")).getTime();

  let statusLabel = "Đúng giờ (On Time)";
  let statusColor = "#047857";
  let statusBg = "#ecfdf5";
  let statusBorder = "#a7f3d0";
  let progress = 0;

  if (!Number.isNaN(depMs) && !Number.isNaN(arrMs)) {
    if (now >= arrMs) {
      statusLabel = "Đã hạ cánh (Landed)";
      statusColor = "#047857";
      statusBg = "#ecfdf5";
      statusBorder = "#a7f3d0";
      progress = 100;
    } else if (now >= depMs) {
      statusLabel = "Đang bay (In Flight)";
      statusColor = "#0b57d0";
      statusBg = "#eff6ff";
      statusBorder = "#bfdbfe";
      progress = Math.min(96, Math.max(8, Math.round(((now - depMs) / Math.max(1, arrMs - depMs)) * 100)));
    } else if (depMs - now <= 45 * 60 * 1000) {
      statusLabel = "Đang lên tàu (Boarding)";
      statusColor = "#b45309";
      statusBg = "#fffbeb";
      statusBorder = "#fde68a";
      progress = 5;
    } else if (depMs - now <= 24 * 60 * 60 * 1000) {
      statusLabel = "Đang mở Check-in";
      statusColor = "#0369a1";
      statusBg = "#f0f9ff";
      statusBorder = "#bae6fd";
      progress = 0;
    }
  }

  return {
    isIntl,
    terminalDep,
    terminalArr,
    gate: `${gateLetter}${gateNum}`,
    counter: `Quầy ${counterStart}–${counterStart + 4}`,
    belt: `Băng chuyền số ${beltNum}`,
    statusLabel,
    statusColor,
    statusBg,
    statusBorder,
    progress,
  };
}

function formatTime(raw) {
  if (!raw) return "--:--";
  const dt = new Date(String(raw).replace(" ", "T"));
  if (Number.isNaN(dt.getTime())) return "--:--";
  return dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDuration(depRaw, arrRaw) {
  const dep = new Date(String(depRaw || "").replace(" ", "T"));
  const arr = new Date(String(arrRaw || "").replace(" ", "T"));
  const mins = Math.round((arr - dep) / 60000);
  if (!Number.isFinite(mins) || mins <= 0) return "2g 00p";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}g ${String(m).padStart(2, "0")}p`;
}

export default function FlightStatus() {
  const navigate = useNavigate();
  const defaultDate = (() => {
    const d = new Date();
    if (d.getHours() >= 19) d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const [mode, setMode] = useState("route"); // "route" | "number"
  const [airports, setAirports] = useState([]);
  const [departure, setDeparture] = useState("HAN");
  const [arrival, setArrival] = useState("SGN");
  const [date, setDate] = useState(defaultDate);
  const [flightNumberQuery, setFlightNumberQuery] = useState("");

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    axios
      .get("/api/airports")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAirports(list);
      })
      .catch(() => setAirports([]));
  }, []);

  const fetchStatus = async (opts = {}) => {
    const activeMode = opts.mode || mode;
    const dep = opts.departure ?? departure;
    const arr = opts.arrival ?? arrival;
    const targetDate = opts.date ?? date;
    const queryNum = (opts.flightNumber ?? flightNumberQuery).trim().toUpperCase();

    setError("");
    if (activeMode === "route" && dep && arr && dep === arr) {
      setError("Điểm đi và điểm đến không được trùng nhau.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const params =
        activeMode === "route"
          ? { from: dep, to: arr, date: targetDate }
          : { date: targetDate };

      const res = await axios.get("/api/flights", { params });
      let list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      if (activeMode === "number" && queryNum) {
        list = list.filter((f) =>
          String(f.flight_number || "")
            .toUpperCase()
            .includes(queryNum)
        );
      }

      setFlights(list.slice(0, 15));
    } catch {
      setError("Không thể tải dữ liệu tình trạng chuyến bay lúc này. Vui lòng thử lại.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus({ mode: "route", departure: "HAN", arrival: "SGN", date: defaultDate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayedDate = useMemo(() => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  }, [date]);

  const handleBookThisFlight = (flight) => {
    localStorage.setItem("selected_flights", JSON.stringify([flight]));
    localStorage.removeItem("selected_seats");
    localStorage.setItem(
      "search_params",
      JSON.stringify({
        departure: flight.departure_airport?.code || departure,
        arrival: flight.arrival_airport?.code || arrival,
        date,
        returnDate: "",
        tripType: "one-way",
        flightClass: "economy",
        passengers: { adults: 1, children: 0 },
      })
    );
    navigate(`/seat-selection?flight_id=${encodeURIComponent(flight.id)}`);
  };

  return (
    <div
      className="flex min-h-[100dvh] flex-col font-sans text-[#0b1f44]"
      style={{ background: "linear-gradient(180deg, #b8dafc 0%, #d8ecff 30%, #eef6ff 100%)" }}
    >
      <Navbar />

      <main className="relative flex-1 overflow-hidden pb-16 pt-24">
        {/* Hero Sky Background */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: 340, overflow: "hidden" }}
        >
          <img
            src={HERO_STATUS_BG_URL}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 32%", opacity: 0.48 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(169,211,252,0.38) 0%, rgba(216,236,255,0.78) 65%, #eef6ff 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1120px] px-4 sm:px-6">
          {/* Header */}
          <header className="mb-7">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white/95 px-4 py-2 text-xs font-extrabold text-[#163d7a] shadow-sm transition hover:bg-white"
              style={{ borderRadius: 9999, border: "1px solid #d5e6fc", textDecoration: "none" }}
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
                  <Broadcast size={15} weight="fill" />
                  SKYLINK AIRLINES • FLIGHT TRACKER
                </p>
                <h1
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(1.9rem, 3.5vw, 2.75rem)",
                    color: "#091e47",
                    lineHeight: 1.12,
                    margin: "0 0 6px 0",
                  }}
                >
                  Tra cứu Tình trạng chuyến bay
                </h1>
                <p className="max-w-2xl text-xs font-semibold text-[#2d4b7a] sm:text-sm" style={{ margin: 0 }}>
                  Theo dõi giờ khởi hành, giờ hạ cánh thực tế, nhà ga (T1/T2), cửa ra máy bay (Gate)
                  và băng chuyền hành lý cho hành khách &amp; người thân đón tại sân bay.
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 bg-white/95 px-4 py-2.5 shadow-sm"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
              >
                <Sparkle size={16} className="text-emerald-600" weight="fill" />
                <span className="text-xs font-bold text-[#163d7a]">
                  Cập nhật trực tiếp • <strong className="font-black text-[#0b4fd0]">19 sân bay</strong>
                </span>
              </div>
            </div>
          </header>

          {/* Search Card */}
          <div
            className="mb-7 bg-white p-5 sm:p-7"
            style={{
              borderRadius: 28,
              border: "1px solid #d5e6fc",
              boxShadow: "0 18px 42px rgba(13, 62, 145, 0.10)",
            }}
          >
            {/* Mode Switcher */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div
                className="inline-flex items-center gap-1 border border-blue-100 bg-[#f0f6ff] p-1"
                style={{ borderRadius: 9999 }}
              >
                {[
                  { id: "route", label: "Tra theo Chặng bay" },
                  { id: "number", label: "Tra theo Số hiệu chuyến bay" },
                ].map((tab) => {
                  const active = mode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setMode(tab.id);
                        setError("");
                      }}
                      className="cursor-pointer px-4 py-2 text-xs font-extrabold transition"
                      style={
                        active
                          ? {
                              background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                              color: "#ffffff",
                              borderRadius: 9999,
                              border: "none",
                              boxShadow: "0 4px 12px rgba(13, 97, 225, 0.25)",
                            }
                          : {
                              background: "transparent",
                              color: "#33507f",
                              borderRadius: 9999,
                              border: "none",
                            }
                      }
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {[
                  { label: "HAN → SGN", dep: "HAN", arr: "SGN" },
                  { label: "SGN → SIN", dep: "SGN", arr: "SIN" },
                  { label: "HAN → PVG", dep: "HAN", arr: "PVG" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setMode("route");
                      setDeparture(preset.dep);
                      setArrival(preset.arr);
                      fetchStatus({ mode: "route", departure: preset.dep, arrival: preset.arr, date });
                    }}
                    className="cursor-pointer bg-[#f4f8ff] px-3 py-1.5 font-mono text-[11px] font-extrabold text-[#0b4fd0] transition hover:bg-blue-100"
                    style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchStatus();
              }}
              className="grid grid-cols-1 items-end gap-3 md:grid-cols-12"
            >
              {mode === "route" ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 md:col-span-4">
                    <label className="mb-1 block text-[11px] font-bold uppercase text-slate-400">
                      Điểm đi
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPinLine size={16} className="shrink-0 text-blue-600" />
                      <select
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                        className="w-full cursor-pointer bg-transparent text-xs font-extrabold text-slate-900 outline-none"
                      >
                        {airports.map((ap) => (
                          <option key={ap.code} value={ap.code}>
                            {ap.city} ({ap.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center md:col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDeparture(arrival);
                        setArrival(departure);
                      }}
                      title="Hoán đổi điểm đi & đến"
                      className="flex h-10 w-10 cursor-pointer items-center justify-center border border-blue-100 bg-white text-blue-600 shadow-xs transition hover:bg-blue-50"
                      style={{ borderRadius: 9999 }}
                    >
                      <ArrowsLeftRight size={16} weight="bold" />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 md:col-span-3">
                    <label className="mb-1 block text-[11px] font-bold uppercase text-slate-400">
                      Điểm đến
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPinLine size={16} className="shrink-0 text-blue-600" />
                      <select
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                        className="w-full cursor-pointer bg-transparent text-xs font-extrabold text-slate-900 outline-none"
                      >
                        {airports.map((ap) => (
                          <option key={ap.code} value={ap.code}>
                            {ap.city} ({ap.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 md:col-span-8">
                  <label className="mb-1 block text-[11px] font-bold uppercase text-slate-400">
                    Số hiệu chuyến bay
                  </label>
                  <div className="flex items-center gap-2">
                    <AirplaneTilt size={16} className="shrink-0 text-blue-600" />
                    <input
                      type="text"
                      value={flightNumberQuery}
                      onChange={(e) => setFlightNumberQuery(e.target.value.toUpperCase())}
                      placeholder="Nhập số hiệu chuyến bay (VD: VN, VJ, FB...)"
                      className="w-full bg-transparent font-mono text-xs font-extrabold uppercase text-slate-900 outline-none placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase text-slate-400">
                  Ngày bay
                </label>
                <div className="flex items-center gap-2">
                  <CalendarBlank size={16} className="shrink-0 text-blue-600" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full cursor-pointer bg-transparent text-xs font-extrabold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 py-3.5 text-xs font-black text-white shadow-md transition hover:brightness-105 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                    border: "none",
                  }}
                >
                  <MagnifyingGlass size={16} weight="bold" />
                  <span>{loading ? "Đang tra..." : "Kiểm tra"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <h2 className="text-base font-black text-[#091e47] sm:text-lg">
                {loading
                  ? "Đang đồng bộ lịch bay trực tiếp..."
                  : `Tìm thấy ${flights.length} chuyến bay ngày ${displayedDate}`}
              </h2>
              <span className="text-xs font-semibold text-[#3a5785]">
                Giờ hiển thị theo múi giờ địa phương sân bay
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/95 py-16 text-slate-400 shadow-xs">
                <CircleNotch size={36} className="animate-spin text-blue-600" />
                <p className="text-xs font-bold text-slate-500">Đang truy vấn trạng thái chuyến bay...</p>
              </div>
            ) : hasSearched && flights.length === 0 ? (
              <div className="rounded-3xl border border-blue-100 bg-white p-12 text-center shadow-xs">
                <AirplaneTilt size={40} className="mx-auto mb-3 text-blue-300" weight="duotone" />
                <h3 className="text-base font-black text-[#091e47]">Không tìm thấy chuyến bay phù hợp</h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Vui lòng thử chọn ngày khác hoặc kiểm tra lại mã số hiệu chuyến bay.
                </p>
              </div>
            ) : (
              flights.map((flight) => {
                const airline = getAirlineName(flight.flight_number);
                const meta = getOperationalMeta(flight);
                const depCode = flight.departure_airport?.code || departure;
                const depCity = flight.departure_airport?.city || depCode;
                const arrCode = flight.arrival_airport?.code || arrival;
                const arrCity = flight.arrival_airport?.city || arrCode;

                return (
                  <div
                    key={flight.id}
                    className="overflow-hidden bg-white p-5 transition hover:shadow-md sm:p-6"
                    style={{
                      borderRadius: 24,
                      border: "1px solid #d5e6fc",
                      boxShadow: "0 10px 28px rgba(18, 60, 130, 0.07)",
                    }}
                  >
                    {/* Top Row */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="rounded-xl px-3 py-1 font-mono text-xs font-black"
                          style={{ background: airline.bg, color: airline.color }}
                        >
                          {flight.flight_number}
                        </span>
                        <span className="text-sm font-black text-[#091e47]">{airline.name}</span>
                        <span className="hidden text-xs font-semibold text-slate-400 sm:inline">
                          • {flight.aircraft?.model || "Airbus A321neo"}
                        </span>
                      </div>

                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold"
                        style={{
                          background: meta.statusBg,
                          color: meta.statusColor,
                          border: `1px solid ${meta.statusBorder}`,
                          borderRadius: 9999,
                        }}
                      >
                        <CheckCircle size={14} weight="fill" />
                        {meta.statusLabel}
                      </span>
                    </div>

                    {/* Middle Timeline */}
                    <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-12">
                      <div className="flex items-center justify-between gap-4 lg:col-span-7">
                        <div>
                          <p className="text-2xl font-black text-[#091e47]">
                            {formatTime(flight.departure_time)}
                          </p>
                          <p className="text-sm font-black text-blue-700">{depCode}</p>
                          <p className="text-xs font-semibold text-slate-500">{depCity}</p>
                        </div>

                        <div className="flex-1 px-2 text-center">
                          <p className="mb-1 text-[11px] font-bold text-slate-500">
                            {formatDuration(flight.departure_time, flight.arrival_time)} • Bay thẳng
                          </p>
                          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{ width: `${meta.progress > 0 ? meta.progress : 100}%`, opacity: meta.progress > 0 ? 1 : 0.35 }}
                            />
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <AirplaneTakeoff size={12} /> {meta.terminalDep}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <AirplaneLanding size={12} /> {meta.terminalArr}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-black text-[#091e47]">
                            {formatTime(flight.arrival_time)}
                          </p>
                          <p className="text-sm font-black text-blue-700">{arrCode}</p>
                          <p className="text-xs font-semibold text-slate-500">{arrCity}</p>
                        </div>
                      </div>

                      {/* Operational Grid: Gate / Counter / Belt */}
                      <div className="grid grid-cols-3 gap-2 lg:col-span-5">
                        <div className="rounded-2xl border border-blue-100 bg-[#f4f8ff] p-3 text-center">
                          <Buildings size={16} className="mx-auto mb-1 text-blue-600" weight="bold" />
                          <span className="block text-[10px] font-bold uppercase text-slate-400">
                            Cửa / Gate
                          </span>
                          <strong className="font-mono text-sm font-black text-[#091e47]">
                            {meta.gate}
                          </strong>
                        </div>
                        <div className="rounded-2xl border border-blue-100 bg-[#f4f8ff] p-3 text-center">
                          <Clock size={16} className="mx-auto mb-1 text-blue-600" weight="bold" />
                          <span className="block text-[10px] font-bold uppercase text-slate-400">
                            Thủ tục
                          </span>
                          <strong className="text-xs font-black text-[#091e47]">{meta.counter}</strong>
                        </div>
                        <div className="rounded-2xl border border-blue-100 bg-[#f4f8ff] p-3 text-center">
                          <SuitcaseRolling size={16} className="mx-auto mb-1 text-blue-600" weight="bold" />
                          <span className="block text-[10px] font-bold uppercase text-slate-400">
                            Hành lý
                          </span>
                          <strong className="text-xs font-black text-[#091e47]">{meta.belt}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3.5">
                      <Link
                        to="/check-in"
                        className="inline-flex items-center gap-1.5 bg-[#f4f8ff] px-4 py-2 text-xs font-extrabold text-[#0b4fd0] transition hover:bg-blue-100"
                        style={{ borderRadius: 9999, border: "1px solid #d5e6fc", textDecoration: "none" }}
                      >
                        <Ticket size={14} weight="bold" />
                        Làm thủ tục Check-in
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleBookThisFlight(flight)}
                        className="inline-flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white transition hover:brightness-105"
                        style={{
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                          borderRadius: 9999,
                          border: "none",
                        }}
                      >
                        <span>Đặt chuyến này</span>
                        <ArrowRight size={13} weight="bold" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AirplaneTilt,
  Armchair,
  ArrowLeft,
  ArrowRight,
  Bank,
  CalendarBlank,
  CaretDown,
  CaretUp,
  Check,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  ForkKnife,
  House,
  Printer,
  ShieldCheck,
  Sparkle,
  Star,
  SuitcaseRolling,
  Ticket,
  Timer,
  User,
  Wallet,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_CHECKOUT_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const VnpayBrandLogo = () => (
  <svg
    className="h-7 w-auto"
    viewBox="0 0 76 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="76" height="22" rx="4" fill="#005BAA" />
    <text
      x="7"
      y="16"
      fontFamily="Arial, sans-serif"
      fontWeight="900"
      fontSize="13"
      fill="#FFFFFF"
      letterSpacing="0.5"
    >
      VN
    </text>
    <text
      x="31"
      y="16"
      fontFamily="Arial, sans-serif"
      fontWeight="900"
      fontSize="13"
      fill="#E31837"
      letterSpacing="0.5"
    >
      PAY
    </text>
    <path d="M60 4L66 11L60 18H65L71 11L65 4H60Z" fill="#E31837" />
    <path
      d="M66 4L72 11L66 18H71L77 11L71 4H66Z"
      fill="#FFFFFF"
      fillOpacity="0.4"
    />
  </svg>
);

const MomoBrandLogo = () => (
  <svg
    className="h-7 w-auto"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="28" height="28" rx="6" fill="#A50064" />
    <circle
      cx="9"
      cy="11"
      r="4.2"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      fill="none"
    />
    <circle
      cx="19"
      cy="11"
      r="4.2"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      fill="none"
    />
    <path
      d="M7 18C7 18 9 22 14 22C19 22 21 18 21 18"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

function getSeatMultiplier(seatNumber = "") {
  const match = String(seatNumber).match(/(\d+)/);
  const rowNum = match ? Number(match[1]) : 10;
  if (rowNum >= 1 && rowNum <= 5) return 1.2;
  if (rowNum >= 15) return 0.95;
  return 1;
}

function isValidIdentity(rawValue = "") {
  const clean = rawValue.trim().toUpperCase();
  const digitsOnly = clean.replace(/\D/g, "");
  // Accept 12-digit CCCD (or 9-digit CMND) OR 7–10 char alphanumeric Passport (e.g. C1234567, P01234567)
  if (digitsOnly.length === 12 || digitsOnly.length === 9) return true;
  return /^[A-Z0-9]{7,12}$/.test(clean);
}

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function Checkout() {
  const navigate = useNavigate();

  let searchParams = { passengers: { adults: 1, children: 0 } };
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

  const [passengers, setPassengers] = useState(() => {
    let savedName = "";
    try {
      const userObj = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
      );
      if (userObj?.name) savedName = String(userObj.name).toUpperCase();
    } catch {
      savedName = "";
    }
    return Array.from({ length: totalPassengers }).map((_, idx) => ({
      name: idx === 0 ? savedName : "",
      identity_number: "",
    }));
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [flights, setFlights] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({
    outbound: [],
    return: [],
  });
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [showTicketDetails, setShowTicketDetails] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({
    vnpayCard: "",
    vnpayPin: "",
    momoPhone: "",
    momoPin: "",
  });

  // 5-Star Post-Payment Success Screen State (replaces browser alert())
  const [completedBooking, setCompletedBooking] = useState(null);
  const [copiedPnr, setCopiedPnr] = useState(false);

  // Countdown timer for 15 minutes hold
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (completedBooking) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [completedBooking]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    let savedFlights = [];
    let savedServices = [];
    let savedSeats = { outbound: [], return: [] };
    try {
      savedFlights = JSON.parse(
        localStorage.getItem("selected_flights") || "[]"
      );
      savedServices = JSON.parse(
        localStorage.getItem("selected_services") || "[]"
      );
      savedSeats = JSON.parse(
        localStorage.getItem("selected_seats") || '{"outbound":[],"return":[]}'
      );
    } catch {
      // ignore storage errors
    }

    if (!Array.isArray(savedFlights) || savedFlights.length === 0) {
      navigate("/flights");
      return;
    }

    setFlights(savedFlights);
    setServices(Array.isArray(savedServices) ? savedServices : []);
    setSelectedSeats(savedSeats || { outbound: [], return: [] });
  }, [navigate]);

  if (flights.length === 0 && !completedBooking) return null;

  // Safe ticket price calculation (never NaN even if seat object omits `price`)
  const calcLegBasePrice = (flight, seatList) => {
    if (!flight) return 0;
    const flightBase = Number(flight.display_price || flight.base_price || 0);
    if (Array.isArray(seatList) && seatList.length > 0) {
      return seatList.reduce((sum, s) => {
        const seatPrice = Number(s?.price);
        if (!Number.isNaN(seatPrice) && seatPrice > 0) return sum + seatPrice;
        return sum + Math.round(flightBase * getSeatMultiplier(s?.seat_number));
      }, 0);
    }
    return flightBase * totalPassengers;
  };

  const outboundBasePrice = calcLegBasePrice(flights[0], selectedSeats.outbound);
  const returnBasePrice = flights[1]
    ? calcLegBasePrice(flights[1], selectedSeats.return)
    : 0;

  const basePrice = outboundBasePrice + returnBasePrice;
  const taxAmount = Math.round(basePrice * 0.8);
  const servicesTotal = services.reduce(
    (sum, s) => sum + Number(s.price || 0),
    0
  );
  const totalAmount = basePrice + taxAmount + servicesTotal;

  const validatePassengers = () => {
    const isAnyEmpty = passengers.some(
      (p) => !p.name.trim() || !p.identity_number.trim()
    );
    if (isAnyEmpty) {
      setFormError(
        "Vui lòng nhập đầy đủ Họ tên và Số CCCD / Hộ chiếu cho tất cả hành khách."
      );
      return false;
    }

    const isAnyIdInvalid = passengers.some(
      (p) => !isValidIdentity(p.identity_number)
    );
    if (isAnyIdInvalid) {
      setFormError(
        "Số CCCD (12 số) hoặc Hộ chiếu (7–12 ký tự chữ/số) chưa đúng định dạng."
      );
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    setFormError("");
    if (!validatePassengers()) return;

    if (paymentMethod === "vnpay" || paymentMethod === "card") {
      if (!paymentDetails.vnpayCard.trim() || !paymentDetails.vnpayPin.trim()) {
        setFormError("Vui lòng nhập đầy đủ Số thẻ và Mã PIN / OTP xác thực.");
        return;
      }
      if (paymentDetails.vnpayCard.replace(/\D/g, "").length < 4) {
        setFormError("Số thẻ không hợp lệ.");
        return;
      }
    } else if (paymentMethod === "momo") {
      if (!paymentDetails.momoPhone.trim() || !paymentDetails.momoPin.trim()) {
        setFormError("Vui lòng nhập Số điện thoại và Mật khẩu Ví MoMo.");
        return;
      }
      if (paymentDetails.momoPhone.replace(/\D/g, "").length < 10) {
        setFormError("Số điện thoại MoMo phải có ít nhất 10 chữ số.");
        return;
      }
      if (paymentDetails.momoPin.length < 6) {
        setFormError("Mật khẩu MoMo phải có ít nhất 6 ký tự.");
        return;
      }
    }

    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (!token) {
      setFormError("Bạn cần đăng nhập để hoàn tất đặt vé!");
      navigate("/login");
      return;
    }

    if (
      !selectedSeats.outbound ||
      selectedSeats.outbound.length !== totalPassengers
    ) {
      setFormError("Thông tin ghế chưa đầy đủ. Vui lòng quay lại chọn ghế.");
      return;
    }

    setLoading(true);
    try {
      const checkoutPayload = {
        flight_id: flights[0].id,
        return_flight_id: flights.length > 1 ? flights[1].id : null,
        service_ids: services.map((s) => s.id),
        passengers: passengers.map((p, index) => ({
          name: p.name.trim(),
          identity_number: p.identity_number.trim().toUpperCase(),
          outbound_seat_id: selectedSeats.outbound[index]?.id,
          return_seat_id: selectedSeats.return?.[index]?.id || null,
        })),
      };

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutPayload),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok || bookingData.status !== "success") {
        setFormError(
          bookingData.message ||
            "Đơn giữ chỗ có thể đã hết hạn (15 phút). Vui lòng chọn lại ghế."
        );
        return;
      }

      const createdList = Array.isArray(bookingData.data)
        ? bookingData.data
        : [bookingData.data];
      const createdBookingIds = createdList.map((b) => b.id);
      const pnrCodes = createdList.map((b) => b.pnr_code);

      const payRes = await fetch("/api/bookings/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_ids: createdBookingIds,
          payment_method: paymentMethod === "card" ? "vnpay" : paymentMethod,
        }),
      });

      const payData = await payRes.json();

      if (payRes.ok && payData.status === "success") {
        const snapshot = {
          mode: "paid",
          pnrCodes,
          flights: [...flights],
          passengers: [...passengers],
          selectedSeats: { ...selectedSeats },
          services: [...services],
          totalAmount,
          paymentMethod,
          paidAt: new Date().toLocaleString("vi-VN"),
        };
        localStorage.removeItem("selected_flights");
        localStorage.removeItem("selected_services");
        localStorage.removeItem("selected_seats");
        setCompletedBooking(snapshot);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFormError(
          "Thanh toán chưa hoàn tất: " +
            (payData.message || "Đơn vé đã được tạo ở trạng thái Chờ thanh toán.")
        );
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      setFormError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleHoldBooking = async () => {
    setFormError("");
    if (!validatePassengers()) return;

    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const checkoutPayload = {
        flight_id: flights[0].id,
        return_flight_id: flights.length > 1 ? flights[1].id : null,
        service_ids: services.map((s) => s.id),
        passengers: passengers.map((p, index) => ({
          name: p.name.trim(),
          identity_number: p.identity_number.trim().toUpperCase(),
          outbound_seat_id: selectedSeats.outbound[index]?.id,
          return_seat_id: selectedSeats.return?.[index]?.id || null,
        })),
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutPayload),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        const createdList = Array.isArray(data.data) ? data.data : [data.data];
        const pnrCodes = createdList.map((b) => b.pnr_code);
        const snapshot = {
          mode: "held",
          pnrCodes,
          flights: [...flights],
          passengers: [...passengers],
          selectedSeats: { ...selectedSeats },
          services: [...services],
          totalAmount,
          paymentMethod: "hold",
          paidAt: new Date().toLocaleString("vi-VN"),
        };
        localStorage.removeItem("selected_flights");
        localStorage.removeItem("selected_services");
        localStorage.removeItem("selected_seats");
        setCompletedBooking(snapshot);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFormError(data.message || "Không thể đặt giữ chỗ lúc này.");
      }
    } catch {
      setFormError("Lỗi kết nối tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "—";
    return new Date(timeString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDate = (timeString) => {
    if (!timeString) return "—";
    return new Date(timeString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCity = (airport) =>
    airport?.city || airport?.city_name || airport?.name || airport?.code || "—";

  const formatDateEnShort = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(String(dateStr).replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return formatDate(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getAirlineNameFromCode = (fn = "") => {
    const prefix = String(fn).slice(0, 2).toUpperCase();
    if (prefix === "VN") return "Vietnam Airlines";
    if (prefix === "VJ") return "VietJet Air";
    if (prefix === "QH" || prefix === "FB") return "Bamboo Airways";
    return "SkyLink Airlines";
  };

  // ─── 5-STAR DIGITAL E-TICKET / BOARDING PASS CONFIRMATION SCREEN ──────────
  if (completedBooking) {
    const isPaidMode = completedBooking.mode === "paid";
    const mainPnr = completedBooking.pnrCodes.join(" • ");
    const cabinText =
      String(searchParams.cabinClass || "").toLowerCase().includes("business") ||
      String(searchParams.cabinClass || "").toLowerCase().includes("thương gia")
        ? "Business · Thương gia"
        : "Economy · Phổ thông";
    const addonSummary =
      completedBooking.services?.length > 0
        ? completedBooking.services.map((s) => s.name).join(", ")
        : "Tiêu chuẩn (Standard)";

    return (
      <div
        className="min-h-screen font-sans text-slate-900"
        style={{
          background:
            "linear-gradient(180deg, #b8dcff 0%, #dceeff 26%, #eef6ff 64%, #d6eaff 100%)",
        }}
      >
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 pb-20 pt-26 sm:px-6">
          <div
            className="overflow-hidden bg-white shadow-xl"
            style={{
              borderRadius: 28,
              border: "1px solid #dbe7fb",
              boxShadow: "0 20px 50px rgba(20, 62, 132, 0.14)",
            }}
          >
            {/* 1. Royal-Blue Celebration Header */}
            <div
              className="relative overflow-hidden px-6 py-8 text-center text-white sm:px-10"
              style={{
                background: isPaidMode
                  ? "linear-gradient(135deg, #0a3b8e 0%, #1d64f2 55%, #0ea5e9 100%)"
                  : "linear-gradient(135deg, #0f2957 0%, #1e40af 60%, #0284c7 100%)",
              }}
            >
              <div
                className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
                style={{
                  background: isPaidMode
                    ? "rgba(16, 185, 129, 0.22)"
                    : "rgba(251, 191, 36, 0.22)",
                  border: isPaidMode
                    ? "2px solid rgba(110, 231, 183, 0.7)"
                    : "2px solid rgba(252, 211, 77, 0.7)",
                }}
              >
                {isPaidMode ? (
                  <CheckCircle size={40} weight="fill" className="text-emerald-300" />
                ) : (
                  <Clock size={36} weight="fill" className="text-amber-300" />
                )}
              </div>

              <p
                className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-sky-200"
                style={{ margin: "0 0 4px 0" }}
              >
                <AirplaneTilt size={14} weight="fill" />
                SKYLINK AIRLINES • {isPaidMode ? "E-TICKET CONFIRMATION" : "BOOKING RESERVATION HOLD"}
              </p>

              <h1
                className="font-black tracking-tight text-white"
                style={{
                  margin: 0,
                  fontSize: "clamp(1.55rem, 2.8vw, 2.15rem)",
                  lineHeight: 1.2,
                }}
              >
                {isPaidMode
                  ? "Booking Confirmed · Thanh toán vé thành công!"
                  : "Booking Held · Đã đặt giữ chỗ thành công!"}
              </h1>

              <p
                className="mx-auto mt-2 max-w-xl text-xs font-medium text-sky-100 sm:text-sm"
                style={{ margin: "8px auto 18px auto" }}
              >
                {isPaidMode
                  ? "Your SkyLink e-ticket is confirmed. Vé điện tử đã được xuất — bạn có thể đăng ký suất ăn miễn phí trước giờ bay 24h."
                  : "Vui lòng hoàn tất thanh toán trong thời gian giữ chỗ tại mục My Bookings để tránh hệ thống tự động hủy vé."}
              </p>

              {/* 1-Click Copy PNR Pill */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(mainPnr);
                    setCopiedPnr(true);
                    window.setTimeout(() => setCopiedPnr(false), 2000);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-black transition hover:bg-white"
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    color: "#091e47",
                    borderRadius: 9999,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(9, 30, 71, 0.22)",
                  }}
                >
                  <Ticket size={18} weight="fill" className="text-[#0b5ed7]" />
                  <span>
                    PNR Code · Mã đặt chỗ:{" "}
                    <strong className="font-mono text-[#0b5ed7]">{mainPnr}</strong>
                  </span>
                  <Copy size={15} weight="bold" className="text-slate-500" />
                  {copiedPnr && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Digital Boarding Pass Body */}
            <div className="space-y-5 p-6 sm:p-8">
              {completedBooking.flights.map((legFlight, legIdx) => {
                const legSeats =
                  legIdx === 0
                    ? completedBooking.selectedSeats?.outbound || []
                    : completedBooking.selectedSeats?.return || [];
                const legPnr =
                  completedBooking.pnrCodes[legIdx] || completedBooking.pnrCodes[0] || "SKL001";
                const airlineTitle = getAirlineNameFromCode(legFlight.flight_number);

                return (
                  <div
                    key={legIdx}
                    className="relative overflow-hidden bg-[#f8fbff]"
                    style={{
                      borderRadius: 22,
                      border: "1.5px solid #d5e5fc",
                    }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      {/* Left 8 Cols: Flight & Passenger Boarding Pass */}
                      <div className="p-5 sm:p-6 lg:col-span-8">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 font-extrabold text-white"
                              style={{
                                background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                                borderRadius: 9999,
                                padding: "3px 11px",
                                fontSize: 11,
                              }}
                            >
                              <AirplaneTilt size={12} weight="fill" />
                              {legIdx === 0 ? "Outbound · Chiều đi" : "Return · Chiều về"}
                            </span>
                            <span className="text-xs font-black text-[#091e47]">
                              {airlineTitle}
                            </span>
                            <span
                              className="font-mono text-[11px] font-bold text-slate-600"
                              style={{
                                background: "#e8f1fd",
                                borderRadius: 6,
                                padding: "1px 7px",
                              }}
                            >
                              {legFlight.flight_number || "SK888"}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0b5ed7]">
                            <CalendarBlank size={14} weight="fill" />
                            {formatDateEnShort(legFlight.departure_time)}
                          </span>
                        </div>

                        {/* Route Timeline */}
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-2xs" style={{ border: "1px solid #e4efff" }}>
                          <div>
                            <div className="font-black leading-none text-[#091e47]" style={{ fontSize: 24 }}>
                              {formatTime(legFlight.departure_time)}
                            </div>
                            <div className="mt-1 text-xs font-extrabold text-[#0b5ed7]">
                              {legFlight.departure_airport?.code || "—"}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500">
                              {getCity(legFlight.departure_airport)}
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col items-center px-2">
                            <div className="relative flex h-5 w-full items-center justify-center">
                              <div className="w-full" style={{ borderTop: "1.5px dashed #bfd5f7" }} />
                              <span className="absolute bg-white px-2 text-base leading-none text-[#0ea5e9]">
                                ✈
                              </span>
                            </div>
                            <span className="mt-1 rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#0b5ed7]">
                              Direct · Bay thẳng
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="font-black leading-none text-[#091e47]" style={{ fontSize: 24 }}>
                              {formatTime(legFlight.arrival_time)}
                            </div>
                            <div className="mt-1 text-xs font-extrabold text-[#0b5ed7]">
                              {legFlight.arrival_airport?.code || "—"}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500">
                              {getCity(legFlight.arrival_airport)}
                            </div>
                          </div>
                        </div>

                        {/* 4-Item Passenger & Seat Details Grid */}
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl bg-white px-3 py-2" style={{ border: "1px solid #e4efff" }}>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Passenger
                            </span>
                            <span className="block truncate text-xs font-black text-[#091e47]">
                              {completedBooking.passengers.map((p) => p.name).join(", ")}
                            </span>
                          </div>
                          <div className="rounded-xl bg-white px-3 py-2" style={{ border: "1px solid #e4efff" }}>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Seat · Ghế
                            </span>
                            <span className="block truncate text-xs font-black text-[#0b5ed7]">
                              {legSeats.length > 0
                                ? legSeats.map((s) => s.seat_number).join(", ")
                                : "Auto"}
                            </span>
                          </div>
                          <div className="rounded-xl bg-white px-3 py-2" style={{ border: "1px solid #e4efff" }}>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Cabin · Hạng
                            </span>
                            <span className="block truncate text-xs font-black text-[#091e47]">
                              {cabinText}
                            </span>
                          </div>
                          <div className="rounded-xl bg-white px-3 py-2" style={{ border: "1px solid #e4efff" }}>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Add-ons
                            </span>
                            <span className="block truncate text-xs font-extrabold text-[#091e47]" title={addonSummary}>
                              {addonSummary}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right 4 Cols: Perforated E-Ticket Stub + Barcode */}
                      <div
                        className="flex flex-col justify-between bg-white p-5 sm:p-6 lg:col-span-4"
                        style={{
                          borderTop: "1.5px dashed #bfd5f7",
                          borderLeft: "1.5px dashed #bfd5f7",
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400">
                              E-Ticket Stub
                            </span>
                            <span
                              className="inline-flex items-center gap-1 font-extrabold"
                              style={
                                isPaidMode
                                  ? {
                                      background: "#dcfce7",
                                      color: "#15803d",
                                      borderRadius: 9999,
                                      padding: "2px 9px",
                                      fontSize: 10.5,
                                    }
                                  : {
                                      background: "#fef3c7",
                                      color: "#b45309",
                                      borderRadius: 9999,
                                      padding: "2px 9px",
                                      fontSize: 10.5,
                                    }
                              }
                            >
                              {isPaidMode ? "✓ PAID" : "⏳ HOLD"}
                            </span>
                          </div>

                          <div className="mt-3">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-400">
                              Booking Ref (PNR)
                            </span>
                            <span
                              className="font-mono font-black tracking-widest text-[#0b5ed7]"
                              style={{ fontSize: 22 }}
                            >
                              {legPnr}
                            </span>
                          </div>

                          {/* Stylized Airline Barcode */}
                          <div className="my-3.5 flex h-10 items-stretch justify-between gap-[2px] rounded-lg bg-[#f8fbff] px-3 py-2" style={{ border: "1px solid #e4efff" }}>
                            {[3, 1, 2, 1, 3, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 3, 2].map(
                              (w, i) => (
                                <span
                                  key={i}
                                  className="h-full rounded-xs bg-[#091e47]"
                                  style={{ width: w * 1.5, opacity: i % 3 === 0 ? 0.9 : 0.65 }}
                                />
                              )
                            )}
                          </div>
                        </div>

                        {legIdx === 0 && (
                          <div className="border-t border-slate-100 pt-3">
                            <div className="flex items-baseline justify-between">
                              <span className="text-[11px] font-bold text-slate-500">
                                Total · Tổng tiền
                              </span>
                              <span className="font-black text-[#091e47]" style={{ fontSize: 17, whiteSpace: "nowrap" }}>
                                {currency.format(completedBooking.totalAmount)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[10.5px] font-semibold text-slate-400">
                              <span>
                                {isPaidMode
                                  ? `Via ${String(completedBooking.paymentMethod || "VNPAY").toUpperCase()}`
                                  : "Pay Later · Giữ chỗ"}
                              </span>
                              <span>{completedBooking.paidAt}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 3. Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold text-[#163d7a] transition hover:bg-blue-50"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #cde0fc",
                    borderRadius: 9999,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Printer size={15} weight="bold" />
                  <span>Print E-Ticket · In vé</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/services/meals")}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100"
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: 9999,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ForkKnife size={15} weight="fill" />
                  <span>Đăng ký suất ăn miễn phí</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/my-bookings")}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:brightness-105"
                  style={{
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                    borderRadius: 9999,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 6px 16px rgba(29, 78, 216, 0.28)",
                  }}
                >
                  <Ticket size={15} weight="fill" />
                  <span>My Bookings · Chuyến bay của tôi</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 9999,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <House size={15} weight="bold" />
                  <span>Trang chủ</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

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
            src={HERO_CHECKOUT_BG_URL}
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
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-[#16428b] shadow-sm transition hover:bg-white"
              style={{
                border: "1px solid rgba(255,255,255,0.96)",
                borderRadius: 9999,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Back to Add-ons · Quay lại</span>
            </button>

            {/* 4-Step Progress Bar with Active Blue Pill on Step 4 */}
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-emerald-700">
                <Check size={13} weight="bold" />
                3. Add-ons
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
                4. Payment · Thanh toán
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#0b57d0]">
                  <AirplaneTilt size={15} weight="fill" />
                  STEP 4/4 • COMPLETE BOOKING • HOÀN TẤT ĐẶT VÉ
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-extrabold text-amber-800"
                  style={{
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: 9999,
                  }}
                >
                  <Timer size={14} weight="bold" className="animate-pulse text-amber-600" />
                  Hold · Giữ chỗ còn:{" "}
                  <strong className="font-mono">{formatCountdown(timeLeft)}</strong>
                </span>
              </div>
              <h1
                className="font-black tracking-tight"
                style={{
                  fontSize: "clamp(1.85rem, 3.2vw, 2.5rem)",
                  color: "#091e47",
                  lineHeight: 1.12,
                  margin: "0 0 6px 0",
                }}
              >
                Xác nhận & Thanh toán
              </h1>
              <p className="text-xs font-semibold text-[#2d4b7a] sm:text-sm" style={{ margin: 0 }}>
                Enter passenger details matching ID/Passport • Hoàn tất thanh toán để nhận ngay mã đặt chỗ PNR.
              </p>
            </div>

            <div
              className="hidden items-center gap-2.5 bg-white/95 px-4 py-2.5 shadow-sm md:flex"
              style={{ borderRadius: 18, border: "1px solid #d5e6fc" }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)" }}
              >
                <ShieldCheck size={20} weight="fill" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-[#092152]" style={{ margin: 0 }}>
                  PCI DSS Secured · Bảo mật
                </p>
                <p className="text-[11px] font-semibold text-[#0b5ed7]" style={{ margin: 0 }}>
                  256-bit SSL Encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-2 sm:px-6 lg:px-8">
        {formError && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700"
          >
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
          {/* LEFT 8 COLUMNS: Passenger Details + Payment Method */}
          <div className="space-y-6 lg:col-span-8">
            {/* SECTION 1: PASSENGER DETAILS */}
            <section
              className="bg-white p-6"
              style={{
                borderRadius: 24,
                border: "1px solid #dbe7fb",
                boxShadow: "0 12px 32px rgba(20, 62, 132, 0.08)",
              }}
            >
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)" }}
                >
                  1
                </span>
                <div>
                  <h2 className="font-black text-[#092152]" style={{ margin: 0, fontSize: 16.5, lineHeight: 1.25 }}>
                    Passenger Details · Thông tin hành khách ({totalPassengers} khách)
                  </h2>
                  <p className="text-xs font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Enter exact name as on National ID / Passport • Nhập đúng họ tên để làm thủ tục lên máy bay
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {passengers.map((p, index) => {
                  const outSeat = selectedSeats.outbound?.[index]?.seat_number;
                  const retSeat = selectedSeats.return?.[index]?.seat_number;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl p-4 sm:p-5"
                      style={{
                        background: "#f4f8ff",
                        border: "1px solid #dce8fa",
                      }}
                    >
                      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0b5ed7]">
                            <User size={14} weight="fill" />
                          </span>
                          <h3 className="font-black text-[#092152]" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.3 }}>
                            Passenger {index + 1} · Hành khách {index + 1}{" "}
                            <span className="font-semibold text-[#5a749b]">
                              ({index === 0 ? "Primary Adult · Người lớn chính" : "Companion · Đi kèm"})
                            </span>
                          </h3>
                        </div>

                        {outSeat && (
                          <span
                            className="inline-flex items-center gap-1 font-extrabold text-[#0b4fd0]"
                            style={{
                              background: "#ffffff",
                              border: "1px solid #bfd7fb",
                              borderRadius: 9999,
                              padding: "3px 10px",
                              fontSize: 11,
                            }}
                          >
                            <Armchair size={12} weight="fill" />
                            Seat · Ghế: {outSeat}
                            {retSeat ? ` / ${retSeat}` : ""}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        <div>
                          <label
                            className="mb-1 text-[11px] font-extrabold text-[#365382]"
                            style={{ display: "block" }}
                          >
                            Full Name · Họ và tên (In hoa không dấu){" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="NGUYEN VAN A"
                            value={p.name}
                            onChange={(e) => {
                              setFormError("");
                              const next = [...passengers];
                              next[index].name = e.target.value.toUpperCase();
                              setPassengers(next);
                            }}
                            className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-extrabold uppercase text-[#092152] transition focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label
                            className="mb-1 text-[11px] font-extrabold text-[#365382]"
                            style={{ display: "block" }}
                          >
                            ID / Passport · Số CCCD (12 số) / Hộ chiếu{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="VD: 079200012345 hoặc C1234567"
                            value={p.identity_number}
                            onChange={(e) => {
                              setFormError("");
                              const next = [...passengers];
                              next[index].identity_number =
                                e.target.value.toUpperCase();
                              setPassengers(next);
                            }}
                            className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-extrabold uppercase text-[#092152] transition focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: PAYMENT METHOD — 3-Card Grid matching Mockup */}
            <section
              className="bg-white p-6"
              style={{
                borderRadius: 24,
                border: "1px solid #dbe7fb",
                boxShadow: "0 12px 32px rgba(20, 62, 132, 0.08)",
              }}
            >
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)" }}
                >
                  2
                </span>
                <div>
                  <h2 className="font-black text-[#092152]" style={{ margin: 0, fontSize: 16.5, lineHeight: 1.25 }}>
                    Payment Method · Phương thức thanh toán
                  </h2>
                  <p className="text-xs font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Choose an online payment gateway for instant e-ticket issuance • Xuất vé điện tử ngay lập tức
                  </p>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                {[
                  {
                    id: "vnpay",
                    title: "Cổng VNPay / Thẻ ATM",
                    subtitle: "40+ ngân hàng nội địa",
                    accent: "#0b5ed7",
                    bgActive: "#eff6ff",
                    renderIcon: () => <VnpayBrandLogo />,
                  },
                  {
                    id: "momo",
                    title: "Ví Điện Tử MoMo",
                    subtitle: "Thanh toán nhanh chóng",
                    accent: "#a50064",
                    bgActive: "#fdf2f8",
                    renderIcon: () => <MomoBrandLogo />,
                  },
                  {
                    id: "card",
                    title: "Thẻ ATM / Visa, Master",
                    subtitle: "Thanh toán thẻ an toàn",
                    accent: "#0284c7",
                    bgActive: "#f0f9ff",
                    renderIcon: () => (
                      <div
                        className="flex h-8 w-11 items-center justify-center rounded-lg text-white shadow-xs"
                        style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)" }}
                      >
                        <CreditCard size={20} weight="fill" />
                      </div>
                    ),
                  },
                ].map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className="relative flex cursor-pointer flex-col items-center rounded-2xl px-3.5 py-4 text-center transition hover:-translate-y-0.5"
                      style={{
                        border: isSelected
                          ? `2px solid ${method.accent}`
                          : "1px solid #dbe8fc",
                        background: isSelected ? method.bgActive : "#ffffff",
                        boxShadow: isSelected
                          ? "0 8px 20px rgba(29, 78, 216, 0.12)"
                          : "none",
                      }}
                    >
                      {/* Top-right Checkmark Circle */}
                      <span
                        className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition"
                        style={{
                          borderColor: isSelected ? method.accent : "#cbd5e1",
                          background: isSelected ? method.accent : "transparent",
                          color: "#ffffff",
                        }}
                      >
                        {isSelected && <Check size={11} weight="bold" />}
                      </span>

                      <div className="mb-2.5 flex h-10 items-center justify-center">
                        {method.renderIcon()}
                      </div>
                      <p className="text-xs font-black text-[#092152]" style={{ margin: 0 }}>
                        {method.title}
                      </p>
                      <p
                        className="mt-1 text-[11px] font-semibold text-[#556f96]"
                        style={{ margin: "3px 0 0 0" }}
                      >
                        {method.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Sandbox Payment Fields */}
              <div className="rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4 sm:p-5">
                {paymentMethod === "vnpay" || paymentMethod === "card" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0b5ed7]" style={{ margin: 0 }}>
                        <Bank size={16} weight="fill" />{" "}
                        {paymentMethod === "card"
                          ? "Card Details · Thông tin thẻ Visa / Master / ATM"
                          : "VNPay Sandbox · Thông tin thẻ ATM"}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">
                        Sandbox Mode
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          className="mb-1 text-[11px] font-bold text-[#47628a]"
                          style={{ display: "block" }}
                        >
                          Card Number · Số thẻ ATM / Visa
                        </label>
                        <input
                          type="text"
                          placeholder="9704 1985 1234 5678"
                          value={paymentDetails.vnpayCard}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              vnpayCard: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-[#092152] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          className="mb-1 text-[11px] font-bold text-[#47628a]"
                          style={{ display: "block" }}
                        >
                          PIN / OTP · Mã xác thực
                        </label>
                        <input
                          type="password"
                          placeholder="••••••"
                          value={paymentDetails.vnpayPin}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              vnpayPin: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-[#092152] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#a50064]" style={{ margin: 0 }}>
                        <Wallet size={16} weight="fill" /> MoMo E-Wallet Sandbox
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">
                        Sandbox Mode
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          className="mb-1 text-[11px] font-bold text-[#47628a]"
                          style={{ display: "block" }}
                        >
                          MoMo Phone · Số điện thoại MoMo
                        </label>
                        <input
                          type="text"
                          placeholder="0901234567"
                          value={paymentDetails.momoPhone}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              momoPhone: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-pink-200 bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-[#092152] focus:border-pink-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          className="mb-1 text-[11px] font-bold text-[#47628a]"
                          style={{ display: "block" }}
                        >
                          MoMo Password · Mật khẩu (6 số)
                        </label>
                        <input
                          type="password"
                          placeholder="••••••"
                          value={paymentDetails.momoPin}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              momoPin: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-pink-200 bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-[#092152] focus:border-pink-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT 4 COLUMNS: DEEP ROYAL-BLUE HEADER ORDER SUMMARY matching Mockup */}
          <aside className="lg:col-span-4">
            <div
              className="sticky top-24 overflow-hidden bg-white"
              style={{
                borderRadius: 24,
                border: "1px solid #dbe7fb",
                boxShadow: "0 14px 36px rgba(20, 62, 132, 0.12)",
              }}
            >
              {/* Deep Royal-Blue Gradient Header */}
              <div
                className="flex items-center justify-between gap-2 px-5 py-4 text-white"
                style={{
                  background: "linear-gradient(135deg, #0a3b8e 0%, #1d64f2 100%)",
                }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <AirplaneTilt size={20} weight="fill" className="shrink-0 text-sky-200" />
                  <div className="min-w-0">
                    <h3
                      className="truncate font-black text-white"
                      style={{ margin: 0, fontSize: 15.5, lineHeight: 1.2 }}
                    >
                      Order Summary
                    </h3>
                    <span className="block text-[11px] font-semibold text-sky-100/90">
                      Tóm tắt đơn hàng
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTicketDetails((v) => !v)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 font-bold text-white transition hover:bg-white/25"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 9999,
                    padding: "4px 11px",
                    fontSize: 11.5,
                  }}
                >
                  <span>Chi tiết vé</span>
                  {showTicketDetails ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
                </button>
              </div>

              {/* White Order Summary Body */}
              <div className="space-y-4 p-5">
                {/* Route Summary */}
                {showTicketDetails && (
                  <div className="space-y-3 border-b border-slate-100 pb-4">
                    {flights.map((f, idx) => {
                      const legSeats =
                        idx === 0
                          ? selectedSeats.outbound || []
                          : selectedSeats.return || [];
                      return (
                        <div key={idx} className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-left">
                              <span
                                className="block font-black leading-tight text-[#091e47]"
                                style={{ fontSize: 21 }}
                              >
                                {f.departure_airport?.code || "—"}
                              </span>
                              <span className="text-[11px] font-semibold text-[#5a749b]">
                                {getCity(f.departure_airport)}
                              </span>
                            </div>

                            <div className="flex flex-1 flex-col items-center px-2">
                              <div className="relative flex h-5 w-full items-center justify-center">
                                <div className="w-full" style={{ borderTop: "1.5px dashed #cbd5e1" }} />
                                <span className="absolute bg-white px-1.5 text-sm leading-none text-[#0ea5e9]">
                                  ✈
                                </span>
                              </div>
                              <span className="mt-1 font-mono text-[10px] font-bold text-slate-400">
                                {f.flight_number || "SK-888"}
                              </span>
                            </div>

                            <div className="text-right">
                              <span
                                className="block font-black leading-tight text-[#091e47]"
                                style={{ fontSize: 21 }}
                              >
                                {f.arrival_airport?.code || "—"}
                              </span>
                              <span className="text-[11px] font-semibold text-[#5a749b]">
                                {getCity(f.arrival_airport)}
                              </span>
                            </div>
                          </div>

                          <div
                            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-xl py-2 text-[11.5px] font-bold text-[#365382]"
                            style={{ background: "#f4f8ff", border: "1px solid #e4efff" }}
                          >
                            <span className="inline-flex items-center gap-1">
                              <CalendarBlank size={13} weight="fill" className="text-[#0b5ed7]" />
                              {formatDate(f.departure_time)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock size={13} weight="fill" className="text-[#0b5ed7]" />
                              {formatTime(f.departure_time)} – {formatTime(f.arrival_time)}
                            </span>
                            {legSeats.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[#0b5ed7]">
                                <Armchair size={13} weight="fill" />
                                {legSeats.map((s) => s.seat_number).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Itemized Price Breakdown with Icons matching Mockup */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#47628a]">
                    <span className="inline-flex items-center gap-1.5">
                      <AirplaneTilt size={14} weight="fill" className="text-[#0b5ed7]" />
                      <span>Base fare · Giá vé ({totalPassengers} khách)</span>
                    </span>
                    <strong className="text-[#092152]" style={{ whiteSpace: "nowrap" }}>
                      {currency.format(basePrice)}
                    </strong>
                  </div>

                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between font-semibold text-[#47628a]"
                    >
                      <span className="inline-flex min-w-0 items-center gap-1.5 pr-2">
                        <SuitcaseRolling size={14} weight="fill" className="shrink-0 text-[#0b5ed7]" />
                        <span className="truncate">{s.name}</span>
                      </span>
                      <strong className="shrink-0 text-[#0b5ed7]" style={{ whiteSpace: "nowrap" }}>
                        +{currency.format(Number(s.price || 0))}
                      </strong>
                    </div>
                  ))}

                  <div className="flex items-center justify-between font-semibold text-[#47628a]">
                    <span className="inline-flex items-center gap-1.5">
                      <Star size={14} weight="fill" className="text-amber-500" />
                      <span>Thuế, phí sân bay & hệ thống</span>
                    </span>
                    <strong className="text-[#092152]" style={{ whiteSpace: "nowrap" }}>
                      {currency.format(taxAmount)}
                    </strong>
                  </div>
                </div>

                {/* Soft Sky Gradient Total Box matching Mockup */}
                <div
                  className="p-4"
                  style={{
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #eef6ff 0%, #dff0ff 100%)",
                    border: "1px solid #cde4ff",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#365382]">
                      Total · Tổng thanh toán
                    </span>
                    <span className="text-[10px] font-bold text-[#0b5ed7]">
                      VAT included
                    </span>
                  </div>
                  <div
                    className="mt-1 font-black tracking-tight text-[#091e47]"
                    style={{ fontSize: 26, lineHeight: 1.15, whiteSpace: "nowrap" }}
                  >
                    {currency.format(totalAmount)}
                  </div>
                </div>

                {/* Primary & Secondary Action Pills matching Mockup */}
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 px-4 py-3.5 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                      borderRadius: 9999,
                      border: "none",
                      cursor: loading ? "wait" : "pointer",
                      whiteSpace: "nowrap",
                      boxShadow: "0 6px 18px rgba(29, 78, 216, 0.28)",
                    }}
                  >
                    <CreditCard size={16} weight="fill" />
                    <span>
                      {loading ? "Processing..." : "Xác nhận & Thanh toán"}
                    </span>
                    {!loading && <ArrowRight size={15} weight="bold" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleHoldBooking}
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-extrabold text-[#163d7a] transition hover:bg-blue-50 disabled:opacity-50"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #cde0fc",
                      borderRadius: 9999,
                      cursor: loading ? "wait" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Clock size={15} weight="bold" className="text-[#0b5ed7]" />
                    <span>Đặt giữ chỗ (Thanh toán sau)</span>
                  </button>
                </div>

                <div className="flex items-start gap-2 pt-0.5 text-[10.5px] font-semibold leading-relaxed text-slate-400">
                  <ShieldCheck size={16} weight="fill" className="mt-0.5 shrink-0 text-[#0b5ed7]" />
                  <span>
                    Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của SkyLink Airlines.
                  </span>
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

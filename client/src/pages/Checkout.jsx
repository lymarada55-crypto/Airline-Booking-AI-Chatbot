import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AirplaneTilt,
  Armchair,
  ArrowLeft,
  ArrowRight,
  Bank,
  Check,
  CheckCircle,
  Clock,
  Copy,
  ForkKnife,
  House,
  Printer,
  ShieldCheck,
  Sparkle,
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

    if (paymentMethod === "vnpay") {
      if (!paymentDetails.vnpayCard.trim() || !paymentDetails.vnpayPin.trim()) {
        setFormError("Vui lòng nhập đầy đủ Số thẻ ATM và Mã PIN VNPAY.");
        return;
      }
      if (paymentDetails.vnpayCard.replace(/\D/g, "").length < 4) {
        setFormError("Số thẻ VNPAY không hợp lệ.");
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
          payment_method: paymentMethod,
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

  // ─── 5-STAR POST-PAYMENT / HOLD CONFIRMATION SCREEN ───────────────────────
  if (completedBooking) {
    const isPaidMode = completedBooking.mode === "paid";
    const mainPnr = completedBooking.pnrCodes.join(" • ");
    const firstFlight = completedBooking.flights[0];

    return (
      <div
        className="min-h-screen font-sans text-slate-900"
        style={{
          background:
            "linear-gradient(180deg, #b8dcff 0%, #dceeff 26%, #eef6ff 64%, #d6eaff 100%)",
        }}
      >
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6">
          <div
            className="overflow-hidden bg-white p-6 text-center shadow-xl sm:p-10"
            style={{
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.98)",
              boxShadow: "0 20px 50px rgba(20, 62, 132, 0.14)",
            }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle size={40} weight="fill" />
            </div>

            <h1 className="text-2xl font-black text-[#092152] sm:text-3xl" style={{ margin: 0 }}>
              {isPaidMode ? "Thanh toán vé thành công!" : "Đã đặt giữ chỗ thành công!"}
            </h1>
            <p className="mt-2 text-xs font-semibold text-[#47628a] sm:text-sm" style={{ margin: "8px 0 16px 0" }}>
              {isPaidMode
                ? "Vé điện tử SkyLink Airlines của bạn đã được xác nhận. Bạn có thể đăng ký suất ăn đặc biệt miễn phí trước giờ bay 24h."
                : "Vui lòng hoàn tất thanh toán trong thời gian giữ chỗ tại mục Chuyến bay của tôi để tránh vé tự động hủy."}
            </p>

            {/* PNR Code Mint Pill */}
            <div className="mb-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(mainPnr);
                  setCopiedPnr(true);
                  window.setTimeout(() => setCopiedPnr(false), 2000);
                }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition hover:opacity-90"
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  border: "1px solid #bbf7d0",
                  cursor: "pointer",
                }}
              >
                <Ticket size={18} weight="fill" />
                <span>Mã đặt chỗ (PNR): {mainPnr}</span>
                <Copy size={15} weight="bold" />
                {copiedPnr && (
                  <span className="text-xs font-bold text-emerald-700">(Đã chép)</span>
                )}
              </button>
            </div>

            {/* Summary Receipt Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 text-left md:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-[#f7faff] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0b5ed7]" style={{ margin: "0 0 8px 0" }}>
                  Hành trình chuyến bay
                </p>
                {firstFlight && (
                  <p className="text-base font-black text-[#092152]" style={{ margin: "0 0 4px 0" }}>
                    {getCity(firstFlight.departure_airport)} ({firstFlight.departure_airport?.code}) ➔{" "}
                    {getCity(firstFlight.arrival_airport)} ({firstFlight.arrival_airport?.code})
                  </p>
                )}
                <p className="text-xs font-semibold text-[#47628a]" style={{ margin: "0 0 6px 0" }}>
                  Ngày bay: {formatDate(firstFlight?.departure_time)} • Giờ:{" "}
                  {formatTime(firstFlight?.departure_time)}
                </p>
                <p className="text-xs font-bold text-[#163d7a]" style={{ margin: 0 }}>
                  Hành khách:{" "}
                  {completedBooking.passengers.map((p) => p.name).join(", ")}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-[#f0f7ff] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0b5ed7]" style={{ margin: "0 0 8px 0" }}>
                  Thông tin thanh toán
                </p>
                <p className="text-xl font-black text-[#0b4fd0]" style={{ margin: "0 0 4px 0" }}>
                  {currency.format(completedBooking.totalAmount)}
                </p>
                <p className="text-xs font-bold text-emerald-700" style={{ margin: "0 0 4px 0" }}>
                  {isPaidMode
                    ? `✔ Đã thanh toán qua ${completedBooking.paymentMethod.toUpperCase()}`
                    : "⏳ Đang giữ chỗ (Chờ thanh toán)"}
                </p>
                <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: 0 }}>
                  Thời gian: {completedBooking.paidAt}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold text-[#163d7a] transition hover:bg-blue-50"
                style={{
                  background: "#ffffff",
                  border: "1px solid #cde0fc",
                  borderRadius: 9999,
                  cursor: "pointer",
                }}
              >
                <Printer size={15} weight="bold" />
                In xác nhận vé
              </button>

              <button
                type="button"
                onClick={() => navigate("/services/meals")}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100"
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: 9999,
                  cursor: "pointer",
                }}
              >
                <ForkKnife size={15} weight="fill" />
                Đăng ký suất ăn miễn phí
              </button>

              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:opacity-95"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Ticket size={15} weight="fill" />
                Xem chuyến bay của tôi
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 9999,
                  cursor: "pointer",
                }}
              >
                <House size={15} weight="bold" />
                Về trang chủ
              </button>
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
              <span>Quay lại chọn dịch vụ</span>
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
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Check size={13} weight="bold" />
                3. Dịch vụ
              </span>
              <span className="text-slate-300">›</span>
              <span className="font-black text-[#0b5ed7]">4. Thanh toán</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0b57d0]">
                  <AirplaneTilt size={15} weight="fill" />
                  BƯỚC 4/4 • HOÀN TẤT ĐẶT VÉ
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800">
                  <Timer size={14} weight="bold" className="animate-pulse" />
                  Giữ ghế còn:{" "}
                  <strong className="font-mono">{formatCountdown(timeLeft)}</strong>
                </span>
              </div>
              <h1
                className="font-black tracking-tight"
                style={{
                  fontSize: "clamp(1.95rem, 3.4vw, 2.7rem)",
                  color: "#091e47",
                  lineHeight: 1.12,
                  margin: "0 0 6px 0",
                }}
              >
                Xác nhận & Thanh toán
              </h1>
              <p className="text-xs font-semibold text-[#2d4b7a] sm:text-sm" style={{ margin: 0 }}>
                Nhập chính xác thông tin hành khách theo CCCD/Hộ chiếu và hoàn tất thanh toán để
                nhận ngay mã đặt chỗ PNR.
              </p>
            </div>

            <div
              className="hidden items-center gap-2.5 bg-white/90 px-4 py-2.5 shadow-sm md:flex"
              style={{ borderRadius: 18, border: "1px solid #d5e6fc" }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <ShieldCheck size={20} weight="fill" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-[#092152]" style={{ margin: 0 }}>
                  Bảo mật chuẩn PCI DSS
                </p>
                <p className="text-[11px] font-semibold text-[#0b5ed7]" style={{ margin: 0 }}>
                  Mã hóa giao dịch 256-bit
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
              className="bg-white p-6 sm:p-7"
              style={{
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.98)",
                boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
              }}
            >
              <div className="mb-5 flex items-center gap-3 border-b border-blue-50 pb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-sm">
                  1
                </span>
                <div>
                  <h2 className="text-base font-black text-[#092152]" style={{ margin: 0 }}>
                    Thông tin hành khách ({totalPassengers} khách)
                  </h2>
                  <p className="text-xs font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Nhập đúng họ tên theo CCCD gắn chip hoặc Hộ chiếu để làm thủ tục lên máy bay
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
                      className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4 sm:p-5"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            <User size={13} weight="bold" />
                          </span>
                          <h3 className="text-xs font-black text-[#092152]" style={{ margin: 0 }}>
                            Hành khách {index + 1}{" "}
                            <span className="font-semibold text-[#5a749b]">
                              ({index === 0 ? "Người lớn chính" : "Hành khách đi kèm"})
                            </span>
                          </h3>
                        </div>

                        {outSeat && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-extrabold text-[#0b4fd0] border border-blue-200">
                            <Armchair size={12} weight="fill" />
                            Ghế đi: {outSeat}
                            {retSeat ? ` • Về: ${retSeat}` : ""}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#47628a]">
                            Họ và Tên (In hoa không dấu){" "}
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
                            className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-extrabold uppercase text-[#092152] focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#47628a]">
                            Số CCCD (12 số) / Hộ chiếu{" "}
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
                            className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-extrabold uppercase text-[#092152] focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: PAYMENT METHOD */}
            <section
              className="bg-white p-6 sm:p-7"
              style={{
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.98)",
                boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
              }}
            >
              <div className="mb-5 flex items-center gap-3 border-b border-blue-50 pb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-sm">
                  2
                </span>
                <div>
                  <h2 className="text-base font-black text-[#092152]" style={{ margin: 0 }}>
                    Phương thức thanh toán
                  </h2>
                  <p className="text-xs font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Chọn cổng thanh toán trực tuyến để xuất vé điện tử ngay lập tức
                  </p>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    id: "vnpay",
                    title: "Cổng VNPAY / Thẻ ATM",
                    subtitle: "Hỗ trợ 40+ ngân hàng nội địa",
                    Logo: VnpayBrandLogo,
                    badge: "Phổ biến",
                  },
                  {
                    id: "momo",
                    title: "Ví Điện Tử MoMo",
                    subtitle: "Thanh toán nhanh không mất phí",
                    Logo: MomoBrandLogo,
                    badge: "Tức thì",
                  },
                ].map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className="cursor-pointer rounded-2xl p-4 transition"
                      style={{
                        border: isSelected
                          ? method.id === "vnpay"
                            ? "2px solid #0b5ed7"
                            : "2px solid #a50064"
                          : "1px solid #dbe8fc",
                        background: isSelected
                          ? method.id === "vnpay"
                            ? "#eff6ff"
                            : "#fdf2f8"
                          : "#ffffff",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-2">
                            <method.Logo />
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#092152]" style={{ margin: 0 }}>
                              {method.title}
                            </p>
                            <p className="mt-0.5 text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                              {method.subtitle}
                            </p>
                          </div>
                        </div>

                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                          style={{
                            borderColor: isSelected
                              ? method.id === "vnpay"
                                ? "#0b5ed7"
                                : "#a50064"
                              : "#cbd5e1",
                            background: isSelected
                              ? method.id === "vnpay"
                                ? "#0b5ed7"
                                : "#a50064"
                              : "transparent",
                            color: "#ffffff",
                          }}
                        >
                          {isSelected && <Check size={11} weight="bold" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sandbox Payment Fields */}
              <div className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4 sm:p-5">
                {paymentMethod === "vnpay" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0b5ed7]" style={{ margin: 0 }}>
                        <Bank size={16} weight="fill" /> Thông tin thẻ VNPAY Sandbox
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">
                        Môi trường thử nghiệm
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-[#47628a]">
                          Số thẻ ATM / Tài khoản
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
                        <label className="mb-1 block text-[11px] font-bold text-[#47628a]">
                          Mã PIN / OTP xác thực
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
                        <Wallet size={16} weight="fill" /> Đăng nhập Ví MoMo Sandbox
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">
                        Môi trường thử nghiệm
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-[#47628a]">
                          Số điện thoại MoMo
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
                        <label className="mb-1 block text-[11px] font-bold text-[#47628a]">
                          Mật khẩu Ví MoMo (6 số)
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

          {/* RIGHT 4 COLUMNS: STICKY ORDER SUMMARY */}
          <aside className="lg:col-span-4">
            <div
              className="sticky top-24 space-y-4 bg-white p-6"
              style={{
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.98)",
                boxShadow: "0 14px 36px rgba(20, 62, 132, 0.10)",
              }}
            >
              <div className="flex items-center justify-between border-b border-blue-50 pb-3">
                <h3 className="text-base font-black text-[#092152]" style={{ margin: 0 }}>
                  Tóm tắt đơn hàng
                </h3>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ background: "#eef6ff", color: "#0b4fd0" }}
                >
                  Chi tiết vé
                </span>
              </div>

              {/* Flights Summary with Accurate City Names & Seats */}
              <div className="space-y-3 border-b border-blue-50 pb-4">
                {flights.map((f, idx) => {
                  const legSeats =
                    idx === 0
                      ? selectedSeats.outbound || []
                      : selectedSeats.return || [];
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-blue-100 bg-[#f7faff] p-3.5"
                    >
                      <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#0b5ed7]">
                        <span>Chuyến {idx === 0 ? "Đi" : "Về"}</span>
                        <span className="font-bold text-[#5a749b]">
                          {f.flight_number || "SK-888"}
                        </span>
                      </div>

                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-left">
                          <span className="block text-lg font-black leading-tight text-[#092152]">
                            {f.departure_airport?.code || "—"}
                          </span>
                          <span className="text-[10px] font-bold text-[#5a749b]">
                            {getCity(f.departure_airport)}
                          </span>
                        </div>

                        <div className="flex flex-col items-center px-2">
                          <AirplaneTilt
                            size={18}
                            weight="fill"
                            className={`text-blue-600 ${idx === 1 ? "rotate-180 text-orange-500" : ""}`}
                          />
                          <span className="text-[9px] font-extrabold tracking-wider text-slate-400">
                            SKYLINK
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="block text-lg font-black leading-tight text-[#092152]">
                            {f.arrival_airport?.code || "—"}
                          </span>
                          <span className="text-[10px] font-bold text-[#5a749b]">
                            {getCity(f.arrival_airport)}
                          </span>
                        </div>
                      </div>

                      <p className="text-center text-[11px] font-bold text-[#47628a]" style={{ margin: 0 }}>
                        {formatDate(f.departure_time)} • {formatTime(f.departure_time)}
                        {legSeats.length > 0 && (
                          <span className="ml-1.5 text-[#0b4fd0]">
                            • Ghế: {legSeats.map((s) => s.seat_number).join(", ")}
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Itemized Price Breakdown */}
              <div className="space-y-2 border-b border-blue-50 pb-4 text-xs">
                <div className="flex items-center justify-between font-semibold text-[#47628a]">
                  <span>Giá vé ({totalPassengers} khách)</span>
                  <strong className="text-[#092152]">
                    {currency.format(basePrice)}
                  </strong>
                </div>

                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between font-semibold text-[#47628a]"
                  >
                    <span className="flex items-center gap-1">
                      <Sparkle size={12} weight="fill" className="text-blue-600" />
                      {s.name}
                    </span>
                    <strong className="text-[#092152]">
                      +{currency.format(Number(s.price || 0))}
                    </strong>
                  </div>
                ))}

                <div className="flex items-center justify-between font-semibold text-[#47628a]">
                  <span>Thuế, phí sân bay & hệ thống</span>
                  <strong className="text-[#092152]">
                    {currency.format(taxAmount)}
                  </strong>
                </div>
              </div>

              {/* Total Box */}
              <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-[#eef6ff] p-4">
                <div>
                  <span className="block text-xs font-black uppercase tracking-wider text-[#092152]">
                    Tổng thanh toán
                  </span>
                  <span className="text-[10px] font-semibold text-[#5a749b]">
                    Đã bao gồm VAT & phí
                  </span>
                </div>
                <span className="text-2xl font-black tracking-tight text-[#0b4fd0]">
                  {currency.format(totalAmount)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 py-3.5 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                    borderRadius: 9999,
                    border: "none",
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  <span>
                    {loading ? "Đang xử lý giao dịch..." : "Xác nhận & Thanh toán"}
                  </span>
                  {!loading && <ArrowRight size={15} weight="bold" />}
                </button>

                <button
                  type="button"
                  onClick={handleHoldBooking}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 py-3 text-xs font-extrabold text-[#163d7a] transition hover:bg-blue-50 disabled:opacity-50"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cde0fc",
                    borderRadius: 9999,
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  <Clock size={14} weight="bold" className="text-blue-600" />
                  <span>Đặt giữ chỗ (Thanh toán sau)</span>
                </button>
              </div>

              <p className="text-center text-[10px] font-semibold leading-relaxed text-slate-400" style={{ margin: 0 }}>
                🔒 Bằng việc tiếp tục, bạn đồng ý với Điều khoản vận chuyển & Chính sách bảo mật của
                SkyLink Airlines.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

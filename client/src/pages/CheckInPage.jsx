import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  PaperPlaneTilt,
  AirplaneTilt,
  ArrowLeft,
  Ticket,
  User,
  ShieldCheck,
  ArrowRight,
  WarningCircle,
  Clock,
  Headset,
  ArrowUpRight,
  Printer,
  PlusCircle,
  CheckCircle,
  CaretRight,
  X,
  EnvelopeSimple,
  Fire,
  BatteryWarning,
  Scissors,
  Flask,
  Prohibit,
  SuitcaseRolling,
  IdentificationCard,
  Sparkle,
} from "@phosphor-icons/react";
import BoardingPassDisplay from "../components/BoardingPassDisplay";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CheckInPage.css";

const HERO_CHECKIN_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const PROHIBITED_ITEMS = [
  {
    icon: Fire,
    color: "#dc2626",
    bg: "#fef2f2",
    text: "Chất nổ, pháo hoa, khí gas hoặc vật phẩm dễ cháy nổ",
  },
  {
    icon: BatteryWarning,
    color: "#059669",
    bg: "#ecfdf5",
    text: "Pin dự phòng công suất lớn trên 160Wh (pin ≤ 100Wh chỉ được mang xách tay)",
  },
  {
    icon: Scissors,
    color: "#0b57d0",
    bg: "#eff6ff",
    text: "Dao, kéo, lưỡi cạo hoặc các dụng cụ sắc nhọn trong hành lý xách tay",
  },
  {
    icon: Flask,
    color: "#7c3aed",
    bg: "#f5f3ff",
    text: "Hóa chất ăn mòn, axit, chất độc hại hoặc chất phóng xạ",
  },
  {
    icon: Prohibit,
    color: "#d97706",
    bg: "#fffbeb",
    text: "Vũ khí, vật phẩm mô phỏng vũ khí hoặc công cụ hỗ trợ bị cấm bay",
  },
];

/**
 * CheckInPage Component
 *
 * Trang Check-in điện tử chuẩn 5 sao SkyLink Airlines (Form + Chọn nhanh PNR + Thẻ lên máy bay)
 */
export default function CheckInPage() {
  const [searchParams] = useSearchParams();

  // State quản lý dữ liệu form
  const [pnrCode, setPnrCode] = useState("");
  const [passengerName, setPassengerName] = useState("");

  // Tự động lấy email từ user đang đăng nhập
  const [email, setEmail] = useState(() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user)?.email || "" : "";
    } catch {
      return "";
    }
  });

  // Danh sách vé đã thanh toán sắp khởi hành của user (để chọn nhanh 1 click)
  const [eligibleBookings, setEligibleBookings] = useState([]);

  // Auto fill form fields from query params when page loads
  useEffect(() => {
    const pnr = searchParams.get("pnr");
    const name = searchParams.get("name");
    const mail = searchParams.get("email");
    if (pnr) setPnrCode(pnr.toUpperCase());
    if (name) setPassengerName(name);
    if (mail) setEmail(mail);
  }, [searchParams]);

  // Tải nhanh các đặt chỗ đã thanh toán nếu người dùng đã đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) return;

    let cancelled = false;
    axios
      .get("/api/bookings", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        const paidUpcoming = list
          .filter((b) => (b.status || "").toLowerCase() === "paid" && b.pnr_code)
          .slice(0, 4);
        setEligibleBookings(paidUpcoming);
      })
      .catch(() => {
        // Bỏ qua nếu chưa đăng nhập hoặc lỗi mạng
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [safetyCommitment, setSafetyCommitment] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // State quản lý trạng thái xử lý
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [boardingPass, setBoardingPass] = useState(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);

  const handleQuickFill = (booking) => {
    setPnrCode((booking.pnr_code || "").toUpperCase());
    const firstPassenger =
      booking.tickets?.[0]?.passenger_name || booking.passenger_name || "";
    if (firstPassenger) {
      setPassengerName(firstPassenger);
    }
    setError("");
  };

  /**
   * Xử lý sự kiện Check-in
   */
  const handleCheckIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!pnrCode.trim()) {
      setError("Vui lòng nhập mã đặt chỗ (PNR).");
      return;
    }

    if (!passengerName.trim()) {
      setError("Vui lòng nhập họ và tên hành khách.");
      return;
    }

    if (!safetyCommitment) {
      setError("Vui lòng xác nhận cam kết an toàn bay.");
      return;
    }

    if (!termsAgreed) {
      setError("Vui lòng đồng ý với các điều khoản và điều kiện Check-in trực tuyến.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        "/api/check-in",
        {
          pnr_code: pnrCode.trim().toUpperCase(),
          passenger_name: passengerName.trim(),
          email: email.trim() || undefined,
        },
        { headers }
      );

      if (response.data.status === "success") {
        setBoardingPass(response.data.data);
        setShowSuccessBanner(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Không thể thực hiện Check-in. Vui lòng kiểm tra lại Mã PNR và Họ tên hành khách."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAgain = () => {
    window.print();
  };

  const handleCheckInAnother = () => {
    setBoardingPass(null);
    setPnrCode("");
    setPassengerName("");
    setSafetyCommitment(false);
    setTermsAgreed(false);
    setError("");
  };

  // ─── GIAO DIỆN KHI ĐÃ CHECK-IN THÀNH CÔNG (THẺ LÊN MÁY BAY) ──────────────
  if (boardingPass) {
    const isRetrieved = Boolean(boardingPass.already_checked_in);
    return (
      <div
        className="flex min-h-[100dvh] flex-col font-sans text-[#0b1f44] selection:bg-blue-600 selection:text-white"
        style={{ background: "linear-gradient(180deg, #b8dafc 0%, #d8ecff 32%, #eef6ff 100%)" }}
      >
        <Navbar />

        <main className="relative flex-1 overflow-hidden pb-16 pt-24">
          {/* Hero Sky Background */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{ height: 340, overflow: "hidden" }}
          >
            <img
              src={HERO_CHECKIN_BG_URL}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 32%", opacity: 0.42 }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(169,211,252,0.45) 0%, rgba(216,236,255,0.82) 68%, #eef6ff 100%)",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-[1000px] space-y-4 px-4 sm:px-6">
            {/* Compact Bilingual Success / Retrieved Notification Banner */}
            {showSuccessBanner && (
              <div
                className="flex items-center justify-between gap-3 px-5 py-3.5 text-white shadow-md"
                style={{
                  background: "linear-gradient(95deg, #059669 0%, #0d9488 100%)",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-xs">
                    <CheckCircle size={24} weight="fill" />
                  </div>
                  <div>
                    <h2
                      className="font-black tracking-tight text-white"
                      style={{ margin: 0, fontSize: 16.5, lineHeight: 1.25 }}
                    >
                      {isRetrieved
                        ? "Boarding Pass Retrieved · Đã tải lại Thẻ lên máy bay!"
                        : "Online Check-in Successful · Check-in trực tuyến thành công!"}
                    </h2>
                    <p
                      className="text-xs font-medium text-emerald-50"
                      style={{ margin: "2px 0 0 0" }}
                    >
                      {isRetrieved
                        ? "Save the QR code below or print your boarding pass for airport security."
                        : "Electronic Boarding Pass issued • Có mặt tại cửa lên tàu trước 30–40 phút (Bag Drop trước 60 phút)."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSuccessBanner(false)}
                  className="shrink-0 cursor-pointer rounded-xl p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                  style={{ background: "transparent", border: "none" }}
                  title="Close"
                  aria-label="Close notification"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            )}

            {/* Boarding Pass Card */}
            <BoardingPassDisplay boardingPass={boardingPass} />

            {/* Action Buttons Below Card */}
            <div className="no-print flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handlePrintAgain}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-extrabold text-white shadow-md transition hover:brightness-105"
                style={{
                  background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 20px rgba(29, 78, 216, 0.28)",
                }}
              >
                <Printer size={16} weight="bold" />
                <span>Print Boarding Pass · In thẻ (PDF)</span>
                <CaretRight size={14} weight="bold" />
              </button>

              <button
                type="button"
                onClick={handleCheckInAnother}
                className="inline-flex items-center justify-center gap-1.5 bg-white px-5 py-3 text-xs font-extrabold text-[#0b4fd0] shadow-xs transition hover:bg-blue-50"
                style={{
                  borderRadius: 9999,
                  border: "1.5px solid #c6defd",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <PlusCircle size={16} weight="bold" />
                <span>Check-in Another · Khách khác</span>
              </button>

              <Link
                to="/my-bookings"
                className="inline-flex items-center justify-center gap-1.5 bg-white/95 px-5 py-3 text-xs font-extrabold text-[#163d7a] transition hover:bg-white"
                style={{
                  borderRadius: 9999,
                  border: "1.5px solid #d5e6fc",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span>My Bookings · Chuyến bay của tôi</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ─── GIAO DIỆN FORM CHECK-IN TRỰC TUYẾN 5 SAO ─────────────────────────────
  return (
    <div
      className="flex min-h-[100dvh] flex-col font-sans text-[#0b1f44] selection:bg-blue-600 selection:text-white"
      style={{ background: "linear-gradient(180deg, #b8dafc 0%, #d8ecff 32%, #eef6ff 100%)" }}
    >
      <Navbar />

      <main className="relative flex-1 overflow-hidden pb-16 pt-24">
        {/* Hero Sky Background */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: 340, overflow: "hidden" }}
        >
          <img
            src={HERO_CHECKIN_BG_URL}
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

        <div className="relative z-10 mx-auto max-w-[1140px] px-4 sm:px-6">
          {/* Hero Header */}
          <header className="mb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-white/95 px-4 py-1.5 text-xs font-extrabold text-[#163d7a] shadow-sm transition hover:bg-white"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", textDecoration: "none" }}
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Back to Home · Trang chủ</span>
              </Link>

              <Link
                to="/my-bookings"
                className="inline-flex items-center gap-1.5 bg-white/95 px-4 py-1.5 text-xs font-extrabold text-[#0b4fd0] shadow-sm transition hover:bg-blue-50"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc", textDecoration: "none" }}
              >
                <span>My Bookings · Chuyến bay của tôi</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em]"
                  style={{ color: "#0b57d0", margin: "0 0 3px 0" }}
                >
                  <PaperPlaneTilt size={15} weight="fill" />
                  SKYLINK AIRLINES • ONLINE CHECK-IN · LÀM THỦ TỤC TRỰC TUYẾN
                </p>
                <h1
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(1.8rem, 3.2vw, 2.45rem)",
                    color: "#091e47",
                    lineHeight: 1.12,
                    margin: "0 0 5px 0",
                  }}
                >
                  Check-in Điện Tử SkyLink Airlines
                </h1>
                <p
                  className="max-w-2xl text-xs font-semibold text-[#2d4b7a] sm:text-sm"
                  style={{ margin: 0 }}
                >
                  Check in online <strong>24h to 60 min</strong> before departure • Nhận Thẻ lên máy bay điện tử (QR) ngay lập tức.
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 bg-white/95 px-4 py-2 shadow-sm"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
              >
                <Sparkle size={16} className="text-blue-600" weight="fill" />
                <span className="text-xs font-bold text-[#163d7a]" style={{ whiteSpace: "nowrap" }}>
                  Open · Mở cửa: <strong className="font-black text-[#0b4fd0]">24h – 1h before flight</strong>
                </span>
              </div>
            </div>
          </header>

          {/* Compact 3-Step Visual Strip */}
          <div
            className="mb-5 grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-3"
            style={{
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid #dbe7fb",
              boxShadow: "0 10px 26px rgba(18, 60, 130, 0.07)",
              borderRadius: 20,
            }}
          >
            {[
              { step: "01", title: "PNR & Passenger Name", desc: "Nhập mã đặt chỗ hoặc chọn nhanh" },
              { step: "02", title: "IATA Safety Declaration", desc: "Xác nhận cam kết an toàn bay" },
              { step: "03", title: "QR Boarding Pass", desc: "Tải PDF hoặc quét mã tại sân bay" },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-3 rounded-2xl bg-[#f4f8ff] px-3.5 py-2.5"
                style={{ border: "1px solid #e4efff" }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-xs font-black text-white"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                    borderRadius: 9999,
                  }}
                >
                  {item.step}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-[#091e47]" style={{ margin: 0 }}>
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] font-semibold text-[#476494]" style={{ margin: "1px 0 0 0" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 2-Column Main Content */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left Column (8 cols): Main Check-in Form Card with Royal-Blue Header */}
            <div
              className="overflow-hidden bg-white lg:col-span-8"
              style={{
                borderRadius: 24,
                border: "1px solid #dbe7fb",
                boxShadow: "0 14px 36px rgba(13, 62, 145, 0.09)",
              }}
            >
              {/* Deep Royal-Blue Header synced with /services & /checkout */}
              <div
                className="flex items-center justify-between gap-3 px-6 py-4 text-white"
                style={{
                  background: "linear-gradient(135deg, #0a3b8e 0%, #1d64f2 100%)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <Ticket size={20} weight="fill" />
                  </span>
                  <div>
                    <h2
                      className="font-black text-white"
                      style={{ margin: 0, fontSize: 16, lineHeight: 1.2 }}
                    >
                      Passenger &amp; Booking Info · Thông tin Check-in
                    </h2>
                    <p
                      className="text-[11.5px] font-medium text-sky-100"
                      style={{ margin: "2px 0 0 0" }}
                    >
                      Enter your PNR code and full name exactly as shown on your e-ticket
                    </p>
                  </div>
                </div>
              </div>

              <form className="space-y-5 p-6" onSubmit={handleCheckIn}>
                {/* Quick-Select Paid Bookings (if logged in & has bookings) */}
                {eligibleBookings.length > 0 && (
                  <div
                    className="rounded-2xl p-3.5"
                    style={{ background: "#f4f8ff", border: "1px solid #dce8fa" }}
                  >
                    <p
                      className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#0b4fd0]"
                      style={{ margin: "0 0 8px 0" }}
                    >
                      <AirplaneTilt size={14} weight="fill" />
                      Quick Fill · Chọn nhanh chuyến bay đã thanh toán
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {eligibleBookings.map((b) => {
                        const dep = b.flight?.departure_airport?.code || "SGN";
                        const arr = b.flight?.arrival_airport?.code || "HAN";
                        const rawName = (b.tickets?.[0]?.passenger_name || "").trim();
                        const depDateShort = b.flight?.departure_time
                          ? new Date(String(b.flight.departure_time).replace(" ", "T")).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "";
                        const extraLabel = rawName.length >= 3 ? rawName : depDateShort;
                        const isSelected = pnrCode === (b.pnr_code || "").toUpperCase();
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleQuickFill(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold transition"
                            style={{
                              borderRadius: 9999,
                              background: isSelected
                                ? "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)"
                                : "#ffffff",
                              color: isSelected ? "#ffffff" : "#123975",
                              border: isSelected ? "1px solid #0b5ed7" : "1px solid #c6defd",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span className="font-mono font-black">{b.pnr_code}</span>
                            <span>
                              ({dep} → {arr})
                            </span>
                            {extraLabel && (
                              <span className="opacity-80">• {extraLabel}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700">
                    <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-red-500" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Input Row: PNR & Passenger Name */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Input 1: Mã Đặt Chỗ (PNR) */}
                  <div>
                    <label
                      htmlFor="pnr-code"
                      className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#163d7a]"
                      style={{ display: "block" }}
                    >
                      Booking Ref (PNR) · Mã đặt chỗ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl border border-blue-100 bg-[#f4f8ff] text-[#0b5ed7]">
                        <Ticket size={16} weight="bold" />
                      </div>
                      <input
                        id="pnr-code"
                        type="text"
                        placeholder="e.g. 48N1IT"
                        value={pnrCode}
                        onChange={(e) => setPnrCode(e.target.value.toUpperCase())}
                        maxLength={12}
                        disabled={loading}
                        className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pr-3.5 font-mono text-sm font-black tracking-wider text-[#091e47] placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        style={{ paddingLeft: 50 }}
                        required
                      />
                    </div>
                    <p className="mt-1 pl-1 text-[11px] font-medium text-slate-500" style={{ margin: "4px 0 0 0" }}>
                      6–12 character code on your e-ticket
                    </p>
                  </div>

                  {/* Input 2: Họ Và Tên */}
                  <div>
                    <label
                      htmlFor="passenger-name"
                      className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#163d7a]"
                      style={{ display: "block" }}
                    >
                      Passenger Name · Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl border border-blue-100 bg-[#f4f8ff] text-[#0b5ed7]">
                        <User size={16} weight="bold" />
                      </div>
                      <input
                        id="passenger-name"
                        type="text"
                        placeholder="e.g. NGUYEN VAN A"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pr-3.5 text-sm font-bold text-[#091e47] placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        style={{ paddingLeft: 50 }}
                        required
                      />
                    </div>
                    <p className="mt-1 pl-1 text-[11px] font-medium text-slate-500" style={{ margin: "4px 0 0 0" }}>
                      Must match ID / Passport used at booking
                    </p>
                  </div>
                </div>

                {/* Input 3: Email nhận vé */}
                <div>
                  <label
                    htmlFor="checkin-email"
                    className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#163d7a]"
                    style={{ display: "block" }}
                  >
                    Boarding Pass Email · Email nhận vé (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl border border-blue-100 bg-[#f4f8ff] text-[#0b5ed7]">
                      <EnvelopeSimple size={16} weight="bold" />
                    </div>
                    <input
                      id="checkin-email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pr-3.5 text-sm font-semibold text-[#091e47] placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      style={{ paddingLeft: 50 }}
                    />
                  </div>
                </div>

                {/* Box 1: Cam Kết An Toàn Bay */}
                <div
                  className="space-y-3 rounded-2xl p-4 sm:p-5"
                  style={{ background: "#f4f8ff", border: "1px solid #dce8fa" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
                      style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)" }}
                    >
                      <ShieldCheck size={18} weight="fill" />
                    </div>
                    <div>
                      <h3
                        className="font-black text-[#091e47]"
                        style={{ margin: 0, fontSize: 14, lineHeight: 1.25 }}
                      >
                        IATA / ICAO Safety Declaration · Cam Kết An Toàn Bay
                      </h3>
                      <p className="text-[11.5px] font-medium text-[#476494]" style={{ margin: "2px 0 0 0" }}>
                        Confirm your baggage does not contain any prohibited items below:
                      </p>
                    </div>
                  </div>

                  <ul
                    className="space-y-2 text-xs font-semibold text-[#1e3a6b]"
                    style={{ margin: 0, padding: 0, listStyle: "none" }}
                  >
                    {PROHIBITED_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.text} className="flex items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: item.bg, color: item.color }}
                          >
                            <Icon size={14} weight="fill" />
                          </span>
                          <span>{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <label
                    htmlFor="safety-commitment"
                    className="cursor-pointer gap-2.5 border-t border-blue-200/70 pt-3"
                    style={{ display: "flex", alignItems: "flex-start", marginBottom: 0 }}
                  >
                    <input
                      id="safety-commitment"
                      type="checkbox"
                      checked={safetyCommitment}
                      onChange={(e) => setSafetyCommitment(e.target.checked)}
                      disabled={loading}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-blue-600"
                      required
                    />
                    <span className="text-xs font-bold leading-relaxed text-[#091e47]">
                      Tôi xác nhận không mang theo các vật phẩm cấm và tuân thủ quy định an toàn hàng không IATA.
                    </span>
                  </label>
                </div>

                {/* Box 2: Điều khoản & Điều kiện */}
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ background: "#f8fbff", border: "1px solid #dce8fa" }}
                >
                  <label
                    htmlFor="terms-agreed"
                    className="cursor-pointer gap-2.5"
                    style={{ display: "flex", alignItems: "center", marginBottom: 0 }}
                  >
                    <input
                      id="terms-agreed"
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-blue-600"
                      required
                    />
                    <span className="text-xs font-bold text-[#163d7a]">
                      I agree to SkyLink{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="inline-flex cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 font-black text-blue-600 underline hover:text-blue-800"
                      >
                        Online Check-in Terms · Điều khoản Check-in <ArrowUpRight size={13} weight="bold" />
                      </button>
                    </span>
                  </label>
                </div>

                {/* Submit Button (Clean 46px Pill CTA synced with /checkout & /services) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%)",
                    borderRadius: 9999,
                    border: "none",
                    cursor: loading ? "wait" : "pointer",
                    boxShadow: "0 8px 20px rgba(29, 78, 216, 0.28)",
                  }}
                >
                  <PaperPlaneTilt size={18} weight="fill" />
                  <span>
                    {loading ? "Processing Check-in..." : "Confirm Check-in · Xác nhận Check-in Ngay"}
                  </span>
                  <ArrowRight size={16} weight="bold" />
                </button>
              </form>
            </div>

            {/* Right Column (4 cols): Real-world Airport Check-in Guide */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
              {/* Card 1: Key Deadlines */}
              <div
                className="bg-white p-5"
                style={{
                  borderRadius: 22,
                  border: "1px solid #dbe7fb",
                  boxShadow: "0 10px 26px rgba(18, 60, 130, 0.07)",
                }}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b5ed7]">
                    <Clock size={18} weight="bold" />
                  </div>
                  <h3
                    className="font-black text-[#091e47]"
                    style={{ margin: 0, fontSize: 14.5, lineHeight: 1.25 }}
                  >
                    Key Deadlines · Mốc thời gian
                  </h3>
                </div>
                <div className="space-y-2 text-xs font-semibold text-[#33507f]">
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-[#f4f8ff] px-3 py-2.5">
                    <span>Mở Check-in (Opens)</span>
                    <strong className="shrink-0 font-black text-[#0b5ed7]" style={{ whiteSpace: "nowrap" }}>
                      24h before
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-[#f4f8ff] px-3 py-2.5">
                    <span>Đóng Check-in (Closes)</span>
                    <strong className="shrink-0 font-black text-[#0b5ed7]" style={{ whiteSpace: "nowrap" }}>
                      60m before
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-[#fff7ed] px-3 py-2.5 text-amber-900">
                    <span>Đóng cửa tàu (Gate)</span>
                    <strong className="shrink-0 font-black text-amber-700" style={{ whiteSpace: "nowrap" }}>
                      15m before
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card 2: At the Airport */}
              <div
                className="bg-white p-5"
                style={{
                  borderRadius: 22,
                  border: "1px solid #dbe7fb",
                  boxShadow: "0 10px 26px rgba(18, 60, 130, 0.07)",
                }}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <SuitcaseRolling size={18} weight="bold" />
                  </div>
                  <h3
                    className="font-black text-[#091e47]"
                    style={{ margin: 0, fontSize: 14.5, lineHeight: 1.25 }}
                  >
                    At the Airport · Khi đến sân bay
                  </h3>
                </div>
                <ul
                  className="space-y-2.5 text-xs font-medium leading-relaxed text-[#33507f]"
                  style={{ margin: 0, padding: 0, listStyle: "none" }}
                >
                  <li className="flex items-start gap-2">
                    <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>
                      <strong>Carry-on only:</strong> Đi thẳng tới cổng an ninh và có mặt tại cửa ra tàu bay trước <strong>30–40 phút</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
                    <span>
                      <strong>Checked baggage:</strong> Gửi hành lý tại quầy <strong>Bag Drop</strong> trước giờ bay <strong>60–90 phút</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IdentificationCard size={15} weight="fill" className="mt-0.5 shrink-0 text-amber-600" />
                    <span>
                      <strong>ID / Passport:</strong> Mang CCCD gốc / VNeID mức 2 (nội địa) hoặc Hộ chiếu còn hạn ≥ 6 tháng (quốc tế).
                    </span>
                  </li>
                </ul>
              </div>

              {/* Card 3: 24/7 Support */}
              <div
                className="p-5 text-white"
                style={{
                  background: "linear-gradient(135deg, #0a3b8e 0%, #1d64f2 100%)",
                  borderRadius: 22,
                  boxShadow: "0 14px 30px rgba(13, 97, 225, 0.22)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Headset size={20} weight="fill" className="shrink-0 text-sky-200" />
                  <h3
                    className="font-black text-white"
                    style={{ margin: 0, fontSize: 14.5, lineHeight: 1.25 }}
                  >
                    Need Help? · Hỗ trợ 24/7
                  </h3>
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed text-blue-100" style={{ margin: "8px 0 0 0" }}>
                  Forgot your PNR code or traveling with infants? Đội ngũ SkyLink 24/7 luôn sẵn sàng hỗ trợ bạn.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/my-bookings"
                    className="inline-flex items-center gap-1 bg-white px-3.5 py-2 text-xs font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                    style={{ borderRadius: 9999, textDecoration: "none" }}
                  >
                    Find PNR · Tra cứu PNR
                  </Link>
                  <Link
                    to="/support"
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-white/20"
                    style={{
                      borderRadius: 9999,
                      border: "1px solid rgba(255,255,255,0.4)",
                      textDecoration: "none",
                    }}
                  >
                    Contact 24/7
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Modal Điều khoản Check-in trực tuyến */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkin-terms-title"
        >
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={20} weight="fill" />
                </div>
                <h3 id="checkin-terms-title" className="text-base font-black text-[#091e47]">
                  Điều khoản Check-in trực tuyến SkyLink
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="cursor-pointer rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
              <p>
                <strong>1. Thời gian làm thủ tục:</strong> Mở từ <strong>24 giờ</strong> và đóng{" "}
                <strong>60 phút</strong> trước giờ khởi hành dự kiến.
              </p>
              <p>
                <strong>2. Giấy tờ tùy thân:</strong> Hành khách bắt buộc mang theo bản gốc CCCD /
                tài khoản VNeID định danh mức 2 (chuyến nội địa) hoặc Hộ chiếu hợp lệ kèm thị thực
                nếu có (chuyến quốc tế).
              </p>
              <p>
                <strong>3. Hành lý &amp; Cửa lên tàu:</strong> Hành khách có hành lý ký gửi cần hoàn
                tất gửi đồ tại quầy Bag Drop tối thiểu <strong>60 phút</strong> trước giờ bay. Cửa
                lên tàu (Boarding Gate) đóng trước giờ khởi hành <strong>15 phút</strong>.
              </p>
              <p>
                <strong>4. Trường hợp cần làm thủ tục tại quầy:</strong> Hành khách đi cùng em bé
                dưới 2 tuổi, phụ nữ mang thai hoặc cần dịch vụ xe lăn vui lòng làm thủ tục trực tiếp
                tại quầy sân bay để được ưu tiên hỗ trợ.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setTermsAgreed(true);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2.5 text-xs font-extrabold text-white transition hover:brightness-105"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Tôi đã hiểu &amp; Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

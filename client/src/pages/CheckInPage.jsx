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

          <div className="relative z-10 mx-auto max-w-[1000px] space-y-6 px-4 sm:px-6">
            {/* Success / Retrieved Notification Banner */}
            {showSuccessBanner && (
              <div
                className="flex items-start justify-between gap-4 p-5 text-white shadow-lg md:p-6"
                style={{
                  background: "linear-gradient(95deg, #059669 0%, #0d9488 100%)",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                    <CheckCircle size={28} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight md:text-2xl">
                      {isRetrieved
                        ? "Đã tải lại Thẻ lên máy bay của bạn!"
                        : "Check-in trực tuyến thành công!"}
                    </h2>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-emerald-50 md:text-sm">
                      {isRetrieved
                        ? "Hành khách đã hoàn tất Check-in trước đó. Bạn có thể lưu lại mã QR hoặc in lại thẻ lên máy bay bên dưới."
                        : "Thẻ lên máy bay điện tử đã được phát hành. Nếu chỉ có hành lý xách tay, vui lòng qua thẳng cửa an ninh và có mặt tại cửa lên tàu trước giờ bay 30–40 phút (có hành lý ký gửi: gửi tại quầy Bag Drop trước 60–90 phút)."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSuccessBanner(false)}
                  className="shrink-0 cursor-pointer rounded-xl p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                  title="Đóng thông báo"
                  aria-label="Đóng thông báo"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
            )}

            {/* Boarding Pass Card */}
            <BoardingPassDisplay boardingPass={boardingPass} />

            {/* Action Buttons Below Card */}
            <div className="no-print flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintAgain}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-105 md:text-base"
                style={{
                  background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(13, 97, 225, 0.28)",
                }}
              >
                <Printer size={20} weight="bold" />
                <span>In Thẻ Lên Máy Bay / Lưu PDF</span>
                <CaretRight size={16} weight="bold" />
              </button>

              <button
                type="button"
                onClick={handleCheckInAnother}
                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 text-sm font-extrabold text-[#0b4fd0] shadow-xs transition hover:bg-blue-50 md:text-base"
                style={{
                  borderRadius: 9999,
                  border: "1px solid #c6defd",
                  cursor: "pointer",
                }}
              >
                <PlusCircle size={20} weight="bold" />
                <span>Check-in Hành Khách Khác</span>
              </button>

              <Link
                to="/my-bookings"
                className="inline-flex items-center justify-center gap-2 bg-white/90 px-6 py-3.5 text-sm font-extrabold text-[#163d7a] transition hover:bg-white md:text-base"
                style={{
                  borderRadius: 9999,
                  border: "1px solid #d5e6fc",
                  textDecoration: "none",
                }}
              >
                <span>Về Chuyến bay của tôi</span>
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
                  <PaperPlaneTilt size={15} weight="fill" />
                  SKYLINK AIRLINES • ONLINE CHECK-IN
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
                  Check-in Điện Tử SkyLink Airlines
                </h1>
                <p
                  className="max-w-2xl text-xs font-semibold text-[#2d4b7a] sm:text-sm"
                  style={{ margin: 0 }}
                >
                  Làm thủ tục trực tuyến từ <strong>24 giờ đến 60 phút</strong> trước giờ khởi hành,
                  nhận Thẻ lên máy bay điện tử (QR) ngay lập tức hoặc tải lại thẻ đã Check-in.
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 bg-white/95 px-4 py-2.5 shadow-sm"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
              >
                <Sparkle size={16} className="text-blue-600" weight="fill" />
                <span className="text-xs font-bold text-[#163d7a]">
                  Mở cửa: <strong className="font-black text-[#0b4fd0]">24h – 1h trước giờ bay</strong>
                </span>
              </div>
            </div>
          </header>

          {/* 3-Step Visual Strip */}
          <div
            className="mb-6 grid grid-cols-1 gap-3 p-3 sm:grid-cols-3"
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 10px 26px rgba(18, 60, 130, 0.07)",
              borderRadius: 24,
            }}
          >
            {[
              { step: "01", title: "Nhập PNR & Họ tên", desc: "Hoặc chọn nhanh từ vé đã đặt" },
              { step: "02", title: "Cam kết an toàn bay", desc: "Xác nhận quy định hành lý IATA" },
              { step: "03", title: "Nhận Boarding Pass QR", desc: "In PDF hoặc quét mã trên điện thoại" },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-3 rounded-2xl bg-[#f4f9ff] px-4 py-3"
                style={{ border: "1px solid #dcebff" }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-xs font-black text-white"
                  style={{
                    background: "linear-gradient(135deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                  }}
                >
                  {item.step}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-[#091e47]">{item.title}</p>
                  <p className="truncate text-[11px] font-semibold text-[#476494]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 2-Column Main Content */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left Column (8 cols): Main Check-in Form Card */}
            <div
              className="overflow-hidden bg-white lg:col-span-8"
              style={{
                borderRadius: 28,
                border: "1px solid #d5e6fc",
                boxShadow: "0 18px 42px rgba(13, 62, 145, 0.10)",
              }}
            >
              <form className="space-y-6 p-6 md:p-9" onSubmit={handleCheckIn}>
                {/* Quick-Select Paid Bookings (if logged in & has bookings) */}
                {eligibleBookings.length > 0 && (
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "#f2f8ff", border: "1px solid #cde2fd" }}
                  >
                    <p className="mb-2.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0b4fd0]">
                      <AirplaneTilt size={15} weight="fill" />
                      Chọn nhanh từ chuyến bay đã thanh toán của bạn
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {eligibleBookings.map((b) => {
                        const dep = b.flight?.departure_airport?.code || "SGN";
                        const arr = b.flight?.arrival_airport?.code || "HAN";
                        const paxName = b.tickets?.[0]?.passenger_name || "";
                        const isSelected = pnrCode === (b.pnr_code || "").toUpperCase();
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleQuickFill(b)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold transition"
                            style={{
                              borderRadius: 9999,
                              background: isSelected
                                ? "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)"
                                : "#ffffff",
                              color: isSelected ? "#ffffff" : "#123975",
                              border: isSelected ? "1px solid #0b5ed7" : "1px solid #c6defd",
                              cursor: "pointer",
                            }}
                          >
                            <span className="font-mono font-black">{b.pnr_code}</span>
                            <span>
                              ({dep} → {arr})
                            </span>
                            {paxName && <span className="opacity-80">• {paxName}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                    <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-red-500" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Section Title */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center text-white shadow-sm"
                    style={{
                      background: "linear-gradient(135deg, #0b5ed7 0%, #1d75f2 100%)",
                      borderRadius: 9999,
                    }}
                  >
                    <Ticket size={20} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[#091e47]">
                      Thông tin hành khách &amp; Đặt chỗ
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Nhập chính xác mã PNR và họ tên ghi trên vé điện tử
                    </p>
                  </div>
                </div>

                {/* Input Row: PNR & Passenger Name */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Input 1: Mã Đặt Chỗ (PNR) */}
                  <div className="space-y-2">
                    <label
                      htmlFor="pnr-code"
                      className="block text-xs font-extrabold uppercase tracking-wider text-[#163d7a]"
                    >
                      Mã Đặt Chỗ (PNR) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
                        <Ticket size={18} weight="bold" />
                      </div>
                      <input
                        id="pnr-code"
                        type="text"
                        placeholder="Ví dụ: BQCV0E"
                        value={pnrCode}
                        onChange={(e) => setPnrCode(e.target.value.toUpperCase())}
                        maxLength={12}
                        disabled={loading}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-15 pr-4 font-mono text-base font-black uppercase tracking-wider text-[#091e47] placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        style={{ paddingLeft: 56 }}
                        required
                      />
                    </div>
                    <p className="pl-1 text-[11px] font-medium text-slate-500">
                      Mã 6–12 ký tự ghi trên vé hoặc email xác nhận
                    </p>
                  </div>

                  {/* Input 2: Họ Và Tên */}
                  <div className="space-y-2">
                    <label
                      htmlFor="passenger-name"
                      className="block text-xs font-extrabold uppercase tracking-wider text-[#163d7a]"
                    >
                      Họ Và Tên Hành Khách <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
                        <User size={18} weight="bold" />
                      </div>
                      <input
                        id="passenger-name"
                        type="text"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pr-4 text-base font-bold text-[#091e47] placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        style={{ paddingLeft: 56 }}
                        required
                      />
                    </div>
                    <p className="pl-1 text-[11px] font-medium text-slate-500">
                      Trùng khớp với CCCD/Hộ chiếu khi đặt vé
                    </p>
                  </div>
                </div>

                {/* Input 3: Email nhận vé */}
                <div className="space-y-2">
                  <label
                    htmlFor="checkin-email"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[#163d7a]"
                  >
                    Email nhận Thẻ lên máy bay (Tuỳ chọn)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
                      <EnvelopeSimple size={18} weight="bold" />
                    </div>
                    <input
                      id="checkin-email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pr-4 text-base font-semibold text-[#091e47] placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      style={{ paddingLeft: 56 }}
                    />
                  </div>
                  <p className="pl-1 text-[11px] font-medium text-slate-500">
                    Bản sao Thẻ lên máy bay &amp; mã QR sẽ tự động gửi tới email này
                  </p>
                </div>

                {/* Box 1: Cam Kết An Toàn Bay */}
                <div
                  className="space-y-4 rounded-2xl p-5 md:p-6"
                  style={{ background: "#f4f9ff", border: "1px solid #d5e6fc" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                      <ShieldCheck size={20} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#091e47]">
                        Cam Kết An Toàn Bay (Quy định IATA / ICAO)
                      </h3>
                      <p className="text-xs font-medium text-[#476494]">
                        Xác nhận hành lý của bạn không chứa các vật phẩm nguy hiểm sau:
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs font-semibold text-[#1e3a6b] sm:text-sm">
                    {PROHIBITED_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.text} className="flex items-center gap-3">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: item.bg, color: item.color }}
                          >
                            <Icon size={16} weight="fill" />
                          </span>
                          <span>{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <label
                    htmlFor="safety-commitment"
                    className="flex cursor-pointer items-start gap-3 border-t border-blue-200/70 pt-3.5"
                  >
                    <input
                      id="safety-commitment"
                      type="checkbox"
                      checked={safetyCommitment}
                      onChange={(e) => setSafetyCommitment(e.target.checked)}
                      disabled={loading}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <span className="text-xs font-bold leading-relaxed text-[#091e47] sm:text-sm">
                      Tôi xác nhận không mang theo các vật phẩm cấm và cam kết tuân thủ nghiêm quy
                      định an ninh, an toàn hàng không.
                    </span>
                  </label>
                </div>

                {/* Box 2: Điều khoản & Điều kiện */}
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "#f8fbff", border: "1px solid #dcebff" }}
                >
                  <label
                    htmlFor="terms-agreed"
                    className="flex cursor-pointer items-start gap-3 sm:items-center"
                  >
                    <input
                      id="terms-agreed"
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      disabled={loading}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 sm:mt-0"
                      required
                    />
                    <span className="text-xs font-bold text-[#163d7a] sm:text-sm">
                      Tôi đồng ý với{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="inline-flex cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 font-black text-blue-600 underline hover:text-blue-800"
                      >
                        điều khoản Check-in trực tuyến <ArrowUpRight size={14} weight="bold" />
                      </button>{" "}
                      của SkyLink Airlines
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 py-4 text-base font-black text-white shadow-lg transition hover:brightness-105 disabled:opacity-60 md:text-lg"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                    border: "none",
                    cursor: loading ? "wait" : "pointer",
                    boxShadow: "0 12px 28px rgba(13, 97, 225, 0.30)",
                  }}
                >
                  <PaperPlaneTilt size={22} weight="fill" />
                  <span>{loading ? "Đang xác thực & xuất thẻ..." : "Xác nhận Check-in Ngay"}</span>
                  <ArrowRight size={20} weight="bold" />
                </button>
              </form>
            </div>

            {/* Right Column (4 cols): Real-world Airport Check-in Guide */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
              {/* Card 1: Khung giờ tiêu chuẩn */}
              <div
                className="bg-white p-5"
                style={{
                  borderRadius: 24,
                  border: "1px solid #d5e6fc",
                  boxShadow: "0 12px 28px rgba(18, 60, 130, 0.07)",
                }}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock size={20} weight="bold" />
                  </div>
                  <h3 className="text-sm font-black text-[#091e47]">Mốc thời gian cần nhớ</h3>
                </div>
                <div className="space-y-2.5 text-xs font-semibold text-[#33507f]">
                  <div className="flex items-center justify-between rounded-xl bg-[#f4f9ff] px-3.5 py-2.5">
                    <span>Mở Check-in trực tuyến</span>
                    <strong className="font-black text-[#0b4fd0]">Trước 24 giờ</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#f4f9ff] px-3.5 py-2.5">
                    <span>Đóng Check-in trực tuyến</span>
                    <strong className="font-black text-[#0b4fd0]">Trước 60 phút</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#fff7ed] px-3.5 py-2.5 text-amber-900">
                    <span>Đóng cửa lên máy bay</span>
                    <strong className="font-black text-amber-700">Trước 15 phút</strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Hướng dẫn tại sân bay */}
              <div
                className="bg-white p-5"
                style={{
                  borderRadius: 24,
                  border: "1px solid #d5e6fc",
                  boxShadow: "0 12px 28px rgba(18, 60, 130, 0.07)",
                }}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <SuitcaseRolling size={20} weight="bold" />
                  </div>
                  <h3 className="text-sm font-black text-[#091e47]">Khi đến sân bay</h3>
                </div>
                <ul className="space-y-3 text-xs font-medium leading-relaxed text-[#33507f]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>
                      <strong>Chỉ có hành lý xách tay:</strong> Đi thẳng tới cửa kiểm tra an ninh và
                      có mặt tại cửa lên tàu trước giờ bay <strong>30–40 phút</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
                    <span>
                      <strong>Có hành lý ký gửi:</strong> Gửi hành lý tại quầy{" "}
                      <strong>Bag Drop</strong> của SkyLink trước giờ bay <strong>60–90 phút</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <IdentificationCard size={16} weight="fill" className="mt-0.5 shrink-0 text-amber-600" />
                    <span>
                      <strong>Giấy tờ tùy thân:</strong> Mang theo CCCD bản gốc / VNeID mức 2 (bay
                      nội địa) hoặc Hộ chiếu còn hạn ≥ 6 tháng (bay quốc tế).
                    </span>
                  </li>
                </ul>
              </div>

              {/* Card 3: Hỗ trợ nhanh */}
              <div
                className="p-5 text-white"
                style={{
                  background: "linear-gradient(135deg, #0b4fd0 0%, #1d75f2 100%)",
                  borderRadius: 24,
                  boxShadow: "0 14px 30px rgba(13, 97, 225, 0.22)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Headset size={22} weight="fill" className="text-sky-200" />
                  <h3 className="text-sm font-black">Cần hỗ trợ làm thủ tục?</h3>
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed text-blue-100">
                  Quên mã đặt chỗ (PNR) hoặc đi cùng trẻ nhỏ, hành khách cần hỗ trợ đặc biệt? Đội
                  ngũ SkyLink 24/7 luôn sẵn sàng hỗ trợ.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/my-bookings"
                    className="inline-flex items-center gap-1 bg-white px-3.5 py-2 text-xs font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                    style={{ borderRadius: 9999, textDecoration: "none" }}
                  >
                    Tra cứu PNR
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
                    Liên hệ 24/7
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

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Crown,
  FileText,
  FirstAidKit,
  GlobeHemisphereEast,
  Headset,
  Info,
  ShieldCheck,
  SuitcaseRolling,
  Ticket,
  User,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

const HERO_INSURANCE_BG_URL =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=85";

const INSURANCE_PLANS = {
  domestic: [
    {
      id: "dom-basic",
      name: "SkyCare Cơ Bản",
      tagline: "Bảo vệ thiết yếu cho chuyến bay nội địa",
      price: 99000,
      maxCoverage: "200.000.000 ₫",
      badge: "Tiết kiệm",
      badgeBg: "#e0f2fe",
      badgeColor: "#0369a1",
      popular: false,
      highlights: [
        "Trễ chuyến bay từ 4 giờ: bồi thường đến 1.500.000 ₫",
        "Thất lạc / hư hỏng hành lý ký gửi: đến 5.000.000 ₫",
        "Tai nạn cá nhân trên chuyến bay: đến 200.000.000 ₫",
        "Cấp Giấy chứng nhận bảo hiểm điện tử ngay qua Email",
      ],
    },
    {
      id: "dom-plus",
      name: "SkyCare Toàn Diện",
      tagline: "Lựa chọn tối ưu cho gia đình & công tác",
      price: 199000,
      maxCoverage: "500.000.000 ₫",
      badge: "Phổ biến nhất",
      badgeBg: "#0b5ed7",
      badgeColor: "#ffffff",
      popular: true,
      highlights: [
        "Trễ chuyến bay từ 3 giờ: bồi thường tự động đến 4.000.000 ₫",
        "Mất / chậm hành lý ký gửi: đến 15.000.000 ₫",
        "Hủy / hoãn chuyến bay do lý do y tế: hoàn đến 20.000.000 ₫",
        "Tai nạn cá nhân & chi phí y tế nội địa: đến 500.000.000 ₫",
        "Hỗ trợ bồi thường trực tuyến 24/7 trong 48 giờ",
      ],
    },
    {
      id: "dom-vip",
      name: "SkyCare Platinum",
      tagline: "Bảo vệ cao cấp toàn hành trình",
      price: 349000,
      maxCoverage: "1.000.000.000 ₫",
      badge: "Cao cấp",
      badgeBg: "#f3e8ff",
      badgeColor: "#6d28d9",
      popular: false,
      highlights: [
        "Trễ chuyến bay từ 2 giờ: bồi thường đến 8.000.000 ₫",
        "Hành lý, laptop & thiết bị cá nhân: đến 35.000.000 ₫",
        "Hủy chuyến bay vì mọi lý do bất khả kháng: đến 40.000.000 ₫",
        "Tai nạn cá nhân & vận chuyển cấp cứu: đến 1.000.000.000 ₫",
        "Tổng đài y tế & pháp lý ưu tiên 24/7 toàn quốc",
      ],
    },
  ],
  international: [
    {
      id: "intl-standard",
      name: "SkyGlobal Tiêu Chuẩn",
      tagline: "Đáp ứng tiêu chuẩn xin Visa châu Á & quốc tế",
      price: 259000,
      maxCoverage: "1.200.000.000 ₫",
      badge: "Chuẩn Visa",
      badgeBg: "#e0f2fe",
      badgeColor: "#0369a1",
      popular: false,
      highlights: [
        "Chi phí y tế & nằm viện nước ngoài: đến 1.200.000.000 ₫",
        "Trễ chuyến / lỡ chuyến nối chuyến: đến 6.000.000 ₫",
        "Mất hộ chiếu, giấy tờ & hành lý: đến 25.000.000 ₫",
        "Chứng nhận bảo hiểm song ngữ Anh – Việt hợp lệ xin Visa",
      ],
    },
    {
      id: "intl-comprehensive",
      name: "SkyGlobal Toàn Diện",
      tagline: "Đạt chuẩn Visa Schengen / Châu Âu / Úc / Mỹ",
      price: 459000,
      maxCoverage: "2.500.000.000 ₫",
      badge: "Phổ biến nhất",
      badgeBg: "#0b5ed7",
      badgeColor: "#ffffff",
      popular: true,
      highlights: [
        "Y tế & vận chuyển cấp cứu quốc tế: đến 2.500.000.000 ₫",
        "Đạt chuẩn hạn mức tối thiểu €30.000 xin Visa Schengen",
        "Trễ chuyến bay & chậm hành lý quốc tế: đến 12.000.000 ₫",
        "Hủy / rút ngắn chuyến đi quốc tế: đến 60.000.000 ₫",
        "Bảo lãnh viện phí trực tiếp tại hơn 120 quốc gia",
      ],
    },
    {
      id: "intl-vip",
      name: "SkyGlobal VIP Diamond",
      tagline: "Đặc quyền bảo vệ tối đa cho thương gia",
      price: 799000,
      maxCoverage: "5.000.000.000 ₫",
      badge: "Thương gia",
      badgeBg: "#f3e8ff",
      badgeColor: "#6d28d9",
      popular: false,
      highlights: [
        "Hạn mức y tế & tai nạn toàn cầu: đến 5.000.000.000 ₫",
        "Trễ chuyến bay từ 2 giờ: chi trả tự động đến 20.000.000 ₫",
        "Bảo vệ thiết bị công nghệ, hành lý VIP: đến 80.000.000 ₫",
        "Hồi hương y tế bằng chuyên cơ cứu thương 24/7",
        "Tư vấn y bác sĩ & hỗ trợ lãnh sự toàn cầu 24/7",
      ],
    },
  ],
};

const COMPARISON_ROWS = [
  {
    benefit: "Bồi thường trễ chuyến bay",
    basic: "Đến 1.5 – 6 triệu ₫",
    plus: "Đến 4 – 12 triệu ₫",
    vip: "Đến 8 – 20 triệu ₫",
  },
  {
    benefit: "Mất / hư hỏng / chậm hành lý",
    basic: "Đến 5 – 25 triệu ₫",
    plus: "Đến 15 – 40 triệu ₫",
    vip: "Đến 35 – 80 triệu ₫",
  },
  {
    benefit: "Hủy / hoãn chuyến vì lý do y tế",
    basic: "Cơ bản",
    plus: "Đến 20 – 60 triệu ₫",
    vip: "Đến 40 – 100 triệu ₫",
  },
  {
    benefit: "Hỗ trợ cấp cứu & y tế 24/7",
    basic: "Có",
    plus: "Bảo lãnh viện phí",
    vip: "Ưu tiên toàn cầu VIP",
  },
  {
    benefit: "Chứng nhận điện tử (hợp lệ xin Visa)",
    basic: "Cấp ngay sau 1 phút",
    plus: "Song ngữ Anh – Việt",
    vip: "Song ngữ + Xác nhận VIP",
  },
];

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function TravelInsurance() {
  const navigate = useNavigate();
  const [region, setRegion] = useState("domestic"); // domestic | international
  const [tripType, setTripType] = useState("oneway"); // oneway | roundtrip
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [pnrCode, setPnrCode] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [holderName, setHolderName] = useState("");
  const [holderEmail, setHolderEmail] = useState("");
  const [holderPhone, setHolderPhone] = useState("");
  const [certificate, setCertificate] = useState(null);

  const plans = INSURANCE_PLANS[region];
  const tripMultiplier = tripType === "roundtrip" ? 1.8 : 1;

  const getPlanPrice = (plan) => Math.round((plan.price * tripMultiplier) / 1000) * 1000;

  useEffect(() => {
    if (!selectedPlan) return;
    const token =
      localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      setBookings([]);
      return;
    }

    let cancelled = false;
    setLoadingBookings(true);
    api
      .get("/bookings")
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const active = list.filter((b) => b.status !== "cancelled");
        setBookings(active);
        if (active[0]?.pnr_code && !pnrCode) {
          setPnrCode(active[0].pnr_code);
        }
      })
      .catch(() => {
        if (!cancelled) setBookings([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBookings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPlan]);

  const openRegisterModal = (plan) => {
    setSelectedPlan(plan);
    setCertificate(null);
  };

  const handleConfirmInsurance = (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    const unitPrice = getPlanPrice(selectedPlan);
    const totalPrice = unitPrice * passengerCount;
    const certNumber = `SKY-INS-${new Date().getFullYear()}${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const record = {
      certNumber,
      planName: selectedPlan.name,
      region: region === "domestic" ? "Nội địa Việt Nam" : "Quốc tế",
      tripType: tripType === "roundtrip" ? "Khứ hồi" : "Một chiều",
      pnr: pnrCode.trim() || "Mua độc lập",
      passengerCount,
      holderName: holderName.trim(),
      holderEmail: holderEmail.trim(),
      holderPhone: holderPhone.trim(),
      totalPrice,
      maxCoverage: selectedPlan.maxCoverage,
      issuedAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("skylink_travel_insurances") || "[]");
      localStorage.setItem("skylink_travel_insurances", JSON.stringify([record, ...existing]));
    } catch {
      // ignore storage error
    }
    setCertificate(record);
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
          style={{ height: 320 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.84) 46%, rgba(225,241,255,0.22) 100%)",
            }}
          />
          <img
            src={HERO_INSURANCE_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 40%",
              opacity: 0.88,
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

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* TOP HERO HEADER */}
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

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div style={{ maxWidth: 520 }}>
                <p
                  className="text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  SKYLINK CARE • ĐỐI TÁC BẢO HIỂM HÀNG KHÔNG
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(2.05rem, 3.5vw, 2.85rem)",
                    color: "#091e47",
                    lineHeight: 1.12,
                    margin: "0 0 8px 0",
                  }}
                >
                  Bảo Hiểm Du Lịch
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  An tâm trọn vẹn trên mọi hành trình bay – Bồi thường trễ chuyến, thất lạc hành lý
                  & hỗ trợ y tế toàn cầu 24/7.
                </p>
              </div>

              {/* Region & Trip Type Selector Pill Bar */}
              <div
                className="flex flex-wrap items-center gap-2 p-1.5"
                style={{
                  background: "rgba(255, 255, 255, 0.92)",
                  border: "1px solid rgba(255, 255, 255, 0.98)",
                  boxShadow: "0 10px 26px rgba(18, 60, 130, 0.10)",
                  borderRadius: 18,
                }}
              >
                <button
                  type="button"
                  onClick={() => setRegion("domestic")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold transition"
                  style={
                    region === "domestic"
                      ? {
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                          color: "#ffffff",
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                        }
                      : {
                          background: "transparent",
                          color: "#1e3f77",
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                        }
                  }
                >
                  <AirplaneTilt size={15} weight="fill" />
                  Nội địa Việt Nam
                </button>
                <button
                  type="button"
                  onClick={() => setRegion("international")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold transition"
                  style={
                    region === "international"
                      ? {
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                          color: "#ffffff",
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                        }
                      : {
                          background: "transparent",
                          color: "#1e3f77",
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                        }
                  }
                >
                  <GlobeHemisphereEast size={15} weight="fill" />
                  Quốc tế (Chuẩn Visa)
                </button>
              </div>
            </div>
          </header>

          {/* 4 REAL-WORLD TRUST PILLARS + ONE-WAY / ROUND-TRIP SWITCH */}
          <section
            aria-label="Quyền lợi bảo hiểm nổi bật"
            className="mb-7"
            style={{
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
              borderRadius: 20,
              padding: "14px 20px",
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Trip Type Switcher (clean single-line pills) */}
              <div
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#eef5ff] p-1"
                style={{ whiteSpace: "nowrap" }}
              >
                <button
                  type="button"
                  onClick={() => setTripType("oneway")}
                  className="rounded-lg px-3.5 py-2 text-xs font-extrabold transition"
                  style={
                    tripType === "oneway"
                      ? {
                          background: "#ffffff",
                          color: "#0b4fd0",
                          boxShadow: "0 2px 6px rgba(15, 52, 114, 0.12)",
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }
                      : {
                          background: "transparent",
                          color: "#4a658f",
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }
                  }
                >
                  Một chiều
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("roundtrip")}
                  className="rounded-lg px-3.5 py-2 text-xs font-extrabold transition"
                  style={
                    tripType === "roundtrip"
                      ? {
                          background: "#ffffff",
                          color: "#0b4fd0",
                          boxShadow: "0 2px 6px rgba(15, 52, 114, 0.12)",
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }
                      : {
                          background: "transparent",
                          color: "#4a658f",
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }
                  }
                >
                  Khứ hồi (-10%)
                </button>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2.5 lg:border-l lg:border-blue-100 lg:pl-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                  >
                    <Clock size={19} weight="fill" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                      Trễ chuyến bay
                    </p>
                    <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                      Chi trả tự động theo PNR
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 lg:border-l lg:border-blue-100 lg:pl-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                  >
                    <SuitcaseRolling size={19} weight="fill" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                      Bảo vệ hành lý
                    </p>
                    <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                      Thất lạc, chậm & hư hỏng
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 lg:border-l lg:border-blue-100 lg:pl-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                  >
                    <FirstAidKit size={19} weight="fill" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                      Y tế & Cấp cứu 24/7
                    </p>
                    <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                      Bảo lãnh viện phí trực tiếp
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 lg:border-l lg:border-blue-100 lg:pl-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "#ecfdf5", color: "#15803d" }}
                  >
                    <FileText size={19} weight="fill" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                      Cấp đơn trong 1 phút
                    </p>
                    <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                      Chứng nhận điện tử hợp lệ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3-COLUMN INSURANCE PLANS GRID */}
          <section aria-label="Các gói bảo hiểm du lịch">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((plan, index) => {
                const displayPrice = getPlanPrice(plan);
                return (
                  <motion.article
                    key={plan.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1"
                    style={{
                      background: "#ffffff",
                      borderRadius: 24,
                      border: plan.popular
                        ? "2px solid #1d75f2"
                        : "1px solid rgba(255, 255, 255, 0.98)",
                      boxShadow: plan.popular
                        ? "0 18px 40px rgba(13, 94, 215, 0.18)"
                        : "0 14px 34px rgba(21, 64, 138, 0.09)",
                    }}
                  >
                    {/* Card Top Header */}
                    <div
                      className="p-6 pb-5"
                      style={{
                        background: plan.popular
                          ? "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)"
                          : "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
                        borderBottom: "1px solid #ebf2fc",
                      }}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold"
                          style={{
                            background: plan.badgeBg,
                            color: plan.badgeColor,
                            borderRadius: 9999,
                          }}
                        >
                          {plan.popular ? (
                            <Crown size={13} weight="fill" />
                          ) : (
                            <ShieldCheck size={13} weight="fill" />
                          )}
                          {plan.badge}
                        </span>
                        <span className="text-[11px] font-bold text-[#4a658f]">
                          {tripType === "roundtrip" ? "Khứ hồi" : "Một chiều"}
                        </span>
                      </div>

                      <h2
                        className="font-black tracking-tight"
                        style={{ fontSize: "1.32rem", color: "#092152", margin: "0 0 4px 0" }}
                      >
                        {plan.name}
                      </h2>
                      <p className="text-xs font-semibold text-[#556f96]" style={{ margin: "0 0 14px 0" }}>
                        {plan.tagline}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="font-black tracking-tight"
                          style={{ fontSize: "1.75rem", color: "#0b4fd0" }}
                        >
                          {currency.format(displayPrice)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">/ khách</span>
                      </div>

                      {/* Max Coverage Pill */}
                      <div
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold"
                        style={{
                          background: "#eef6ff",
                          color: "#154085",
                          border: "1px solid #d4e6fd",
                        }}
                      >
                        <ShieldCheck size={15} weight="fill" style={{ color: "#0b5ed7" }} />
                        Quyền lợi tối đa: <strong>{plan.maxCoverage}</strong>
                      </div>
                    </div>

                    {/* Benefits List & Action Button */}
                    <div className="flex flex-1 flex-col p-6 pt-5">
                      <ul className="mb-6 space-y-3" style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
                        {plan.highlights.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs font-semibold leading-relaxed text-[#253e6b]"
                          >
                            <CheckCircle
                              size={17}
                              weight="fill"
                              className="mt-0.5 shrink-0"
                              style={{ color: plan.popular ? "#0b5ed7" : "#16a34a" }}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={() => openRegisterModal(plan)}
                        className="mt-auto inline-flex w-full items-center justify-center gap-2 py-3 text-xs font-extrabold transition hover:-translate-y-0.5"
                        style={
                          plan.popular
                            ? {
                                background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                                color: "#ffffff",
                                boxShadow: "0 8px 20px rgba(13, 94, 215, 0.30)",
                                borderRadius: 9999,
                                border: "none",
                                cursor: "pointer",
                              }
                            : {
                                background: "#f2f7ff",
                                color: "#0b4fd0",
                                border: "1.5px solid #bfd7fb",
                                borderRadius: 9999,
                                cursor: "pointer",
                              }
                        }
                      >
                        <span>Đăng ký gói này</span>
                        <ArrowRight size={14} weight="bold" />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* COMPACT REAL-WORLD BENEFITS COMPARISON TABLE */}
          <section
            aria-label="So sánh quyền lợi bảo hiểm"
            className="mt-8 overflow-hidden bg-white/95 shadow-sm"
            style={{
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 12px 30px rgba(21, 64, 138, 0.08)",
            }}
          >
            <div className="border-b border-blue-50 px-6 py-4">
              <h2 className="text-base font-black text-[#092152]" style={{ margin: 0 }}>
                Bảng so sánh nhanh quyền lợi bảo hiểm
              </h2>
              <p className="mt-1 text-xs font-semibold text-[#556f96]" style={{ margin: "4px 0 0 0" }}>
                Áp dụng bồi thường trực tuyến nhanh chóng cho hành khách SkyLink Airlines.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ background: "#f4f9ff", color: "#153a7a" }}>
                    <th className="px-6 py-3 font-extrabold">Hạng mục quyền lợi</th>
                    <th className="px-4 py-3 font-extrabold">Gói Cơ Bản / Tiêu Chuẩn</th>
                    <th className="px-4 py-3 font-extrabold text-[#0b5ed7]">Gói Toàn Diện</th>
                    <th className="px-4 py-3 font-extrabold">Gói Platinum / VIP</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr
                      key={row.benefit}
                      style={{
                        borderTop: "1px solid #eef4fc",
                        background: idx % 2 === 0 ? "#ffffff" : "#fbfdff",
                      }}
                    >
                      <td className="px-6 py-3 font-bold text-[#0b2559]">{row.benefit}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.basic}</td>
                      <td className="px-4 py-3 font-extrabold text-[#0b4fd0]">{row.plus}</td>
                      <td className="px-4 py-3 font-bold text-[#4c1d95]">{row.vip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* BOTTOM SUPPORT PILL */}
          <div className="mt-7 flex justify-center">
            <div
              className="inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold"
              style={{
                background: "rgba(255, 255, 255, 0.88)",
                color: "#294878",
                border: "1px solid rgba(255, 255, 255, 0.98)",
                boxShadow: "0 8px 22px rgba(21, 64, 138, 0.08)",
                borderRadius: 9999,
              }}
            >
              <Headset size={17} weight="fill" style={{ color: "#0b5ed7" }} />
              <span>
                Tổng đài cứu trợ y tế & bồi thường 24/7:{" "}
                <strong className="font-black text-[#0b2559]">1900 1234</strong> • Hợp lệ gắn theo
                mã đặt chỗ PNR trước giờ khởi hành.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* REAL-WORLD INSURANCE REGISTRATION MODAL */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{
            background: "rgba(9, 25, 58, 0.52)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSelectedPlan(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="insurance-modal-title"
            className="w-full overflow-hidden bg-white shadow-2xl"
            style={{
              maxWidth: 540,
              borderRadius: 24,
              border: "1px solid #dbe9fe",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="relative px-6 py-5 text-white"
              style={{
                background: "linear-gradient(120deg, #0a4bb8 0%, #1d75f2 100%)",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                aria-label="Đóng hộp thoại"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center bg-white/20 text-white transition hover:bg-white/30"
                style={{ borderRadius: 9999, border: "none", cursor: "pointer" }}
              >
                <X size={16} weight="bold" />
              </button>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-extrabold">
                <ShieldCheck size={13} weight="fill" />
                {region === "domestic" ? "Nội địa Việt Nam" : "Quốc tế"} •{" "}
                {tripType === "roundtrip" ? "Khứ hồi" : "Một chiều"}
              </span>
              <h2
                id="insurance-modal-title"
                className="mt-2 text-xl font-black text-white"
                style={{ margin: "8px 0 4px 0" }}
              >
                Đăng ký {selectedPlan.name}
              </h2>
              <p className="text-xs font-semibold text-blue-100" style={{ margin: 0 }}>
                Quyền lợi bảo vệ tối đa: {selectedPlan.maxCoverage} • Phí:{" "}
                {currency.format(getPlanPrice(selectedPlan))} / khách
              </p>
            </div>

            <div className="p-6">
              {certificate ? (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} weight="fill" className="shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-black text-emerald-950" style={{ margin: 0 }}>
                        Đã cấp Giấy chứng nhận bảo hiểm điện tử!
                      </p>
                      <p
                        className="mt-1.5 text-xs font-semibold leading-relaxed text-emerald-800"
                        style={{ margin: "6px 0 0 0" }}
                      >
                        Số hợp đồng: <strong>{certificate.certNumber}</strong>
                        <br />
                        Gói: <strong>{certificate.planName}</strong> ({certificate.region} –{" "}
                        {certificate.tripType})
                        <br />
                        Mã đặt chỗ (PNR): <strong>{certificate.pnr}</strong> • Số khách:{" "}
                        <strong>{certificate.passengerCount}</strong>
                        <br />
                        Tổng phí bảo hiểm:{" "}
                        <strong>{currency.format(certificate.totalPrice)}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="px-4 py-2 text-xs font-extrabold text-emerald-800"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #a7f3d0",
                        borderRadius: 9999,
                        cursor: "pointer",
                      }}
                    >
                      Hoàn tất
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(null);
                        navigate("/my-bookings");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Xem chuyến bay của tôi
                      <ArrowRight size={13} weight="bold" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmInsurance} className="space-y-3.5">
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 text-xs"
                    style={{
                      background: "#f0f7ff",
                      border: "1px solid #d5e7ff",
                      color: "#1e4280",
                    }}
                  >
                    <Info size={16} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
                    <span>
                      Bảo hiểm du lịch được gắn trực tiếp theo mã đặt chỗ chuyến bay (PNR) hoặc mua
                      độc lập trước giờ khởi hành.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Gắn vào mã chuyến bay (PNR)
                      </label>
                      {bookings.length > 0 ? (
                        <select
                          value={pnrCode}
                          onChange={(e) => setPnrCode(e.target.value)}
                          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        >
                          {bookings.map((b) => (
                            <option key={b.id} value={b.pnr_code}>
                              {b.pnr_code} • {b.flight?.flight_number || "SkyLink"}
                            </option>
                          ))}
                          <option value="">Mua bảo hiểm độc lập</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={pnrCode}
                          onChange={(e) => setPnrCode(e.target.value)}
                          placeholder={loadingBookings ? "Đang tải..." : "VD: SLK2587HN (nếu có)"}
                          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Số hành khách được bảo hiểm
                      </label>
                      <div className="relative flex items-center">
                        <UsersThree
                          size={15}
                          className="pointer-events-none absolute left-3 text-blue-600"
                        />
                        <select
                          value={passengerCount}
                          onChange={(e) => setPassengerCount(Number(e.target.value))}
                          className="w-full rounded-xl border border-blue-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-[#102d63] focus:border-blue-500 focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                              {n} hành khách
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                      Họ tên người được bảo hiểm chính
                    </label>
                    <div className="relative flex items-center">
                      <User
                        size={15}
                        className="pointer-events-none absolute left-3 text-blue-600"
                      />
                      <input
                        type="text"
                        required
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full rounded-xl border border-blue-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Email nhận chứng nhận điện tử
                      </label>
                      <input
                        type="email"
                        required
                        value={holderEmail}
                        onChange={(e) => setHolderEmail(e.target.value)}
                        placeholder="user@skylink.vn"
                        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Số điện thoại liên hệ
                      </label>
                      <input
                        type="tel"
                        required
                        value={holderPhone}
                        onChange={(e) => setHolderPhone(e.target.value)}
                        placeholder="0901 234 567"
                        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#102d63] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Summary Total Strip */}
                  <div
                    className="flex items-center justify-between rounded-2xl px-4 py-3"
                    style={{ background: "#f4f9ff", border: "1px solid #d5e6fc" }}
                  >
                    <span className="text-xs font-bold text-[#355384]">
                      Tổng phí bảo hiểm ({passengerCount} khách)
                    </span>
                    <strong className="text-base font-black text-[#0b4fd0]">
                      {currency.format(getPlanPrice(selectedPlan) * passengerCount)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                      style={{
                        borderRadius: 9999,
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        boxShadow: "0 6px 16px rgba(11, 94, 215, 0.28)",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <ShieldCheck size={15} weight="fill" />
                      Xác nhận đăng ký bảo hiểm
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

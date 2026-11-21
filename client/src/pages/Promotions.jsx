import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  Bed,
  CarProfile,
  CheckCircle,
  Clock,
  Copy,
  Crown,
  EnvelopeSimple,
  Fire,
  Gift,
  Percent,
  Sparkle,
  Tag,
  Ticket,
  Trophy,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_PROMO_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const PROMO_LIST = [
  {
    id: "winter-26",
    code: "SKYLINK500",
    category: "Vé máy bay",
    title: "Chào Mùa Lễ Hội Cuối Năm 2026",
    discount: "Giảm 500.000 ₫",
    badge: "HOT DEAL",
    badgeBg: "#ef4444",
    badgeColor: "#ffffff",
    expiry: "31/12/2026",
    minOrder: "Áp dụng đơn vé khứ hồi từ 2.500.000 ₫",
    desc: "Ưu đãi đặc biệt cho tất cả đường bay nội địa Hà Nội, TP.HCM, Đà Nẵng, Nha Trang & Phú Quốc.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
    actionTo: "/",
    actionLabel: "Đặt vé ngay",
  },
  {
    id: "welcome-20",
    code: "WELCOME20",
    category: "Thành viên mới",
    title: "Ưu Đãi Thành Viên Mới SkyClub",
    discount: "Giảm 20%",
    badge: "Mới đăng ký",
    badgeBg: "#0b5ed7",
    badgeColor: "#ffffff",
    expiry: "31/12/2026",
    minOrder: "Tối đa 400.000 ₫ cho lần đặt đầu tiên",
    desc: "Dành riêng cho tài khoản mới đăng ký và đặt vé trực tuyến lần đầu trên hệ thống SkyLink Airlines.",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=85",
    actionTo: "/",
    actionLabel: "Áp dụng ngay",
  },
  {
    id: "hotel-combo",
    code: "STAY300",
    category: "Khách sạn",
    title: "Combo Bay & Nghỉ Dưỡng 5 Sao",
    discount: "Giảm 300.000 ₫",
    badge: "SkyLink Travel",
    badgeBg: "#16a34a",
    badgeColor: "#ffffff",
    expiry: "15/01/2027",
    minOrder: "Áp dụng đặt phòng khách sạn từ 2 đêm",
    desc: "Tiết kiệm thêm khi đặt phòng khách sạn tại Đà Nẵng, Nha Trang, Phú Quốc kèm mã vé SkyLink.",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=85",
    actionTo: "/travel/hotel",
    actionLabel: "Đặt phòng ngay",
  },
  {
    id: "car-rental",
    code: "DRIVE15",
    category: "Thuê xe & Đưa đón",
    title: "Thuê Xe Tự Lái & Đưa Đón Sân Bay",
    discount: "Giảm 15%",
    badge: "Tiện lợi",
    badgeBg: "#7c3aed",
    badgeColor: "#ffffff",
    expiry: "31/12/2026",
    minOrder: "Áp dụng mọi dòng xe 4 – 16 chỗ",
    desc: "Giảm ngay 15% cho dịch vụ thuê xe tự lái theo ngày hoặc xe đưa đón tận cửa tại 5 sân bay lớn.",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=85",
    actionTo: "/travel/car",
    actionLabel: "Chọn xe ngay",
  },
  {
    id: "intl-asia",
    code: "ASIA800",
    category: "Vé máy bay",
    title: "Bay Quốc Tế Singapore – Hàn – Nhật",
    discount: "Giảm 800.000 ₫",
    badge: "Quốc tế",
    badgeBg: "#0284c7",
    badgeColor: "#ffffff",
    expiry: "28/02/2027",
    minOrder: "Áp dụng chặng quốc tế khứ hồi",
    desc: "Ưu đãi giá vé khứ hồi đi Singapore, Malaysia, Campuchia, Seoul, Tokyo cùng 23kg hành lý ký gửi.",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85",
    actionTo: "/",
    actionLabel: "Tìm chuyến bay",
  },
  {
    id: "business-vip",
    code: "BIZVIP15",
    category: "Thành viên mới",
    title: "Nâng Hạng Thương Gia SkyClub",
    discount: "Giảm 15% + ×1.5 điểm",
    badge: "Thương gia",
    badgeBg: "#b45309",
    badgeColor: "#ffffff",
    expiry: "31/03/2027",
    minOrder: "Áp dụng hạng ghế Business Class",
    desc: "Trải nghiệm khoang Thương gia, Phòng chờ VIP SkyClub Lounge & nhân 1.5 lần điểm thưởng SkyClub.",
    image:
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=900&q=85",
    actionTo: "/skyclub",
    actionLabel: "Xem SkyClub",
  },
];

const PROMO_CATEGORIES = [
  "Tất cả",
  "Vé máy bay",
  "Khách sạn",
  "Thuê xe & Đưa đón",
  "Thành viên mới",
];

export default function Promotions() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [copiedCode, setCopiedCode] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const visiblePromos =
    activeCategory === "Tất cả"
      ? PROMO_LIST
      : PROMO_LIST.filter((p) => p.category === activeCategory);

  const handleCopy = (code) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // ignore clipboard errors
    }
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(""), 2200);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
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
          style={{ height: 325 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.85) 46%, rgba(225,241,255,0.20) 100%)",
            }}
          />
          <img
            src={HERO_PROMO_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "62%",
              objectPosition: "center 30%",
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
              <div style={{ maxWidth: 560 }}>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  <Gift size={15} weight="fill" />
                  SKYLINK DEALS • ƯU ĐÃI ĐỘC QUYỀN
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
                  Ưu Đãi & Khuyến Mãi
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  Săn mã giảm giá vé máy bay, khách sạn, thuê xe và đặc quyền tích dặm thưởng dành
                  riêng cho hành khách SkyLink Airlines.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/skyclub")}
                className="inline-flex w-fit items-center gap-2 px-5 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(90deg, #0a58ca 0%, #1d75f2 100%)",
                  boxShadow: "0 10px 24px rgba(13, 97, 225, 0.34)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Crown size={17} weight="fill" className="text-amber-300" />
                <span>Khám phá đặc quyền SkyClub</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </header>

          {/* FEATURED BANNER + SKYCLUB LOYALTY CARD */}
          <section className="mb-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Featured Hot Deal (Left 8 cols) */}
            <div
              className="relative overflow-hidden p-6 text-white sm:p-8 lg:col-span-8"
              style={{
                borderRadius: 26,
                background: "linear-gradient(125deg, #082052 0%, #0b4fd0 55%, #1e88e5 100%)",
                boxShadow: "0 16px 38px rgba(13, 94, 215, 0.24)",
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full"
                style={{ background: "rgba(255,255,255,0.10)" }}
              />
              <div className="relative flex h-full flex-col justify-between gap-5">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black"
                      style={{ background: "#f59e0b", color: "#091e47" }}
                    >
                      <Fire size={13} weight="fill" />
                      ƯU ĐÃI NỔI BẬT MÙA LỄ HỘI
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-blue-100">
                      <Clock size={13} weight="bold" />
                      Hạn dùng: 31/12/2026
                    </span>
                  </div>

                  <h2
                    className="font-black tracking-tight text-white"
                    style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)", margin: "0 0 6px 0" }}
                  >
                    Giảm ngay 500.000 ₫ cho vé khứ hồi
                  </h2>
                  <p className="max-w-xl text-xs font-medium leading-relaxed text-blue-100 sm:text-sm" style={{ margin: 0 }}>
                    Áp dụng cho mọi chuyến bay nội địa khởi hành từ Hà Nội, TP. Hồ Chí Minh, Đà Nẵng,
                    Nha Trang và Phú Quốc. Đặt sớm để giữ chỗ giá tốt nhất!
                  </p>
                </div>

                {/* Copy Code + Book Now Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="inline-flex items-center gap-3 px-4 py-2.5"
                    style={{
                      background: "rgba(255, 255, 255, 0.14)",
                      border: "1px dashed rgba(255, 255, 255, 0.55)",
                      borderRadius: 14,
                    }}
                  >
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-200">
                        Mã giảm giá
                      </span>
                      <strong className="font-mono text-base font-black tracking-wider text-amber-300">
                        SKYLINK500
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("SKYLINK500")}
                      className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-[#0b4fd0] transition hover:bg-blue-50"
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      {copiedCode === "SKYLINK500" ? (
                        <>
                          <CheckCircle size={15} weight="fill" className="text-emerald-600" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy size={14} weight="bold" />
                          Sao chép
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-1.5 bg-white px-5 py-3 text-xs font-extrabold text-[#0b4fd0] shadow-sm transition hover:bg-blue-50"
                    style={{ borderRadius: 9999, border: "none", cursor: "pointer" }}
                  >
                    <AirplaneTilt size={15} weight="fill" />
                    <span>Đặt vé áp dụng mã</span>
                    <ArrowRight size={13} weight="bold" />
                  </button>
                </div>
              </div>
            </div>

            {/* SkyClub Loyalty Card (Right 4 cols) */}
            <div
              className="flex flex-col justify-between bg-white p-6 lg:col-span-4"
              style={{
                borderRadius: 26,
                border: "1px solid rgba(255,255,255,0.98)",
                boxShadow: "0 14px 34px rgba(20, 62, 132, 0.10)",
              }}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold"
                    style={{ background: "#eef6ff", color: "#0b4fd0" }}
                  >
                    <Sparkle size={13} weight="fill" />
                    SkyClub Platinum
                  </span>
                  <Trophy size={24} weight="fill" className="text-amber-500" />
                </div>

                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a749b]" style={{ margin: 0 }}>
                  Điểm thưởng tích lũy
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black tracking-tight text-[#092152]">2,500</span>
                  <span className="text-xs font-extrabold text-[#0b5ed7]">PTS</span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "72%",
                      background: "linear-gradient(90deg, #0b5ed7 0%, #38bdf8 100%)",
                    }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-bold text-[#556f96]">
                  <span>2,500 / 3,500 PTS</span>
                  <span className="text-[#0b5ed7]">Còn 1,000 PTS lên Diamond</span>
                </div>
              </div>

              <div
                className="mt-4 rounded-2xl p-3.5 text-xs font-semibold text-[#1e3f77]"
                style={{ background: "#f4f9ff", border: "1px solid #d9e8fd" }}
              >
                ★ Tự động nhân <strong>1.5× điểm thưởng</strong> khi đặt vé hạng Thương gia & đổi
                voucher khách sạn miễn phí.
              </div>
            </div>
          </section>

          {/* CATEGORY FILTER PILLS */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {PROMO_CATEGORIES.map((cat) => {
                const count =
                  cat === "Tất cả"
                    ? PROMO_LIST.length
                    : PROMO_LIST.filter((p) => p.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className="px-4 py-2 text-xs font-extrabold transition"
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            boxShadow: "0 6px 16px rgba(13, 97, 225, 0.28)",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                          }
                        : {
                            background: "rgba(255, 255, 255, 0.90)",
                            color: "#1e3f77",
                            border: "1px solid #d4e4fb",
                            borderRadius: 9999,
                            cursor: "pointer",
                          }
                    }
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-[#355586]">
              Hiển thị <strong>{visiblePromos.length}</strong> chương trình ưu đãi đang áp dụng
            </span>
          </div>

          {/* 3-COLUMN PROMO CARDS GRID */}
          <section aria-label="Danh sách mã ưu đãi" className="mb-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {visiblePromos.map((promo, idx) => {
                const isCopied = copiedCode === promo.code;
                return (
                  <motion.article
                    key={promo.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="flex flex-col overflow-hidden bg-white transition duration-300 hover:-translate-y-1"
                    style={{
                      borderRadius: 24,
                      border: "1px solid rgba(255,255,255,0.98)",
                      boxShadow: "0 14px 34px rgba(21, 64, 138, 0.09)",
                    }}
                  >
                    {/* Card Image Banner */}
                    <div className="relative overflow-hidden" style={{ height: 170 }}>
                      <img
                        src={promo.image}
                        alt={promo.title}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(8,22,52,0.12) 0%, rgba(8,22,52,0.68) 100%)",
                        }}
                      />
                      <span
                        className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-sm"
                        style={{ background: promo.badgeBg, color: promo.badgeColor }}
                      >
                        <Tag size={12} weight="fill" />
                        {promo.badge}
                      </span>
                      <span
                        className="absolute bottom-3 left-3.5 text-xl font-black tracking-tight text-white"
                        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.35)" }}
                      >
                        {promo.discount}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-[#5a749b]">
                        <span className="text-[#0b5ed7]">{promo.category}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} weight="bold" />
                          HSD: {promo.expiry}
                        </span>
                      </div>

                      <h3
                        className="text-base font-black text-[#092152]"
                        style={{ margin: "0 0 6px 0" }}
                      >
                        {promo.title}
                      </h3>
                      <p
                        className="mb-3 flex-1 text-xs font-medium leading-relaxed text-[#4f6891]"
                        style={{ margin: "0 0 12px 0" }}
                      >
                        {promo.desc}
                      </p>
                      <p
                        className="mb-4 text-[11px] font-bold text-[#2b4c7e]"
                        style={{ margin: "0 0 14px 0" }}
                      >
                        • {promo.minOrder}
                      </p>

                      {/* Dashed Voucher Code Strip + CTA */}
                      <div className="mt-auto space-y-2.5">
                        <div
                          className="flex items-center justify-between px-3.5 py-2"
                          style={{
                            background: "#f4f9ff",
                            border: "1px dashed #8ab4f8",
                            borderRadius: 12,
                          }}
                        >
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-[#5a749b]">
                              Mã ưu đãi
                            </span>
                            <strong className="font-mono text-sm font-black tracking-wider text-[#0b4fd0]">
                              {promo.code}
                            </strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(promo.code)}
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-[#0b4fd0] shadow-xs transition hover:bg-blue-50"
                            style={{ border: "1px solid #cde0fc", cursor: "pointer" }}
                          >
                            {isCopied ? (
                              <>
                                <CheckCircle size={13} weight="fill" className="text-emerald-600" />
                                Đã chép
                              </>
                            ) : (
                              <>
                                <Copy size={13} weight="bold" />
                                Sao chép
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(promo.actionTo)}
                          className="inline-flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold text-white transition hover:opacity-95"
                          style={{
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <span>{promo.actionLabel}</span>
                          <ArrowRight size={13} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* NEWSLETTER SUBSCRIPTION BANNER */}
          <section
            aria-label="Đăng ký nhận bản tin ưu đãi"
            className="overflow-hidden bg-white p-6 sm:p-8"
            style={{
              borderRadius: 26,
              border: "1px solid rgba(255,255,255,0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
            }}
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <EnvelopeSimple size={24} weight="fill" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-[#092152]" style={{ margin: 0 }}>
                    Đăng ký nhận mã giảm giá vé 0 ₫ mỗi tuần
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-[#556f96]" style={{ margin: "4px 0 0 0" }}>
                    Nhận thông báo sớm nhất về các đợt Flash Sale nội địa, quốc tế và combo khách
                    sạn SkyLink Travel.
                  </p>
                </div>
              </div>

              {subscribed ? (
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-extrabold"
                  style={{
                    background: "#ecfdf5",
                    color: "#065f46",
                    border: "1px solid #a7f3d0",
                  }}
                >
                  <CheckCircle size={17} weight="fill" className="text-emerald-600" />
                  Đăng ký thành công! Mã ưu đãi mới sẽ gửi tới email của bạn.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email của bạn..."
                    className="rounded-full border border-blue-200 bg-[#f7faff] px-4 py-2.5 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none sm:w-64"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-extrabold text-white transition hover:opacity-95"
                    style={{
                      background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                      borderRadius: 9999,
                      border: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Percent size={14} weight="bold" />
                    <span>Nhận ưu đãi</span>
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

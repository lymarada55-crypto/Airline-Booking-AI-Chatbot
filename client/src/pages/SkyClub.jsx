import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  AirplaneInFlight,
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Coffee,
  Crown,
  Gift,
  LockSimple,
  Percent,
  ShieldCheck,
  Sparkle,
  Star,
  SuitcaseRolling,
  Ticket,
  Trophy,
} from "@phosphor-icons/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_SKYCLUB_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const MEMBERSHIP_TIERS = [
  {
    id: "silver",
    name: "Hạng Bạc (Silver)",
    requirement: "0 – 1 vé Thương gia",
    badgeBg: "#e2e8f0",
    badgeColor: "#334155",
    perks: [
      "Tích lũy 100% dặm bay trên mọi chặng nội địa & quốc tế",
      "Check-in trực tuyến sớm từ 24 giờ trước giờ bay",
      "Ưu tiên nhận thông báo Flash Sale & mã giảm giá SkyLink",
    ],
  },
  {
    id: "gold",
    name: "Hạng Vàng (Gold)",
    requirement: "2 – 4 vé Thương gia",
    badgeBg: "#fef3c7",
    badgeColor: "#92400e",
    perks: [
      "Nhân 1.25× điểm thưởng SkyClub trên mỗi chuyến bay",
      "Miễn phí chọn trước chỗ ngồi tiêu chuẩn & thêm 5kg hành lý",
      "Quầy làm thủ tục ưu tiên tại sân bay Nội Bài, Tân Sơn Nhất, Đà Nẵng",
    ],
  },
  {
    id: "vip",
    name: "Hạng Thương Gia VIP",
    requirement: "Từ 5 vé Thương gia",
    badgeBg: "#0b5ed7",
    badgeColor: "#ffffff",
    highlighted: true,
    perks: [
      "Tự động giảm 5% giá vé cơ bản vĩnh viễn trên toàn hệ thống",
      "Miễn phí Phòng chờ Thương gia SkyClub Lounge kể cả khi bay Phổ thông",
      "Ưu tiên lên máy bay đầu tiên (SkyPriority) & gắn thẻ hành lý ưu tiên",
    ],
  },
];

const VIP_PERKS = [
  {
    Icon: Percent,
    title: "Giảm 5% giá vé cơ bản",
    desc: "Tự động áp dụng trực tiếp vào giá vé khi tìm kiếm và đặt mọi chuyến bay trên SkyLink Airlines.",
    tag: "Tự động áp dụng",
  },
  {
    Icon: Coffee,
    title: "Phòng chờ Thương gia VIP",
    desc: "Thư giãn tại hệ thống SkyClub Lounge với buffet nóng, Wi-Fi tốc độ cao và không gian làm việc yên tĩnh.",
    tag: "Miễn phí ra vào",
  },
  {
    Icon: AirplaneInFlight,
    title: "Ưu tiên lên máy bay",
    desc: "Làn làm thủ tục SkyPriority riêng biệt và được mời lên tàu bay đầu tiên tại mọi cửa khởi hành.",
    tag: "SkyPriority",
  },
  {
    Icon: SuitcaseRolling,
    title: "Thêm 10kg hành lý ký gửi",
    desc: "Tặng thêm hạn mức hành lý ký gửi miễn cước và gắn thẻ Priority để nhận hành lý đầu tiên khi hạ cánh.",
    tag: "Hành lý ưu tiên",
  },
  {
    Icon: Gift,
    title: "Đổi dặm lấy khách sạn & xe",
    desc: "Quy đổi điểm SkyClub sang voucher giảm giá phòng khách sạn, thuê xe tự lái và đưa đón sân bay.",
    tag: "SkyLink Travel",
  },
  {
    Icon: ShieldCheck,
    title: "Tổng đài VIP riêng 24/7",
    desc: "Hỗ trợ đổi chuyến bay linh hoạt, giữ chỗ ưu tiên và giải quyết yêu cầu tức thì không cần chờ máy.",
    tag: "Hotline riêng",
  },
];

export default function SkyClub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token =
        localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }

      if (token) {
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (response.ok && data.status === "success") {
            setUser(data.data);
            if (localStorage.getItem("user")) {
              localStorage.setItem("user", JSON.stringify(data.data));
            } else if (sessionStorage.getItem("user")) {
              sessionStorage.setItem("user", JSON.stringify(data.data));
            }
          }
        } catch (err) {
          console.error("Lỗi cập nhật user:", err);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const businessTickets = Number(user?.business_class_ticket_count || 0);
  const isVip = Boolean(user?.is_vip || businessTickets >= 5);
  const currentTier = isVip
    ? "vip"
    : businessTickets >= 2
      ? "gold"
      : "silver";
  const currentTierLabel = isVip
    ? "HẠNG THƯƠNG GIA VIP"
    : businessTickets >= 2
      ? "HẠNG VÀNG (GOLD)"
      : "HẠNG BẠC (SILVER)";
  const progressPercent = Math.min((businessTickets / 5) * 100, 100);
  const remainingTickets = Math.max(5 - businessTickets, 0);
  const memberCode = user?.id
    ? `SLK-${String(user.id).padStart(6, "0")}`
    : "SLK-GUEST";

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
          style={{ height: 330 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.85) 46%, rgba(225,241,255,0.20) 100%)",
            }}
          />
          <img
            src={HERO_SKYCLUB_BG_URL}
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
                  <Crown size={15} weight="fill" className="text-amber-500" />
                  CHƯƠNG TRÌNH HỘI VIÊN THÂN THIẾT
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(2.1rem, 3.6vw, 2.9rem)",
                    color: "#091e47",
                    lineHeight: 1.12,
                    margin: "0 0 8px 0",
                  }}
                >
                  SkyLink <span style={{ color: "#0b5ed7" }}>SkyClub</span>
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  Tích lũy chuyến bay Thương gia, thăng hạng hội viên và tận hưởng đặc quyền giảm 5%
                  giá vé vĩnh viễn cùng phòng chờ VIP 5 sao.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(user ? "/flights" : "/login")}
                className="inline-flex w-fit items-center gap-2 px-5 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(90deg, #0a58ca 0%, #1d75f2 100%)",
                  boxShadow: "0 10px 24px rgba(13, 97, 225, 0.34)",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <AirplaneTilt size={16} weight="fill" />
                <span>{user ? "Tìm chuyến bay Thương gia ngay" : "Đăng nhập để xem hạng thẻ"}</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </header>

          {/* MEMBER DIGITAL CARD & PROGRESS DASHBOARD */}
          <section className="mb-8">
            {loading ? (
              <div className="h-60 animate-pulse rounded-3xl bg-white/80" />
            ) : !user ? (
              <div
                className="flex flex-col items-center justify-between gap-6 bg-white p-7 text-center md:flex-row md:text-left"
                style={{
                  borderRadius: 26,
                  border: "1px solid rgba(255,255,255,0.98)",
                  boxShadow: "0 16px 38px rgba(20, 62, 132, 0.10)",
                }}
              >
                <div className="flex flex-col items-center gap-4 md:flex-row">
                  <span
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                  >
                    <Crown size={34} weight="fill" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-[#092152]" style={{ margin: 0 }}>
                      Đăng nhập để kích hoạt Thẻ Hội Viên SkyClub
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-[#556f96]" style={{ margin: "4px 0 0 0" }}>
                      Theo dõi số chuyến bay Thương gia đã tích lũy và mở khóa giảm 5% giá vé vĩnh
                      viễn cùng phòng chờ VIP.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex shrink-0 items-center gap-2 px-6 py-3 text-xs font-extrabold text-white transition hover:opacity-95"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                    borderRadius: 9999,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left 5 Cols: Premium Digital Membership Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative flex flex-col justify-between overflow-hidden p-6 text-white lg:col-span-5"
                  style={{
                    minHeight: 240,
                    borderRadius: 26,
                    background: isVip
                      ? "linear-gradient(135deg, #091b42 0%, #0b48b5 52%, #b45309 100%)"
                      : "linear-gradient(135deg, #082052 0%, #0b52c4 58%, #2589f5 100%)",
                    boxShadow: "0 18px 40px rgba(9, 34, 86, 0.28)",
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  />
                  <Crown
                    size={140}
                    weight="duotone"
                    className="pointer-events-none absolute -bottom-8 -right-6 text-white/10"
                  />

                  <div className="relative flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider">
                      <AirplaneTilt size={17} weight="fill" />
                      SKYLINK SKYCLUB
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                      style={{
                        background: isVip ? "#f59e0b" : "rgba(255,255,255,0.18)",
                        color: isVip ? "#091e47" : "#ffffff",
                      }}
                    >
                      {isVip ? <Crown size={12} weight="fill" /> : <Star size={12} weight="fill" />}
                      {currentTierLabel}
                    </span>
                  </div>

                  <div className="relative my-5">
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200"
                      style={{ margin: 0 }}
                    >
                      Chủ thẻ hội viên
                    </p>
                    <h2
                      className="mt-1 text-2xl font-black tracking-tight text-white"
                      style={{ margin: "4px 0 0 0" }}
                    >
                      {user.name}
                    </h2>
                  </div>

                  <div className="relative flex items-end justify-between gap-2 border-t border-white/15 pt-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-blue-200">
                        Mã hội viên
                      </span>
                      <strong className="font-mono text-sm font-black tracking-widest text-amber-300">
                        {memberCode}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase text-blue-200">
                        Đặc quyền giá vé
                      </span>
                      <strong className="text-xs font-extrabold text-white">
                        {isVip ? "Giảm 5% vĩnh viễn" : "Tích lũy lên VIP"}
                      </strong>
                    </div>
                  </div>
                </motion.div>

                {/* Right 7 Cols: Tier Progress & Status Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="flex flex-col justify-between bg-white p-6 sm:p-7 lg:col-span-7"
                  style={{
                    borderRadius: 26,
                    border: "1px solid rgba(255,255,255,0.98)",
                    boxShadow: "0 14px 36px rgba(20, 62, 132, 0.10)",
                  }}
                >
                  <div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#0b5ed7]" style={{ margin: 0 }}>
                          Tiến trình thăng hạng VIP
                        </p>
                        <h3 className="mt-0.5 text-lg font-black text-[#092152]" style={{ margin: "2px 0 0 0" }}>
                          {isVip
                            ? "Chúc mừng! Bạn đã mở khóa Hạng Thương Gia VIP"
                            : `Còn ${remainingTickets} vé Thương gia nữa để đạt Hạng VIP`}
                        </h3>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black"
                        style={{ background: "#eef6ff", color: "#0b4fd0" }}
                      >
                        <Trophy size={15} weight="fill" className="text-amber-500" />
                        {businessTickets} / 5 vé Thương gia
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full overflow-hidden rounded-full bg-blue-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background: isVip
                            ? "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)"
                            : "linear-gradient(90deg, #0b5ed7 0%, #38bdf8 100%)",
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] font-bold text-[#5a749b]">
                      <span>0 vé (Silver)</span>
                      <span>2 vé (Gold)</span>
                      <span className="text-[#0b5ed7]">5 vé (Thương Gia VIP)</span>
                    </div>
                  </div>

                  {/* Status Banner + Action */}
                  <div
                    className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
                    style={{
                      background: isVip ? "#ecfdf5" : "#f4f9ff",
                      border: isVip ? "1px solid #a7f3d0" : "1px solid #d5e6fc",
                    }}
                  >
                    <p
                      className="flex items-start gap-2 text-xs font-semibold"
                      style={{ color: isVip ? "#065f46" : "#1e3f77", margin: 0, maxWidth: 420 }}
                    >
                      {isVip ? (
                        <>
                          <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-emerald-600" />
                          <span>
                            Mọi chuyến bay bạn đặt hiện được <strong>tự động giảm 5% giá vé cơ bản</strong> và
                            ưu tiên sử dụng Phòng chờ SkyClub Lounge miễn phí.
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkle size={18} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
                          <span>
                            Đặt thêm <strong>{remainingTickets} chuyến bay Hạng Thương gia</strong> để
                            nhận đặc quyền giảm giá 5% vĩnh viễn và vào Phòng chờ VIP miễn phí.
                          </span>
                        </>
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/flights")}
                      className="inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Ticket size={14} weight="fill" />
                      <span>Đặt vé tích điểm</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </section>

          {/* 3-COLUMN MEMBERSHIP TIER COMPARISON */}
          <section aria-label="Các hạng thẻ hội viên SkyClub" className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#092152]" style={{ margin: 0 }}>
                Hệ thống hạng thẻ SkyClub
              </h2>
              <span className="text-xs font-bold text-[#4a658f]">
                Tự động thăng hạng ngay khi đủ số chuyến bay
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {MEMBERSHIP_TIERS.map((tier) => {
                const isCurrent = user && currentTier === tier.id;
                return (
                  <article
                    key={tier.id}
                    className="flex flex-col bg-white p-5 transition duration-200 hover:-translate-y-0.5"
                    style={{
                      borderRadius: 22,
                      border:
                        isCurrent || tier.highlighted
                          ? "2px solid #1d75f2"
                          : "1px solid rgba(255,255,255,0.98)",
                      boxShadow: "0 12px 30px rgba(21, 64, 138, 0.08)",
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-extrabold"
                        style={{ background: tier.badgeBg, color: tier.badgeColor }}
                      >
                        {tier.name}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          Hạng hiện tại
                        </span>
                      )}
                    </div>

                    <p className="mb-3 text-xs font-extrabold text-[#0b4fd0]" style={{ margin: "0 0 12px 0" }}>
                      Điều kiện: {tier.requirement}
                    </p>

                    <ul
                      className="space-y-2.5"
                      style={{ listStyle: "none", padding: 0, margin: 0 }}
                    >
                      {tier.perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-[#253e6b]"
                        >
                          <CheckCircle
                            size={16}
                            weight="fill"
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>

          {/* 6 VIP PRIVILEGES GRID */}
          <section aria-label="Đặc quyền hội viên SkyClub VIP">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#092152]" style={{ margin: 0 }}>
                6 Đặc quyền nổi bật dành cho Hội viên VIP
              </h2>
              <span className="text-xs font-bold text-[#4a658f]">
                {isVip ? "✔ Đã mở khóa toàn bộ đặc quyền" : "Mở khóa khi đạt Hạng Thương Gia VIP"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {VIP_PERKS.map((perk) => {
                const Icon = perk.Icon;
                return (
                  <article
                    key={perk.title}
                    className="flex flex-col bg-white p-5 transition duration-200 hover:-translate-y-0.5"
                    style={{
                      borderRadius: 22,
                      border: "1px solid rgba(255,255,255,0.98)",
                      boxShadow: "0 12px 28px rgba(21, 64, 138, 0.08)",
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{
                          background: isVip ? "#eaf3ff" : "#f1f5f9",
                          color: isVip ? "#0b5ed7" : "#64748b",
                        }}
                      >
                        <Icon size={22} weight="fill" />
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                        style={
                          isVip
                            ? { background: "#dcfce7", color: "#15803d" }
                            : { background: "#f1f5f9", color: "#475569" }
                        }
                      >
                        {isVip ? (
                          <CheckCircle size={12} weight="fill" />
                        ) : (
                          <LockSimple size={11} weight="bold" />
                        )}
                        {perk.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-[#092152]" style={{ margin: "0 0 6px 0" }}>
                      {perk.title}
                    </h3>
                    <p
                      className="text-xs font-medium leading-relaxed text-[#4f6891]"
                      style={{ margin: 0 }}
                    >
                      {perk.desc}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

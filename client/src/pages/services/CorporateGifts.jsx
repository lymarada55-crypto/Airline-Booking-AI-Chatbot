import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Buildings,
  CheckCircle,
  Crown,
  EnvelopeSimple,
  Gift,
  Headset,
  PaperPlaneRight,
  Percent,
  PhoneCall,
  Receipt,
  ShieldCheck,
  Sparkle,
  Ticket,
  User,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

const HERO_CORPORATE_BG_URL =
  "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=85";

const CORPORATE_PACKAGES = [
  {
    id: "gift-card-silver",
    name: "SkyLink E-Voucher Standard",
    subtitle: "Thẻ quà tặng điện tử linh hoạt cho nhân viên & khách hàng",
    unitPrice: 2000000,
    minQty: 10,
    discountLabel: "Chiết khấu đến 6%",
    badge: "Phổ biến",
    badgeBg: "#e0f2fe",
    badgeColor: "#0369a1",
    popular: false,
    cardGradient: "linear-gradient(135deg, #0f3b8c 0%, #1d6fe8 60%, #4da3ff 100%)",
    tierTag: "E-VOUCHER • 2.000.000 ₫",
    benefits: [
      "Quy đổi trực tiếp khi đặt mọi chuyến bay SkyLink nội địa & quốc tế",
      "Thời hạn sử dụng lên đến 12 tháng kể từ ngày phát hành",
      "Gửi mã E-Voucher tự động qua Email hoặc in thiệp cứng kèm logo doanh nghiệp",
      "Xuất hóa đơn VAT điện tử đầy đủ trong 24 giờ",
    ],
  },
  {
    id: "gift-card-gold",
    name: "SkyLink Gift Card Doanh Nghiệp",
    subtitle: "Giải pháp tri ân đối tác chiến lược & khách hàng VIP",
    unitPrice: 5000000,
    minQty: 10,
    discountLabel: "Chiết khấu đến 10%",
    badge: "Được chọn nhiều nhất",
    badgeBg: "#0b5ed7",
    badgeColor: "#ffffff",
    popular: true,
    cardGradient: "linear-gradient(135deg, #092256 0%, #0b5ed7 55%, #1e88e5 100%)",
    tierTag: "CORPORATE GOLD • 5.000.000 ₫",
    benefits: [
      "Tùy biến thiết kế thẻ & hộp quà sang trọng in logo riêng của doanh nghiệp",
      "Tặng kèm 01 lượt phòng chờ Thương gia SkyClub Lounge cho mỗi thẻ",
      "Ưu tiên làm thủ tục tại quầy SkyPriority & miễn phí chọn chỗ ngồi tiêu chuẩn",
      "Hỗ trợ xuất hóa đơn VAT & hợp đồng doanh nghiệp B2B nhanh chóng",
    ],
  },
  {
    id: "gift-card-platinum",
    name: "SkyLink Flight Pass VIP",
    subtitle: "Gói thẻ bay trọn gói dành cho Ban Lãnh Đạo & Khách VVIP",
    unitPrice: 15000000,
    minQty: 5,
    discountLabel: "Chiết khấu đến 15%",
    badge: "Đẳng cấp VVIP",
    badgeBg: "#fef3c7",
    badgeColor: "#92400e",
    popular: false,
    cardGradient: "linear-gradient(135deg, #111827 0%, #1e3a8a 58%, #b45309 100%)",
    tierTag: "PLATINUM PASS • 15.000.000 ₫",
    benefits: [
      "Bao gồm vé hạng Thương gia linh hoạt đổi ngày/giờ không mất phí",
      "Đặc quyền Phòng chờ Thương gia & Đưa đón sân bay VIP miễn phí",
      "Chuyên viên hỗ trợ đặt vé riêng 24/7 (Dedicated Corporate Desk)",
      "Quà tặng hộp da cao cấp khắc tên cá nhân & xuất hóa đơn VAT đầy đủ",
    ],
  },
];

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function getVolumeDiscountRate(quantity) {
  if (quantity >= 100) return 0.15;
  if (quantity >= 50) return 0.1;
  if (quantity >= 20) return 0.06;
  return 0.03;
}

export default function CorporateGifts() {
  const [selectedPkgId, setSelectedPkgId] = useState(CORPORATE_PACKAGES[1].id);
  const [quantity, setQuantity] = useState(20);
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submittedQuote, setSubmittedQuote] = useState(null);

  const selectedPackage =
    CORPORATE_PACKAGES.find((p) => p.id === selectedPkgId) || CORPORATE_PACKAGES[1];

  const safeQty = Math.max(5, Number(quantity) || 5);
  const discountRate = getVolumeDiscountRate(safeQty);
  const grossTotal = selectedPackage.unitPrice * safeQty;
  const discountAmount = Math.round(grossTotal * discountRate);
  const netTotal = grossTotal - discountAmount;

  const handleSelectPackage = (pkgId) => {
    setSelectedPkgId(pkgId);
    setSubmittedQuote(null);
    const el = document.getElementById("corporate-quote-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    const quoteCode = `B2B-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const record = {
      quoteCode,
      packageName: selectedPackage.name,
      quantity: safeQty,
      discountPercent: Math.round(discountRate * 100),
      netTotal,
      companyName: companyName.trim(),
      taxCode: taxCode.trim() || "Cung cấp khi ký hợp đồng",
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const prev = JSON.parse(localStorage.getItem("skylink_corporate_quotes") || "[]");
      localStorage.setItem("skylink_corporate_quotes", JSON.stringify([record, ...prev]));
    } catch {
      // ignore storage error
    }
    setSubmittedQuote(record);
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
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.85) 46%, rgba(225,241,255,0.25) 100%)",
            }}
          />
          <img
            src={HERO_CORPORATE_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "60%",
              objectPosition: "center 35%",
              opacity: 0.84,
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
                  className="text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  SKYLINK FOR BUSINESS • GIẢI PHÁP QUÀ TẶNG B2B
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
                  Quà Tặng Doanh Nghiệp
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  Nâng tầm đẳng cấp tri ân đối tác, khách hàng VIP và đội ngũ nhân sự xuất sắc với
                  thẻ bay SkyLink Gift Card & E-Voucher chính hãng.
                </p>
              </div>

              <a
                href="#corporate-quote-form"
                className="inline-flex w-fit items-center gap-2 px-5 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(90deg, #0a58ca 0%, #1d75f2 100%)",
                  boxShadow: "0 10px 24px rgba(13, 97, 225, 0.34)",
                  borderRadius: 9999,
                  textDecoration: "none",
                }}
              >
                <Briefcase size={17} weight="fill" />
                <span>Nhận báo giá chiết khấu B2B</span>
                <ArrowRight size={14} weight="bold" />
              </a>
            </div>
          </header>

          {/* 4 B2B TRUST PILLARS BAR */}
          <section
            aria-label="Ưu đãi dành cho doanh nghiệp"
            className="mb-7"
            style={{
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
              borderRadius: 20,
              padding: "14px 20px",
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <Percent size={20} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Chiết khấu đến 15%
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Theo số lượng đặt hàng B2B
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:border-l lg:border-blue-100 lg:pl-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <Sparkle size={20} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    In logo doanh nghiệp
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Thiết kế thẻ & hộp quà riêng
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:border-l lg:border-blue-100 lg:pl-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <Receipt size={20} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Xuất hóa đơn VAT
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Đầy đủ hợp đồng & chứng từ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:border-l lg:border-blue-100 lg:pl-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#ecfdf5", color: "#15803d" }}
                >
                  <ShieldCheck size={20} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Hạn dùng 12 tháng
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Áp dụng mọi chặng bay SkyLink
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3-COLUMN GIFT CARD PACKAGES */}
          <section aria-label="Các gói quà tặng doanh nghiệp" className="mb-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {CORPORATE_PACKAGES.map((pkg, idx) => {
                const isSelected = pkg.id === selectedPkgId;
                return (
                  <motion.article
                    key={pkg.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex flex-col overflow-hidden bg-white transition duration-300 hover:-translate-y-1"
                    style={{
                      borderRadius: 24,
                      border:
                        pkg.popular || isSelected
                          ? "2px solid #1d75f2"
                          : "1px solid rgba(255,255,255,0.98)",
                      boxShadow: pkg.popular
                        ? "0 18px 40px rgba(13, 94, 215, 0.16)"
                        : "0 14px 34px rgba(21, 64, 138, 0.09)",
                    }}
                  >
                    {/* Premium Vector Gift Card Preview */}
                    <div className="p-4 pb-0">
                      <div
                        className="relative overflow-hidden p-5 text-white"
                        style={{
                          height: 162,
                          borderRadius: 18,
                          background: pkg.cardGradient,
                          boxShadow: "0 10px 24px rgba(9, 34, 86, 0.24)",
                        }}
                      >
                        {/* Subtle circular light decoration */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full"
                          style={{ background: "rgba(255,255,255,0.12)" }}
                        />
                        <div className="relative flex h-full flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-wide">
                              <AirplaneTilt size={16} weight="fill" />
                              SKYLINK GIFT CARD
                            </span>
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold"
                              style={{ background: "rgba(255,255,255,0.2)" }}
                            >
                              {pkg.discountLabel}
                            </span>
                          </div>

                          <div>
                            <p
                              className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100"
                              style={{ margin: 0 }}
                            >
                              {pkg.tierTag}
                            </p>
                            <p
                              className="mt-1 text-xl font-black tracking-tight text-white"
                              style={{ margin: "4px 0 0 0" }}
                            >
                              {currency.format(pkg.unitPrice)}
                              <span className="ml-1 text-xs font-semibold text-blue-100">/ thẻ</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Details */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
                          style={{ background: pkg.badgeBg, color: pkg.badgeColor }}
                        >
                          {pkg.popular ? <Crown size={12} weight="fill" /> : <Gift size={12} weight="fill" />}
                          {pkg.badge}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Tối thiểu {pkg.minQty} thẻ
                        </span>
                      </div>

                      <h2
                        className="text-base font-black text-[#092152]"
                        style={{ margin: "4px 0 4px 0" }}
                      >
                        {pkg.name}
                      </h2>
                      <p className="mb-4 text-xs font-semibold text-[#556f96]" style={{ margin: "0 0 14px 0" }}>
                        {pkg.subtitle}
                      </p>

                      <ul
                        className="mb-5 flex-1 space-y-2.5"
                        style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}
                      >
                        {pkg.benefits.map((b, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-[#253e6b]"
                          >
                            <CheckCircle
                              size={16}
                              weight="fill"
                              className="mt-0.5 shrink-0"
                              style={{ color: pkg.popular ? "#0b5ed7" : "#16a34a" }}
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={() => handleSelectPackage(pkg.id)}
                        className="inline-flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold transition hover:-translate-y-0.5"
                        style={
                          pkg.popular
                            ? {
                                background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                                color: "#ffffff",
                                boxShadow: "0 8px 18px rgba(13, 94, 215, 0.28)",
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
                        <span>Chọn gói & Nhận báo giá</span>
                        <ArrowRight size={13} weight="bold" />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* B2B QUOTE CALCULATOR & CONTACT FORM */}
          <section
            id="corporate-quote-form"
            aria-label="Yêu cầu báo giá quà tặng doanh nghiệp"
            className="scroll-mt-24 overflow-hidden bg-white shadow-sm"
            style={{
              borderRadius: 26,
              border: "1px solid rgba(255,255,255,0.98)",
              boxShadow: "0 16px 40px rgba(20, 62, 132, 0.10)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Blue Panel: Live Price Estimator & Corporate Desk Info */}
              <div
                className="flex flex-col justify-between p-6 text-white sm:p-8 lg:col-span-5"
                style={{
                  background: "linear-gradient(145deg, #09255e 0%, #0b52c4 60%, #1d78f0 100%)",
                }}
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold">
                    <Briefcase size={14} weight="fill" />
                    SkyLink Corporate Desk
                  </span>
                  <h2
                    className="mt-3 text-2xl font-black text-white"
                    style={{ margin: "12px 0 8px 0" }}
                  >
                    Dự toán nhanh & Nhận báo giá B2B
                  </h2>
                  <p className="text-xs font-medium leading-relaxed text-blue-100" style={{ margin: "0 0 20px 0" }}>
                    Đội ngũ phụ trách khách hàng doanh nghiệp SkyLink sẽ gửi báo giá chính thức,
                    mẫu thiết kế in logo và dự thảo hợp đồng trong vòng 2 giờ làm việc.
                  </p>

                  {/* Live B2B Calculator Box */}
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "1px solid rgba(255, 255, 255, 0.22)",
                    }}
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-100" style={{ margin: "0 0 10px 0" }}>
                      Ước tính tạm tính ({selectedPackage.name})
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-100">Đơn giá × Số lượng</span>
                        <span className="font-bold">
                          {currency.format(selectedPackage.unitPrice)} × {safeQty} thẻ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-100">
                          Chiết khấu số lượng ({Math.round(discountRate * 100)}%)
                        </span>
                        <span className="font-extrabold text-emerald-300">
                          – {currency.format(discountAmount)}
                        </span>
                      </div>
                      <div
                        className="flex items-baseline justify-between pt-2.5"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
                      >
                        <span className="font-bold text-white">Tổng dự kiến (đã gồm VAT)</span>
                        <strong className="text-lg font-black text-amber-300">
                          {currency.format(netTotal)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct B2B Contact Info */}
                <div className="mt-6 space-y-2.5 pt-4 text-xs text-blue-100" style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}>
                  <div className="flex items-center gap-2.5">
                    <EnvelopeSimple size={16} weight="fill" className="text-amber-300" />
                    <span>Email B2B: <strong className="text-white">corporate@skylink.vn</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <PhoneCall size={16} weight="fill" className="text-amber-300" />
                    <span>Hotline Doanh Nghiệp: <strong className="text-white">1900 1234 (nhánh 3)</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Headset size={16} weight="fill" className="text-amber-300" />
                    <span>Hỗ trợ in mẫu & giao thẻ tận văn phòng toàn quốc</span>
                  </div>
                </div>
              </div>

              {/* Right White Panel: Quote Request Form */}
              <div className="p-6 sm:p-8 lg:col-span-7">
                {submittedQuote ? (
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle size={28} weight="fill" className="shrink-0 text-emerald-600" />
                      <div>
                        <h3 className="text-base font-black text-emerald-950" style={{ margin: 0 }}>
                          Đã tiếp nhận yêu cầu báo giá doanh nghiệp!
                        </h3>
                        <p className="mt-1.5 text-xs font-semibold leading-relaxed text-emerald-800" style={{ margin: "6px 0 0 0" }}>
                          Mã hồ sơ B2B: <strong>{submittedQuote.quoteCode}</strong>
                          <br />
                          Doanh nghiệp: <strong>{submittedQuote.companyName}</strong> (MST:{" "}
                          <strong>{submittedQuote.taxCode}</strong>)
                          <br />
                          Gói đăng ký: <strong>{submittedQuote.packageName}</strong> ×{" "}
                          <strong>{submittedQuote.quantity} thẻ</strong> (Chiết khấu{" "}
                          <strong>{submittedQuote.discountPercent}%</strong>)
                          <br />
                          Tổng tạm tính: <strong>{currency.format(submittedQuote.netTotal)}</strong>
                        </p>
                        <p className="mt-2 text-xs text-emerald-700" style={{ margin: "8px 0 0 0" }}>
                          Chuyên viên SkyLink Corporate Desk sẽ liên hệ{" "}
                          <strong>{submittedQuote.contactName}</strong> ({submittedQuote.phone}) và
                          gửi báo giá PDF qua <strong>{submittedQuote.email}</strong> trong vòng 2
                          giờ làm việc.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSubmittedQuote(null)}
                        className="px-5 py-2 text-xs font-extrabold text-white"
                        style={{
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                          borderRadius: 9999,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Tạo yêu cầu báo giá khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitQuote} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-[#092152]" style={{ margin: 0 }}>
                        Thông tin doanh nghiệp đăng ký
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-[#556f96]" style={{ margin: "4px 0 0 0" }}>
                        Chọn gói quà tặng, số lượng thẻ và để lại thông tin để nhận báo giá chiết khấu
                        tốt nhất.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Gói quà tặng quan tâm
                        </label>
                        <div className="relative flex items-center">
                          <Ticket
                            size={15}
                            className="pointer-events-none absolute left-3 text-blue-600"
                          />
                          <select
                            value={selectedPkgId}
                            onChange={(e) => setSelectedPkgId(e.target.value)}
                            className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pl-9 pr-3 text-xs font-bold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                          >
                            {CORPORATE_PACKAGES.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({currency.format(p.unitPrice)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Số lượng thẻ dự kiến (tối thiểu 5 thẻ)
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={5000}
                          required
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Tên công ty / Tổ chức *
                        </label>
                        <div className="relative flex items-center">
                          <Buildings
                            size={15}
                            className="pointer-events-none absolute left-3 text-blue-600"
                          />
                          <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="VD: Công ty TNHH ABC Việt Nam"
                            className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Mã số thuế (xuất hóa đơn VAT)
                        </label>
                        <input
                          type="text"
                          value={taxCode}
                          onChange={(e) => setTaxCode(e.target.value)}
                          placeholder="VD: 0101234567"
                          className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Người liên hệ *
                        </label>
                        <div className="relative flex items-center">
                          <User
                            size={15}
                            className="pointer-events-none absolute left-3 text-blue-600"
                          />
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Họ và tên"
                            className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0901 234 567"
                          className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Email doanh nghiệp *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hr@company.vn"
                          className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Yêu cầu bổ sung (in logo, thời gian nhận thẻ...)
                      </label>
                      <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="VD: Cần in logo công ty trên hộp quà và giao trước ngày 25/12..."
                        className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                        style={{
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                          boxShadow: "0 10px 22px rgba(13, 94, 215, 0.30)",
                          borderRadius: 9999,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <span>Gửi yêu cầu báo giá B2B</span>
                        <PaperPlaneRight size={16} weight="bold" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

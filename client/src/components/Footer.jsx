import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  EnvelopeSimple,
  MapPin,
  ShieldCheck,
  Lock,
  CheckCircle,
} from "@phosphor-icons/react";
import SkyLinkLogo from "./SkyLinkLogo";

// Official Crisp Inline SVG Logos (zero broken Windows font glyphs)
const VisaLogo = () => (
  <div
    className="flex h-7 items-center justify-center bg-white px-2.5 shadow-xs"
    style={{ borderRadius: 6 }}
  >
    <svg className="h-3.5 w-auto" viewBox="0 0 50 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.123 1.258L12.55 15.242H8.225L5.02 3.822C4.825 3.09 4.654 2.824 4.07 2.502C3.12 1.996 1.636 1.517 0.28 1.226L0.378 0.772H7.073C7.948 0.772 8.73 1.353 8.925 2.348L10.63 11.458L14.862 0.772H19.123V1.258ZM36.035 10.457C36.05 6.47 30.505 6.25 30.544 4.456C30.56 3.918 31.085 3.336 32.228 3.184C32.793 3.109 34.364 3.048 36.094 3.844L36.782 0.627C35.836 0.284 34.618 0 33.09 0C29.07 0 26.216 2.128 26.19 5.176C26.155 7.432 28.175 8.694 29.718 9.444C31.302 10.213 31.835 10.71 31.825 11.403C31.81 12.464 30.549 12.929 29.385 12.946C27.327 12.977 26.128 12.39 25.174 11.947L24.464 15.263C25.429 15.706 27.218 16.082 29.066 16.102C33.328 16.102 36.022 13.996 36.035 10.457ZM46.545 15.242H50.316L46.995 0.772H43.486C42.707 0.772 42.046 1.226 41.764 1.895L35.666 15.242H39.873L40.71 12.916H45.864L46.545 15.242ZM41.875 9.878L44.013 3.998L45.241 9.878H41.875ZM25.076 0.772L21.674 15.242H17.653L21.055 0.772H25.076Z" fill="#1434CB" />
    </svg>
  </div>
);

const MastercardLogo = () => (
  <div
    className="flex h-7 items-center justify-center bg-white px-2 shadow-xs"
    style={{ borderRadius: 6 }}
  >
    <svg className="h-4 w-auto" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="11" r="9" fill="#EB001B" />
      <circle cx="23" cy="11" r="9" fill="#F79E1B" />
      <path d="M18 4.39A9 9 0 0013 11a9 9 0 005 6.61A9 9 0 0023 11a9 9 0 00-5-6.61z" fill="#FF5F00" />
    </svg>
  </div>
);

const VnpayLogo = () => (
  <div
    className="flex h-7 items-center justify-center px-2.5 font-black tracking-wide"
    style={{ borderRadius: 6, background: "#005BAA", fontSize: 11.5 }}
  >
    <span style={{ color: "#ffffff" }}>VN</span>
    <span style={{ color: "#ff3b4e" }}>PAY</span>
  </div>
);

const MomoLogo = () => (
  <div
    className="flex h-7 items-center justify-center px-2.5 font-black text-white"
    style={{ borderRadius: 6, background: "#A50064", fontSize: 11 }}
  >
    MoMo
  </div>
);

const NapasLogo = () => (
  <div
    className="flex h-7 items-center justify-center px-2.5 font-black italic text-white"
    style={{ borderRadius: 6, background: "#0072BC", fontSize: 11 }}
  >
    napas
  </div>
);

const AppleIconSvg = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.67-.81 1.12-1.94.99-3.08-.96.04-2.13.64-2.82 1.45-.61.71-1.15 1.87-1.01 2.97 1.07.08 2.17-.53 2.84-1.34" />
  </svg>
);

const GooglePlaySvg = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.6 2.4C3.2 2.8 3 3.4 3 4.2V19.8C3 20.6 3.2 21.2 3.6 21.6L13.4 12L3.6 2.4Z" fill="#38BDF8" />
    <path d="M16.8 15.4L13.4 12L16.8 8.6L20.8 10.9C21.8 11.5 21.8 12.5 20.8 13.1L16.8 15.4Z" fill="#FACC15" />
    <path d="M3.6 21.6C4.1 22.1 4.9 22.1 5.9 21.5L16.8 15.4L13.4 12L3.6 21.6Z" fill="#FB7185" />
    <path d="M16.8 8.6L5.9 2.5C4.9 1.9 4.1 1.9 3.6 2.4L13.4 12L16.8 8.6Z" fill="#4ADE80" />
  </svg>
);

const ApplePayLogo = () => (
  <div
    className="flex h-7 items-center gap-1 bg-black px-2.5 text-white font-bold"
    style={{ borderRadius: 6, fontSize: 11, border: "1px solid rgba(255,255,255,0.16)" }}
  >
    <AppleIconSvg size={12} />
    <span>Pay</span>
  </div>
);

const GooglePayLogo = () => (
  <div
    className="flex h-7 items-center justify-center bg-white px-2.5 font-extrabold text-slate-700"
    style={{ borderRadius: 6, fontSize: 11 }}
  >
    <span style={{ color: "#4285F4" }}>G</span>
    <span>Pay</span>
  </div>
);

const FOOTER_LINK_STYLE = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  transition: "color 0.2s ease",
};

const COLUMN_HEADING_STYLE = {
  fontSize: 13,
  fontWeight: 800,
  color: "#ffffff",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: "0 0 14px 0",
};

const LIST_RESET_STYLE = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

export default function Footer() {
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setEmailInput("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer
      className="relative w-full overflow-hidden font-sans"
      style={{
        background: "linear-gradient(180deg, #091a3f 0%, #061330 58%, #040c21 100%)",
        color: "#cbd5e1",
        borderTop: "1px solid rgba(56, 189, 248, 0.22)",
        paddingTop: 56,
        paddingBottom: 32,
      }}
    >
      {/* Subtle Top Sky Glow Line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.65) 50%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        {/* MAIN 5-COLUMN GRID */}
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-7">
          {/* COLUMN 1: Brand & Contact (3 cols) */}
          <div className="lg:col-span-3">
            <Link
              to="/"
              className="group inline-flex items-center gap-3"
              style={{ textDecoration: "none", marginBottom: 14 }}
            >
              <SkyLinkLogo
                height={46}
                variant="dark"
                className="transition-transform group-hover:scale-105"
              />
              <span
                className="shrink-0"
                style={{
                  width: 1.5,
                  height: 34,
                  background: "linear-gradient(180deg, rgba(125,211,252,0.8) 0%, rgba(56,189,248,0.25) 100%)",
                  borderRadius: 99,
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#ffffff",
                    display: "block",
                    lineHeight: 1.05,
                    letterSpacing: "-0.3px",
                  }}
                >
                  SkyLink
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: "#7dd3fc",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                  }}
                >
                  AIRLINES
                </span>
              </div>
            </Link>

            <p style={{ fontSize: 13, lineHeight: 1.65, color: "#94a3b8", margin: "0 0 16px 0" }}>
              Hãng hàng không thế hệ mới chuẩn 5 sao quốc tế. Trải nghiệm bay đẳng cấp, kết nối
              19 điểm đến trọng điểm Việt Nam &amp; Châu Á.
            </p>

            <div className="space-y-2.5" style={{ fontSize: 12.5, color: "#cbd5e1" }}>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-sky-400" weight="fill" />
                <span>
                  Tổng đài 24/7: <strong style={{ color: "#ffffff" }}>1900 8888</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <EnvelopeSimple size={15} className="shrink-0 text-sky-400" weight="fill" />
                <span>
                  Email: <strong style={{ color: "#e2e8f0" }}>support@skylink.com</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-sky-400" weight="fill" />
                <span>SkyLink Tower, Quận Hoàn Kiếm, TP. Hà Nội</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-2.5">
              {[
                {
                  href: "https://facebook.com",
                  label: "Facebook",
                  bg: "rgba(37, 99, 235, 0.22)",
                  color: "#60a5fa",
                  path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.75 5.65c1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.77-1.61 1.56V12h2.74l-.44 3h-2.3v6.8c4.56-.93 8-4.96 8-9.8z",
                },
                {
                  href: "https://twitter.com",
                  label: "Twitter",
                  bg: "rgba(14, 165, 233, 0.22)",
                  color: "#38bdf8",
                  path: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.58 8.58 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z",
                },
                {
                  href: "https://instagram.com",
                  label: "Instagram",
                  bg: "rgba(236, 72, 153, 0.2)",
                  color: "#f472b6",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                },
              ].map((soc) => (
                <a
                  key={soc.label}
                  href={soc.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={soc.label}
                  className="flex h-9 w-9 items-center justify-center transition-transform hover:scale-110"
                  style={{
                    borderRadius: 9999,
                    background: soc.bg,
                    color: soc.color,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d={soc.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2: Dịch vụ bay (2 cols) */}
          <div className="lg:col-span-2">
            <h4 style={COLUMN_HEADING_STYLE}>Dịch vụ bay</h4>
            <ul style={LIST_RESET_STYLE}>
              {[
                { to: "/flights", label: "Tìm & Đặt vé máy bay" },
                { to: "/services/esim-lounge", label: "eSIM 5G & SkyLounge" },
                { to: "/services/transfer", label: "Đưa đón sân bay VIP" },
                { to: "/services/meals", label: "Suất ăn cao cấp" },
                { to: "/services/insurance", label: "Bảo hiểm du lịch" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={FOOTER_LINK_STYLE}
                    className="group hover:!text-sky-300"
                  >
                    <span className="text-sky-400 transition-transform group-hover:translate-x-0.5">›</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Hội viên & Đặt chỗ (2 cols) */}
          <div className="lg:col-span-2">
            <h4 style={COLUMN_HEADING_STYLE}>Hội viên &amp; Đặt chỗ</h4>
            <ul style={LIST_RESET_STYLE}>
              {[
                { to: "/skyclub", label: "Hội viên SkyClub" },
                { to: "/promotions", label: "Ưu đãi vé bay" },
                { to: "/my-bookings", label: "Quản lý vé của tôi" },
                { to: "/check-in", label: "Check-in trực tuyến" },
                { to: "/flight-status", label: "Tình trạng chuyến bay" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={FOOTER_LINK_STYLE}
                    className="group hover:!text-sky-300"
                  >
                    <span className="text-sky-400 transition-transform group-hover:translate-x-0.5">›</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: Quy định & An toàn (2 cols) */}
          <div className="lg:col-span-2">
            <h4 style={COLUMN_HEADING_STYLE}>Quy định &amp; An toàn</h4>
            <ul style={LIST_RESET_STYLE}>
              {[
                { to: "/flight-guide/baggage", label: "Quy định hành lý" },
                { to: "/flight-guide/documents", label: "Giấy tờ tùy thân" },
                { to: "/flight-guide/procedures", label: "Thủ tục tại sân bay" },
                { to: "/flight-safety/policy", label: "Chính sách an toàn bay" },
                { to: "/support", label: "Trung tâm hỗ trợ 24/7" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={FOOTER_LINK_STYLE}
                    className="group hover:!text-sky-300"
                  >
                    <span className="text-sky-400 transition-transform group-hover:translate-x-0.5">›</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5: Newsletter & App Card (3 cols) */}
          <div className="lg:col-span-3">
            <div
              className="p-5"
              style={{
                borderRadius: 20,
                background: "rgba(17, 36, 78, 0.72)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                boxShadow: "0 12px 28px rgba(0, 0, 0, 0.22)",
              }}
            >
              <h4 style={{ ...COLUMN_HEADING_STYLE, marginBottom: 8 }}>Đăng ký nhận ưu đãi</h4>
              <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "#94a3b8", margin: "0 0 14px 0" }}>
                Nhận ngay mã giảm giá độc quyền và thông báo mở bán vé sớm từ SkyLink.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Địa chỉ email của bạn..."
                  required
                  style={{
                    width: "100%",
                    background: "rgba(6, 19, 48, 0.85)",
                    border: "1px solid rgba(125, 211, 252, 0.28)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#ffffff",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 font-extrabold text-white transition hover:brightness-110"
                  style={{
                    background: "linear-gradient(90deg, #06b6d4 0%, #1d75f2 100%)",
                    borderRadius: 12,
                    border: "none",
                    padding: "10px 16px",
                    fontSize: 13,
                    boxShadow: "0 6px 18px rgba(14, 165, 233, 0.3)",
                  }}
                >
                  {subscribed ? (
                    <>
                      <CheckCircle size={16} weight="fill" />
                      <span>Đã đăng ký thành công!</span>
                    </>
                  ) : (
                    <span>Đăng ký ngay</span>
                  )}
                </button>
              </form>

              {/* App Store & Google Play */}
              <div className="mt-4 border-t border-slate-700/60 pt-3.5">
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#94a3b8",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Tải ứng dụng SkyLink:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="flex cursor-pointer items-center justify-center gap-2 bg-slate-950/90 px-2.5 py-2 text-white transition hover:bg-slate-900"
                    style={{ borderRadius: 10, border: "1px solid rgba(148, 163, 184, 0.28)" }}
                  >
                    <AppleIconSvg size={16} />
                    <div className="text-left leading-tight">
                      <span style={{ fontSize: 8, color: "#94a3b8", display: "block" }}>DOWNLOAD ON</span>
                      <span style={{ fontSize: 11, fontWeight: 800 }}>App Store</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="flex cursor-pointer items-center justify-center gap-2 bg-slate-950/90 px-2.5 py-2 text-white transition hover:bg-slate-900"
                    style={{ borderRadius: 10, border: "1px solid rgba(148, 163, 184, 0.28)" }}
                  >
                    <GooglePlaySvg size={15} />
                    <div className="text-left leading-tight">
                      <span style={{ fontSize: 8, color: "#94a3b8", display: "block" }}>GET IT ON</span>
                      <span style={{ fontSize: 11, fontWeight: 800 }}>Google Play</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE BAR: Payment Methods & Security Badges */}
        <div
          className="flex flex-col items-center justify-between gap-5 py-6 lg:flex-row"
          style={{ borderTop: "1px solid rgba(148, 163, 184, 0.16)" }}
        >
          <div className="text-center lg:text-left">
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#94a3b8",
                display: "block",
                marginBottom: 8,
              }}
            >
              Chấp nhận các phương thức thanh toán an toàn:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <VisaLogo />
              <MastercardLogo />
              <VnpayLogo />
              <MomoLogo />
              <NapasLogo />
              <ApplePayLogo />
              <GooglePayLogo />
            </div>
          </div>

          <div
            className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 font-bold"
            style={{
              borderRadius: 9999,
              background: "rgba(6, 78, 59, 0.32)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              color: "#34d399",
              fontSize: 12.5,
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Lock size={14} weight="bold" />
              Thanh toán bảo mật SSL
            </span>
            <span style={{ opacity: 0.45 }}>•</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={15} weight="fill" />
              Đạt chuẩn IATA 5-Star
            </span>
          </div>
        </div>

        {/* COPYRIGHT BAR */}
        <div
          className="flex flex-col items-center justify-between gap-3 pt-5 sm:flex-row"
          style={{
            borderTop: "1px solid rgba(148, 163, 184, 0.12)",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          <p style={{ margin: 0 }}>© 2026 SkyLink Airlines Corporation. Bảo lưu mọi quyền.</p>
          <div className="flex flex-wrap items-center gap-5">
            {[
              { to: "/flight-safety/policy", label: "Điều khoản dịch vụ" },
              { to: "/flight-safety/maintenance", label: "Chính sách bảo mật" },
              { to: "/flight-guide/baggage", label: "Quy định vận chuyển" },
              { to: "/support", label: "Liên hệ" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}
                className="hover:!text-sky-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

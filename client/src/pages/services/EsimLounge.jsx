import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  WifiHigh,
  Crown,
  GlobeHemisphereEast,
  Lightning,
  CheckCircle,
  Coffee,
  Shower,
  DeviceMobile,
  QrCode,
  Sparkle,
  ShieldCheck,
  X,
  ArrowRight,
  Clock,
} from "@phosphor-icons/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const HERO_ESIM_BG_URL =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

const ESIM_PLANS = [
  {
    id: "cn",
    region: "Trung Quốc (Bắc Kinh, Thượng Hải...)",
    badge: "Không chặn Google / Zalo",
    network: "China Unicom / China Mobile 5G",
    image:
      "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=900&q=85",
    tiers: [
      { days: 5, data: "1GB/ngày tốc độ cao", price: 249000 },
      { days: 10, data: "2GB/ngày tốc độ cao", price: 469000 },
      { days: 15, data: "Không giới hạn 5G", price: 699000 },
    ],
  },
  {
    id: "sg-my",
    region: "Singapore & Malaysia (Đông Nam Á)",
    badge: "Tự động chuyển vùng 2 nước",
    network: "Singtel / Maxis 5G",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=85",
    tiers: [
      { days: 5, data: "1GB/ngày tốc độ cao", price: 189000 },
      { days: 10, data: "2GB/ngày tốc độ cao", price: 349000 },
      { days: 15, data: "Không giới hạn 5G", price: 529000 },
    ],
  },
  {
    id: "kr",
    region: "Hàn Quốc (Seoul – Incheon)",
    badge: "Bán chạy nhất",
    network: "SK Telecom / KT 5G",
    image:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=900&q=85",
    tiers: [
      { days: 5, data: "1GB/ngày tốc độ cao", price: 229000 },
      { days: 10, data: "2GB/ngày tốc độ cao", price: 429000 },
      { days: 15, data: "Không giới hạn 5G", price: 649000 },
    ],
  },
  {
    id: "jp",
    region: "Nhật Bản (Tokyo – Narita)",
    badge: "Phủ sóng toàn quốc 5G",
    network: "NTT Docomo / SoftBank 5G",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=85",
    tiers: [
      { days: 5, data: "1GB/ngày tốc độ cao", price: 259000 },
      { days: 10, data: "2GB/ngày tốc độ cao", price: 489000 },
      { days: 15, data: "Không giới hạn 5G", price: 729000 },
    ],
  },
  {
    id: "kh",
    region: "Campuchia (Phnom Penh)",
    badge: "Kích hoạt tức thì 1 phút",
    network: "Smart Axiata / Metfone 4G+",
    image:
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=85",
    tiers: [
      { days: 5, data: "1GB/ngày tốc độ cao", price: 159000 },
      { days: 10, data: "2GB/ngày tốc độ cao", price: 299000 },
      { days: 15, data: "Không giới hạn 4G+", price: 449000 },
    ],
  },
];

const LOUNGE_PASSES = [
  {
    id: "han-t2",
    name: "SkyLounge Quốc tế Nội Bài (HAN – Nhà ga T2)",
    airport: "HAN • Tầng 4 Khu cách ly Quốc tế",
    hours: "05:00 – 01:30 hàng ngày (tối đa 3 giờ)",
    price: 590000,
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=85",
    perks: ["Buffet nóng Á – Âu & Phở Hà Nội", "Phòng tắm & ghế massage", "Wi-Fi tốc độ cao & khu làm việc"],
  },
  {
    id: "sgn-t2",
    name: "SkyLounge Tân Sơn Nhất (SGN – T1 & T2)",
    airport: "SGN • Khu cách ly Nội địa & Quốc tế",
    hours: "Mở cửa 24/7 (tối đa 3 giờ)",
    price: 550000,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85",
    perks: ["Ẩm thực nóng & quầy rượu vang", "Không gian yên tĩnh nhìn đường băng", "Ưu tiên bảng thông báo cửa bay"],
  },
  {
    id: "dad-pqc",
    name: "SkyLounge Đà Nẵng & Phú Quốc (DAD / PQC)",
    airport: "DAD / PQC • Khu cách ly khởi hành",
    hours: "05:30 – 23:30 hàng ngày (tối đa 3 giờ)",
    price: 490000,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=85",
    perks: ["Đặc sản miền Trung & nước ép tươi", "Khu vực thư giãn gia đình", "Ổ cắm sạc đa chuẩn tại mọi ghế"],
  },
  {
    id: "intl-vip",
    name: "Partner VIP Lounge Quốc tế (SIN / ICN / NRT / PVG)",
    airport: "Changi • Incheon • Narita • Phố Đông",
    hours: "Mở cửa 24/7 theo lịch bay quốc tế",
    price: 950000,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=85",
    perks: ["Buffet quốc tế 5 sao & quầy Bar", "Phòng tắm riêng kèm bộ tiện ích", "Phòng nghỉ ngả lưng yên tĩnh"],
  },
];

const formatVnd = (n) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;

export default function EsimLounge() {
  const [activeTab, setActiveTab] = useState("esim"); // "esim" | "lounge"
  const [selectedDays, setSelectedDays] = useState(5);
  const [bookings, setBookings] = useState([]);

  const [modalItem, setModalItem] = useState(null);
  const [selectedPnr, setSelectedPnr] = useState("");
  const [contactEmail, setContactEmail] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.email || "";
    } catch {
      return "";
    }
  });
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) return;
    axios
      .get("/api/bookings", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const paid = list.filter((b) => (b.status || "").toLowerCase() === "paid" && b.pnr_code);
        setBookings(paid);
        if (paid[0]?.pnr_code) setSelectedPnr(paid[0].pnr_code);
      })
      .catch(() => {});
  }, []);

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    if (!modalItem) return;
    const prefix = modalItem.kind === "esim" ? "SKY-ESIM" : "SKY-LNG";
    const code = `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setConfirmation({
      code,
      title: modalItem.title,
      price: modalItem.price,
      pnr: selectedPnr || "Đặt lẻ không gắn PNR",
      email: contactEmail || "Đã lưu trên tài khoản SkyLink",
      kind: modalItem.kind,
    });
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
            src={HERO_ESIM_BG_URL}
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
                  <Sparkle size={15} weight="fill" />
                  SKYLINK AIRLINES • TIỆN ÍCH BAY QUỐC TẾ &amp; VIP
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
                  eSIM Du lịch 5G &amp; Phòng chờ SkyLounge
                </h1>
                <p className="max-w-2xl text-xs font-semibold text-[#2d4b7a] sm:text-sm" style={{ margin: 0 }}>
                  Kết nối Internet 5G ngay khi máy bay vừa hạ cánh tại Trung Quốc, Singapore, Hàn Quốc,
                  Nhật Bản, Malaysia, Campuchia — hoặc thư giãn đẳng cấp tại Phòng chờ Thương gia trước giờ bay.
                </p>
              </div>
            </div>
          </header>

          {/* Main Tab Pill Bar */}
          <div
            className="mb-7 flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.92)",
              borderRadius: 9999,
              border: "1px solid #ffffff",
              boxShadow: "0 12px 28px rgba(18, 60, 130, 0.08)",
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "esim", label: "eSIM Du lịch 5G", icon: WifiHigh },
                { id: "lounge", label: "Phòng chờ SkyLounge", icon: Crown },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-xs font-extrabold transition"
                    style={
                      active
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            borderRadius: 9999,
                            border: "none",
                            boxShadow: "0 6px 16px rgba(13, 97, 225, 0.28)",
                          }
                        : {
                            background: "transparent",
                            color: "#1e3f77",
                            borderRadius: 9999,
                            border: "none",
                          }
                    }
                  >
                    <Icon size={16} weight="fill" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === "esim" && (
              <div className="flex items-center gap-1.5 pr-1">
                <span className="text-[11px] font-bold text-slate-500">Thời hạn:</span>
                {[5, 10, 15].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setSelectedDays(days)}
                    className="cursor-pointer px-3 py-1.5 text-xs font-extrabold transition"
                    style={
                      selectedDays === days
                        ? {
                            background: "#0b4fd0",
                            color: "#ffffff",
                            borderRadius: 9999,
                            border: "none",
                          }
                        : {
                            background: "#eef5ff",
                            color: "#163d7a",
                            borderRadius: 9999,
                            border: "1px solid #d5e6fc",
                          }
                    }
                  >
                    {days} ngày
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB 1: eSIM DU LỊCH QUỐC TẾ */}
          {activeTab === "esim" ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ESIM_PLANS.map((plan) => {
                const tier = plan.tiers.find((t) => t.days === selectedDays) || plan.tiers[0];
                return (
                  <article
                    key={plan.id}
                    className="flex flex-col overflow-hidden bg-white transition hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      borderRadius: 24,
                      border: "1px solid #d5e6fc",
                      boxShadow: "0 12px 28px rgba(18, 60, 130, 0.08)",
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={plan.image}
                        alt={plan.region}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                      <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black text-white"
                        style={{
                          background: "rgba(11, 79, 208, 0.90)",
                          borderRadius: 9999,
                        }}
                      >
                        <Lightning size={12} weight="fill" />
                        {plan.badge}
                      </span>
                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                        <p className="text-[11px] font-bold text-sky-200">{plan.network}</p>
                        <h3 className="text-base font-black leading-snug">{plan.region}</h3>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5">
                      <ul className="space-y-2 text-xs font-semibold text-[#33507f]">
                        <li className="flex items-center gap-2">
                          <CheckCircle size={15} weight="fill" className="shrink-0 text-emerald-600" />
                          <span>Gói {tier.days} ngày • {tier.data}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <DeviceMobile size={15} weight="fill" className="shrink-0 text-blue-600" />
                          <span>Quét mã QR cài đặt 1 phút, không cần tháo SIM gốc</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <GlobeHemisphereEast size={15} weight="fill" className="shrink-0 text-blue-600" />
                          <span>Hỗ trợ chia sẻ Hotspot không giới hạn</span>
                        </li>
                      </ul>

                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                        <div>
                          <span className="block text-[10px] font-bold uppercase text-slate-400">
                            Trọn gói {tier.days} ngày
                          </span>
                          <strong className="text-lg font-black text-[#0b4fd0]">
                            {formatVnd(tier.price)}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmation(null);
                            setModalItem({
                              kind: "esim",
                              title: `eSIM ${plan.region} (${tier.days} ngày - ${tier.data})`,
                              price: tier.price,
                            });
                          }}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-extrabold text-white transition hover:brightness-105"
                          style={{
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            borderRadius: 9999,
                            border: "none",
                            padding: "10px 18px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span>Mua eSIM</span>
                          <ArrowRight size={13} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* TAB 2: PHÒNG CHỜ THƯƠNG GIA SKYLOUNGE */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {LOUNGE_PASSES.map((lounge) => (
                <article
                  key={lounge.id}
                  className="flex flex-col overflow-hidden bg-white transition hover:-translate-y-1 hover:shadow-lg sm:flex-row"
                  style={{
                    borderRadius: 24,
                    border: "1px solid #d5e6fc",
                    boxShadow: "0 12px 28px rgba(18, 60, 130, 0.08)",
                  }}
                >
                  <div className="relative h-48 shrink-0 sm:h-auto sm:w-48">
                    <img
                      src={lounge.image}
                      alt={lounge.name}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className="absolute left-3 top-3 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-amber-950"
                      style={{ background: "#fde68a", borderRadius: 9999 }}
                    >
                      <Crown size={12} weight="fill" /> VIP Lounge
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="text-[11px] font-extrabold text-blue-600">{lounge.airport}</p>
                      <h3 className="mt-0.5 text-base font-black text-[#091e47]">{lounge.name}</h3>
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Clock size={13} /> {lounge.hours}
                      </p>

                      <ul className="mt-3 space-y-1.5 text-xs font-semibold text-[#33507f]">
                        {lounge.perks.map((perk, idx) => (
                          <li key={perk} className="flex items-center gap-2">
                            {idx === 0 ? (
                              <Coffee size={14} weight="fill" className="shrink-0 text-amber-600" />
                            ) : idx === 1 ? (
                              <Shower size={14} weight="fill" className="shrink-0 text-blue-600" />
                            ) : (
                              <WifiHigh size={14} weight="bold" className="shrink-0 text-emerald-600" />
                            )}
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">
                          Vé vào cửa / khách
                        </span>
                        <strong className="text-lg font-black text-[#0b4fd0]">
                          {formatVnd(lounge.price)}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmation(null);
                          setModalItem({
                            kind: "lounge",
                            title: lounge.name,
                            price: lounge.price,
                          });
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold text-white transition hover:brightness-105"
                        style={{
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                          borderRadius: 9999,
                          border: "none",
                        }}
                      >
                        <span>Đặt vé Lounge</span>
                        <ArrowRight size={13} weight="bold" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Đặt eSIM / Phòng chờ */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {modalItem.kind === "esim" ? <QrCode size={20} weight="fill" /> : <Crown size={20} weight="fill" />}
                </div>
                <h3 className="text-base font-black text-[#091e47]">
                  {confirmation ? "Xác nhận thành công!" : "Đăng ký tiện ích SkyLink"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalItem(null);
                  setConfirmation(null);
                }}
                className="cursor-pointer rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {confirmation ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle size={34} weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Mã kích hoạt điện tử</p>
                  <p className="mt-0.5 font-mono text-xl font-black text-[#0b4fd0]">
                    {confirmation.code}
                  </p>
                </div>
                <div className="space-y-1.5 rounded-2xl border border-blue-100 bg-[#f4f9ff] p-4 text-left text-xs font-semibold text-[#163d7a]">
                  <p>
                    <strong>Dịch vụ:</strong> {confirmation.title}
                  </p>
                  <p>
                    <strong>Mã PNR gắn kèm:</strong> {confirmation.pnr}
                  </p>
                  <p>
                    <strong>Email nhận QR:</strong> {confirmation.email}
                  </p>
                  <p>
                    <strong>Tổng chi phí:</strong>{" "}
                    <span className="font-black text-[#0b4fd0]">{formatVnd(confirmation.price)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalItem(null);
                    setConfirmation(null);
                  }}
                  className="w-full cursor-pointer py-3 text-xs font-black text-white"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                    border: "none",
                  }}
                >
                  Hoàn tất
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-[#f4f9ff] p-3.5 text-xs">
                  <p className="font-black text-[#091e47]">{modalItem.title}</p>
                  <p className="mt-1 font-extrabold text-[#0b4fd0]">
                    Giá: {formatVnd(modalItem.price)}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-[#163d7a]">
                    Gắn vào Mã đặt chỗ (PNR) của bạn (Tuỳ chọn)
                  </label>
                  {bookings.length > 0 ? (
                    <select
                      value={selectedPnr}
                      onChange={(e) => setSelectedPnr(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="">Đặt lẻ không gắn PNR</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.pnr_code}>
                          {b.pnr_code} ({b.flight?.departure_airport?.code || "SGN"} →{" "}
                          {b.flight?.arrival_airport?.code || "HAN"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedPnr}
                      onChange={(e) => setSelectedPnr(e.target.value.toUpperCase())}
                      placeholder="Nhập mã PNR nếu có (VD: BQCV0E)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs font-bold uppercase text-slate-800 outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-[#163d7a]">
                    Email nhận mã QR kích hoạt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <ShieldCheck size={16} weight="fill" className="shrink-0 text-emerald-600" />
                  <span>Mã QR điện tử được cấp ngay lập tức, hoàn hủy miễn phí trước khi kích hoạt.</span>
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer py-3 text-xs font-black text-white shadow-md transition hover:brightness-105"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                    borderRadius: 9999,
                    border: "none",
                  }}
                >
                  Xác nhận &amp; Nhận mã QR ngay
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  CaretDown,
  CaretUp,
  CheckCircle,
  Clock,
  EnvelopeSimple,
  EnvelopeSimpleOpen,
  ForkKnife,
  Headset,
  MagnifyingGlass,
  PaperPlaneRight,
  PhoneCall,
  ShieldCheck,
  Sparkle,
  SuitcaseRolling,
  Ticket,
  User,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_SUPPORT_BG_URL =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=85";

const FAQ_DATA = [
  {
    id: "booking",
    category: "Quản lý đặt vé",
    icon: Ticket,
    desc: "Hoàn vé, đổi chuyến bay, sai thông tin hành khách.",
    questions: [
      {
        q: "Tôi có thể đổi ngày bay hoặc hủy vé sau khi đã thanh toán không?",
        a: "Có. Bạn vào mục 'Chuyến bay của tôi', chọn mã đặt chỗ (PNR) cần thay đổi và bấm 'Đổi chuyến bay' hoặc 'Hủy vé' trước giờ khởi hành. Phí đổi/hoàn áp dụng theo điều kiện hạng vé.",
      },
      {
        q: "Làm sao để làm thủ tục trực tuyến (Online Check-in)?",
        a: "Online Check-in mở từ 24 giờ đến 2 giờ trước giờ khởi hành. Bạn chỉ cần nhập Mã đặt chỗ (PNR) và họ hành khách tại trang Check-in để chọn ghế và nhận Thẻ lên máy bay điện tử.",
      },
    ],
  },
  {
    id: "baggage",
    category: "Hành lý & Ký gửi",
    icon: SuitcaseRolling,
    desc: "Quy định kích thước, cân nặng & mua thêm hành lý.",
    questions: [
      {
        q: "Quy định hành lý xách tay tiêu chuẩn của SkyLink Airlines là bao nhiêu?",
        a: "Hành khách hạng Phổ thông được mang 01 kiện xách tay tối đa 7kg + 01 túi phụ nhỏ (tổng không quá 10kg). Hạng Thương gia được mang tối đa 2 kiện xách tay (tổng 18kg).",
      },
      {
        q: "Tôi bị thất lạc hoặc chậm hành lý khi hạ cánh thì xử lý thế nào?",
        a: "Vui lòng lập biên bản PIR ngay tại Quầy Hành lý thất lạc ở ga đến sân bay, sau đó gọi Hotline 1900 1234 hoặc gửi Ticket kèm mã PNR để SkyLink theo dõi và giao hành lý tận nơi.",
      },
    ],
  },
  {
    id: "inflight",
    category: "Dịch vụ trên chuyến bay",
    icon: ForkKnife,
    desc: "Suất ăn đặc biệt, đưa đón sân bay, bảo hiểm & khách sạn.",
    questions: [
      {
        q: "Suất ăn đặc biệt (chay, Halal, trẻ em...) có mất phí không và đặt khi nào?",
        a: "Suất ăn đặc biệt chuẩn IATA hoàn toàn MIỄN PHÍ đi kèm vé máy bay SkyLink. Bạn cần đăng ký gắn suất ăn vào mã PNR trước giờ khởi hành tối thiểu 24 giờ tại trang Bữa ăn trên chuyến bay.",
      },
      {
        q: "Hủy khách sạn hoặc thuê xe có ảnh hưởng đến vé máy bay không?",
        a: "Hoàn toàn không. Khách sạn, Trải nghiệm và Thuê xe thuộc SkyLink Travel được thanh toán và quản lý độc lập với vé máy bay của bạn.",
      },
    ],
  },
  {
    id: "skyclub",
    category: "Hội viên SkyClub & Thanh toán",
    icon: Sparkle,
    desc: "Tích dặm thưởng, nâng hạng thẻ, xuất hóa đơn VAT.",
    questions: [
      {
        q: "Làm thế nào để xuất hóa đơn VAT cho vé máy bay và dịch vụ du lịch?",
        a: "Bạn có thể gửi yêu cầu xuất hóa đơn VAT qua biểu mẫu Ticket bên trên (chọn chủ đề 'Thanh toán & Hóa đơn VAT', điền Mã PNR và Mã số thuế) trong vòng 72 giờ kể từ khi thanh toán.",
      },
      {
        q: "Tôi đã chuyển khoản VNPay/MoMo nhưng chưa thấy cập nhật trạng thái vé?",
        a: "Giao dịch thường xác nhận trong 1–3 phút. Nếu quá 15 phút chưa nhận email xác nhận, vui lòng gửi mã giao dịch qua khung Chat SkyAI hoặc Hotline 1900 1234 để kiểm tra tức thì.",
      },
    ],
  },
];

const QUICK_PROMPTS = [
  "Cách đổi ngày bay / hủy vé?",
  "Quy định hành lý xách tay 7kg?",
  "Đăng ký suất ăn đặc biệt miễn phí",
  "Cách mở khóa Check-in trực tuyến",
];

function getSmartBotReply(input) {
  const q = input.toLowerCase();
  if (q.includes("hành lý") || q.includes("ký gửi") || q.includes("7kg") || q.includes("vali")) {
    return "Hành khách hạng Phổ thông được mang hành lý xách tay tối đa 7kg (+ 1 túi nhỏ), hạng Thương gia tối đa 18kg. Bạn có thể xem chi tiết tại Cẩm nang bay → Quy định hành lý hoặc gọi 1900 1234 để mua thêm hành lý ký gửi.";
  }
  if (q.includes("suất ăn") || q.includes("ăn") || q.includes("chay") || q.includes("halal")) {
    return "Suất ăn đặc biệt (VGML, MOML, GFML, BBML...) hoàn toàn MIỄN PHÍ đi kèm vé máy bay SkyLink! Bạn hãy vào Dịch vụ → Bữa ăn đặc biệt, chọn món và gắn trực tiếp vào mã PNR trước giờ bay tối thiểu 24 giờ nhé.";
  }
  if (q.includes("check-in") || q.includes("check in") || q.includes("thủ tục")) {
    return "Online Check-in mở từ 24 giờ đến 2 giờ trước giờ khởi hành. Bạn vào mục Check-in trực tuyến hoặc 'Chuyến bay của tôi', nhập mã PNR để chọn ghế và nhận Thẻ lên máy bay điện tử.";
  }
  if (q.includes("đổi") || q.includes("hủy") || q.includes("hoàn")) {
    return "Để đổi chuyến bay hoặc hủy vé, bạn mở trang 'Chuyến bay của tôi' (/my-bookings), chọn đúng mã đặt chỗ (PNR) rồi bấm 'Đổi chuyến bay' hoặc 'Hủy vé'. Nếu cần hoàn tiền gấp, hãy tạo Ticket CSKH ngay bên phải kèm mã PNR nhé!";
  }
  if (q.includes("hóa đơn") || q.includes("vat") || q.includes("thanh toán")) {
    return "SkyLink hỗ trợ thanh toán qua VNPay, MoMo và Thẻ quốc tế. Để xuất hóa đơn VAT doanh nghiệp, bạn vui lòng chọn chủ đề 'Thanh toán & Hóa đơn VAT' ở khung Gửi yêu cầu bên cạnh kèm mã PNR và MST.";
  }
  return `Cảm ơn bạn đã liên hệ SkyLink 24/7! Trợ lý SkyAI đã ghi nhận câu hỏi "${input}". Bạn có thể gửi Ticket CSKH kèm mã PNR ở khung bên cạnh hoặc gọi trực tiếp Hotline 1900 1234 để gặp tổng đài viên ngay lập tức.`;
}

export default function Support() {
  const [searchFaq, setSearchFaq] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqKey, setOpenFaqKey] = useState("booking-0");

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketPnr, setTicketPnr] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketPhone, setTicketPhone] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Live Chat State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Xin chào! Tôi là SkyAI – trợ lý hỗ trợ 24/7 của SkyLink Airlines. Bạn cần tra cứu đổi vé, hành lý, suất ăn đặc biệt hay Check-in hôm nay?",
      time: "Vừa xong",
    },
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const sendChatText = (text) => {
    const clean = text.trim();
    if (!clean) return;
    const nowTime = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [...prev, { role: "user", text: clean, time: nowTime }]);
    setChatInput("");

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: getSmartBotReply(clean),
          time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 550);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendChatText(chatInput);
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    const ticketId = `CSKH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const record = {
      ticketId,
      subject: ticketSubject,
      pnr: ticketPnr.trim() || "Không kèm PNR",
      email: ticketEmail.trim(),
      phone: ticketPhone.trim(),
      message: ticketMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const prev = JSON.parse(localStorage.getItem("skylink_support_tickets") || "[]");
      localStorage.setItem("skylink_support_tickets", JSON.stringify([record, ...prev]));
    } catch {
      // ignore storage errors
    }

    setSubmittedTicket(record);
    setTicketSubject("");
    setTicketPnr("");
    setTicketMessage("");
  };

  const filteredFaqGroups = FAQ_DATA.filter(
    (g) => activeCategory === "all" || g.id === activeCategory
  )
    .map((group) => {
      const q = searchFaq.trim().toLowerCase();
      if (!q) return group;
      return {
        ...group,
        questions: group.questions.filter(
          (item) =>
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q) ||
            group.category.toLowerCase().includes(q)
        ),
      };
    })
    .filter((group) => group.questions.length > 0);

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
                "linear-gradient(90deg, rgba(188,223,255,0.96) 0%, rgba(210,234,255,0.85) 46%, rgba(225,241,255,0.22) 100%)",
            }}
          />
          <img
            src={HERO_SUPPORT_BG_URL}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
            style={{
              width: "60%",
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
              <div style={{ maxWidth: 540 }}>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: "#0b57d0", margin: "0 0 4px 0" }}
                >
                  <Headset size={15} weight="fill" />
                  SKYLINK CARE • HỖ TRỢ KHÁCH HÀNG 24/7
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
                  Trung Tâm Trợ Giúp
                </motion.h1>
                <p
                  className="text-sm font-semibold sm:text-[15px]"
                  style={{ color: "#2d4b7a", margin: 0 }}
                >
                  Đội ngũ tư vấn viên & trợ lý SkyAI luôn sẵn sàng đồng hành giải quyết mọi yêu cầu
                  về vé máy bay, hành lý và dịch vụ 24/7.
                </p>
              </div>

              {/* Search FAQ Input */}
              <div className="w-full" style={{ maxWidth: 380 }}>
                <div
                  className="relative flex items-center bg-white/95 shadow-sm"
                  style={{
                    borderRadius: 9999,
                    border: "1px solid #cde0fc",
                    boxShadow: "0 10px 24px rgba(18, 60, 130, 0.10)",
                  }}
                >
                  <MagnifyingGlass
                    size={17}
                    weight="bold"
                    className="pointer-events-none absolute left-4 text-blue-600"
                  />
                  <input
                    type="text"
                    value={searchFaq}
                    onChange={(e) => setSearchFaq(e.target.value)}
                    placeholder="Tìm nhanh: đổi vé, hành lý, VAT, suất ăn..."
                    className="w-full bg-transparent py-3 pl-11 pr-4 text-xs font-semibold text-[#0b2559] placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* 3 DIRECT 24/7 SUPPORT CHANNELS BAR */}
          <section
            aria-label="Kênh liên hệ trực tiếp 24/7"
            className="mb-7"
            style={{
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(255, 255, 255, 0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
              borderRadius: 20,
              padding: "14px 20px",
            }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <a
                href="tel:19001234"
                className="flex items-center gap-3.5 transition hover:opacity-85"
                style={{ textDecoration: "none" }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <PhoneCall size={22} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Tổng đài 24/7:{" "}
                    <span className="text-[#0b5ed7]">1900 1234</span>
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Hỗ trợ khẩn cấp sân bay & đổi vé tức thì
                  </p>
                </div>
              </a>

              <a
                href="mailto:support@skylink.vn"
                className="flex items-center gap-3.5 transition hover:opacity-85 md:border-l md:border-blue-100 md:pl-5"
                style={{ textDecoration: "none" }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                >
                  <EnvelopeSimple size={22} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Email CSKH:{" "}
                    <span className="text-[#0b5ed7]">support@skylink.vn</span>
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Phản hồi hồ sơ hoàn vé & VAT trong 2 giờ
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-3.5 md:border-l md:border-blue-100 md:pl-5">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "#ecfdf5", color: "#15803d" }}
                >
                  <ShieldCheck size={22} weight="fill" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0b2559]" style={{ margin: 0 }}>
                    Cam kết phản hồi{" "}
                    <span className="text-emerald-700">24/7/365</span>
                  </p>
                  <p className="text-[11px] font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                    Cấp mã hồ sơ CSKH theo dõi trực tuyến
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN 2-COLUMN WORKSPACE: SKYAI LIVE CHAT (LEFT) + TICKET FORM (RIGHT) */}
          <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* SkyAI Assistant Live Chat */}
            <div
              className="flex flex-col overflow-hidden bg-white lg:col-span-7"
              style={{
                height: 540,
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.98)",
                boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
              }}
            >
              {/* Chat Header */}
              <div
                className="flex items-center justify-between px-5 py-4 text-white"
                style={{
                  background: "linear-gradient(90deg, #0a4bb8 0%, #1d75f2 100%)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                    <AirplaneTilt size={21} weight="fill" />
                  </span>
                  <div>
                    <h2 className="flex items-center gap-1.5 text-sm font-black text-white" style={{ margin: 0 }}>
                      SkyAI Assistant
                      <Sparkle size={14} weight="fill" className="text-amber-300" />
                    </h2>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-100" style={{ margin: "2px 0 0 0" }}>
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                      Trực tuyến • Phản hồi tự động tức thì
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
                  24/7 Live
                </span>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8fbff] p-5">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[82%] px-4 py-3 text-xs font-semibold leading-relaxed"
                      style={
                        msg.role === "user"
                          ? {
                              background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                              color: "#ffffff",
                              borderRadius: "18px 18px 4px 18px",
                              boxShadow: "0 6px 16px rgba(13, 94, 215, 0.22)",
                            }
                          : {
                              background: "#ffffff",
                              color: "#16305c",
                              border: "1px solid #dbe9fe",
                              borderRadius: "18px 18px 18px 4px",
                              boxShadow: "0 4px 12px rgba(18, 60, 128, 0.05)",
                            }
                      }
                    >
                      <p style={{ margin: 0 }}>{msg.text}</p>
                      <span
                        className="mt-1 block text-[10px] opacity-70"
                        style={{ textAlign: msg.role === "user" ? "right" : "left" }}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 border-t border-blue-50 bg-white px-4 py-2.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendChatText(prompt)}
                    className="rounded-full px-3 py-1 text-[11px] font-bold text-[#0b4fd0] transition hover:bg-blue-100"
                    style={{
                      background: "#eef6ff",
                      border: "1px solid #d1e4fd",
                      cursor: "pointer",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2.5 border-t border-blue-100 bg-white p-3.5"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn cho SkyAI..."
                  className="flex-1 rounded-full border border-blue-200 bg-[#f6faff] px-4 py-2.5 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Gửi tin nhắn"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-white transition hover:opacity-95"
                  style={{
                    background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                    borderRadius: 9999,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <PaperPlaneRight size={17} weight="fill" />
                </button>
              </form>
            </div>

            {/* Support Ticket Form (Right Column) */}
            <div
              className="flex flex-col justify-between bg-white p-6 lg:col-span-5"
              style={{
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.98)",
                boxShadow: "0 14px 36px rgba(20, 62, 132, 0.09)",
              }}
            >
              <div>
                <div className="mb-4 flex items-center gap-2.5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ background: "#eaf3ff", color: "#0b5ed7" }}
                  >
                    <EnvelopeSimpleOpen size={21} weight="fill" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-[#092152]" style={{ margin: 0 }}>
                      Gửi yêu cầu hỗ trợ (Ticket)
                    </h2>
                    <p className="text-xs font-semibold text-[#556f96]" style={{ margin: "2px 0 0 0" }}>
                      Tiếp nhận hồ sơ hoàn vé, hành lý & hóa đơn VAT.
                    </p>
                  </div>
                </div>

                {submittedTicket ? (
                  <div
                    className="rounded-2xl p-5"
                    style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle size={24} weight="fill" className="shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-black text-emerald-950" style={{ margin: 0 }}>
                          Đã tiếp nhận Ticket CSKH!
                        </p>
                        <p className="mt-1.5 text-xs font-semibold leading-relaxed text-emerald-800" style={{ margin: "6px 0 0 0" }}>
                          Mã hồ sơ: <strong>{submittedTicket.ticketId}</strong>
                          <br />
                          Chủ đề: <strong>{submittedTicket.subject}</strong>
                          <br />
                          Mã đặt chỗ (PNR): <strong>{submittedTicket.pnr}</strong>
                          <br />
                          Đội ngũ CSKH SkyLink sẽ phản hồi qua{" "}
                          <strong>{submittedTicket.email || submittedTicket.phone}</strong> trong
                          vòng 2 giờ làm việc.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSubmittedTicket(null)}
                        className="px-4 py-2 text-xs font-extrabold text-white"
                        style={{
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                          borderRadius: 9999,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Gửi yêu cầu khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-3.5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Chủ đề hỗ trợ *
                        </label>
                        <select
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          required
                          className="w-full rounded-xl border border-blue-200 bg-[#f8fbff] px-3 py-2.5 text-xs font-bold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Chọn vấn đề...</option>
                          <option value="Đổi chuyến bay / Hoàn hủy vé">Đổi chuyến / Hoàn hủy vé</option>
                          <option value="Thanh toán & Hóa đơn VAT">Thanh toán & Hóa đơn VAT</option>
                          <option value="Hành lý thất lạc / Hư hỏng">Hành lý thất lạc / Hư hỏng</option>
                          <option value="Dịch vụ Khách sạn / Xe / Suất ăn">Dịch vụ Khách sạn / Xe / Suất ăn</option>
                          <option value="Khác">Yêu cầu khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Mã đặt chỗ (PNR)
                        </label>
                        <input
                          type="text"
                          value={ticketPnr}
                          onChange={(e) => setTicketPnr(e.target.value)}
                          placeholder="VD: SLK2587HN"
                          className="w-full rounded-xl border border-blue-200 bg-[#f8fbff] px-3 py-2.5 text-xs font-bold uppercase text-[#0b2559] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Email nhận phản hồi *
                        </label>
                        <input
                          type="email"
                          required
                          value={ticketEmail}
                          onChange={(e) => setTicketEmail(e.target.value)}
                          placeholder="user@skylink.vn"
                          className="w-full rounded-xl border border-blue-200 bg-[#f8fbff] px-3 py-2.5 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                          Số điện thoại *
                        </label>
                        <div className="relative flex items-center">
                          <User
                            size={14}
                            className="pointer-events-none absolute left-3 text-blue-600"
                          />
                          <input
                            type="tel"
                            required
                            value={ticketPhone}
                            onChange={(e) => setTicketPhone(e.target.value)}
                            placeholder="0901 234 567"
                            className="w-full rounded-xl border border-blue-200 bg-[#f8fbff] py-2.5 pl-8 pr-3 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-extrabold text-[#102d63]">
                        Nội dung chi tiết *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Mô tả chi tiết yêu cầu hoặc sự cố bạn cần SkyLink hỗ trợ..."
                        className="w-full resize-none rounded-xl border border-blue-200 bg-[#f8fbff] p-3 text-xs font-semibold text-[#0b2559] focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        boxShadow: "0 8px 20px rgba(13, 94, 215, 0.28)",
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <span>Gửi yêu cầu hỗ trợ</span>
                      <ArrowRight size={14} weight="bold" />
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f4f9ff] px-3.5 py-2.5 text-[11px] font-semibold text-[#3d5b8c]">
                <Clock size={15} weight="fill" className="shrink-0 text-blue-600" />
                <span>Thời gian xử lý trung bình: 15 phút – 2 giờ làm việc.</span>
              </div>
            </div>
          </section>

          {/* INTERACTIVE FAQ CATEGORIES & ACCORDION */}
          <section
            aria-label="Câu hỏi thường gặp"
            className="overflow-hidden bg-white/95 p-6 shadow-sm"
            style={{
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.98)",
              boxShadow: "0 14px 36px rgba(20, 62, 132, 0.08)",
            }}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#092152]" style={{ margin: 0 }}>
                  Câu hỏi thường gặp (FAQ)
                </h2>
                <p className="text-xs font-semibold text-[#556f96]" style={{ margin: "3px 0 0 0" }}>
                  Bấm vào từng danh mục hoặc câu hỏi để xem hướng dẫn chi tiết.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className="px-3.5 py-1.5 text-xs font-extrabold transition"
                  style={
                    activeCategory === "all"
                      ? {
                          background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                          color: "#ffffff",
                          borderRadius: 9999,
                          border: "none",
                          cursor: "pointer",
                        }
                      : {
                          background: "#eef6ff",
                          color: "#1e3f77",
                          borderRadius: 9999,
                          border: "1px solid #d4e6fd",
                          cursor: "pointer",
                        }
                  }
                >
                  Tất cả
                </button>
                {FAQ_DATA.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className="px-3.5 py-1.5 text-xs font-extrabold transition"
                    style={
                      activeCategory === cat.id
                        ? {
                            background: "linear-gradient(90deg, #0b5ed7 0%, #1d75f2 100%)",
                            color: "#ffffff",
                            borderRadius: 9999,
                            border: "none",
                            cursor: "pointer",
                          }
                        : {
                            background: "#eef6ff",
                            color: "#1e3f77",
                            borderRadius: 9999,
                            border: "1px solid #d4e6fd",
                            cursor: "pointer",
                          }
                    }
                  >
                    {cat.category}
                  </button>
                ))}
              </div>
            </div>

            {filteredFaqGroups.length === 0 ? (
              <div className="rounded-2xl bg-[#f7faff] py-8 text-center text-xs font-bold text-slate-500">
                Không tìm thấy câu hỏi phù hợp với từ khóa "{searchFaq}". Bạn có thể nhắn trực tiếp
                vào khung SkyAI ở trên!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {filteredFaqGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div
                      key={group.id}
                      className="rounded-2xl bg-[#f8fbff] p-4"
                      style={{ border: "1px solid #e1effe" }}
                    >
                      <div className="mb-3 flex items-center gap-2.5">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"
                          style={{ border: "1px solid #dceafc" }}
                        >
                          <Icon size={19} weight="fill" />
                        </span>
                        <div>
                          <h3 className="text-sm font-black text-[#092152]" style={{ margin: 0 }}>
                            {group.category}
                          </h3>
                          <p className="text-[11px] font-semibold text-[#5a749b]" style={{ margin: 0 }}>
                            {group.desc}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {group.questions.map((item, qIdx) => {
                          const key = `${group.id}-${qIdx}`;
                          const isOpen = openFaqKey === key;
                          return (
                            <div
                              key={key}
                              className="overflow-hidden rounded-xl bg-white"
                              style={{ border: "1px solid #e2eeff" }}
                            >
                              <button
                                type="button"
                                onClick={() => setOpenFaqKey(isOpen ? "" : key)}
                                className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-extrabold text-[#0b2559]"
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                <span>{item.q}</span>
                                {isOpen ? (
                                  <CaretUp size={14} weight="bold" className="shrink-0 text-blue-600" />
                                ) : (
                                  <CaretDown size={14} weight="bold" className="shrink-0 text-slate-400" />
                                )}
                              </button>
                              {isOpen && (
                                <div className="border-t border-blue-50 bg-[#fbfdff] px-3.5 py-2.5 text-xs font-medium leading-relaxed text-[#355384]">
                                  {item.a}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "motion/react";
import {
  AirplaneTilt,
  ArrowClockwise,
  ArrowLeft,
  Bed,
  BookmarkSimple,
  CarProfile,
  CaretRight,
  Compass,
  DotsThree,
  Lightbulb,
  PlusCircle,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { useChat } from "../../hooks/useChat";
import AssistantAvatar from "./AssistantAvatar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const PROMPT_SETS = [
  [
    {
      category: "flights",
      label: "Flights · Chuyến bay",
      color: "#0284c7",
      bg: "#e0f2fe",
      Icon: AirplaneTilt,
      text: "Tìm chuyến bay giá tốt từ TP. Hồ Chí Minh đi Đà Nẵng cuối tuần này?",
      highlight: "TP. Hồ Chí Minh đi Đà Nẵng",
    },
    {
      category: "hotels",
      label: "Hotels · Khách sạn",
      color: "#2563eb",
      bg: "#dbeafe",
      Icon: Bed,
      text: "Gợi ý các khách sạn & resort ven biển đẹp nhất ở Đà Nẵng?",
      highlight: "khách sạn & resort ven biển",
    },
    {
      category: "experiences",
      label: "Experiences · Trải nghiệm",
      color: "#0d9488",
      bg: "#ccfbf1",
      Icon: Compass,
      text: "Những trải nghiệm và tour không thể bỏ lỡ khi đi Phú Quốc?",
      highlight: "Phú Quốc",
    },
    {
      category: "cars",
      label: "Car Rental · Thuê xe",
      color: "#ea580c",
      bg: "#ffedd5",
      Icon: CarProfile,
      text: "Tư vấn thuê xe 7 chỗ có tài xế đón tại sân bay Đà Nẵng?",
      highlight: "thuê xe 7 chỗ",
    },
  ],
  [
    {
      category: "flights",
      label: "Flights · Chuyến bay",
      color: "#0284c7",
      bg: "#e0f2fe",
      Icon: AirplaneTilt,
      text: "So sánh giá vé máy bay Hà Nội đi Phú Quốc tháng này?",
      highlight: "Hà Nội đi Phú Quốc",
    },
    {
      category: "hotels",
      label: "Hotels · Khách sạn",
      color: "#2563eb",
      bg: "#dbeafe",
      Icon: Bed,
      text: "Khách sạn trung tâm nào ở Thượng Hải gần The Bund và view đẹp?",
      highlight: "Thượng Hải gần The Bund",
    },
    {
      category: "experiences",
      label: "Experiences · Trải nghiệm",
      color: "#0d9488",
      bg: "#ccfbf1",
      Icon: Compass,
      text: "Lịch trình khám phá Hội An & Đà Nẵng 3 ngày 2 đêm thú vị nhất?",
      highlight: "Hội An & Đà Nẵng 3 ngày 2 đêm",
    },
    {
      category: "inspiration",
      label: "Inspiration · Gợi ý",
      color: "#ea580c",
      bg: "#ffedd5",
      Icon: Lightbulb,
      text: "Quy định hành lý xách tay & làm thủ tục Check-in online SkyLink?",
      highlight: "hành lý xách tay & Check-in online",
    },
  ],
  [
    {
      category: "flights",
      label: "Flights · Chuyến bay",
      color: "#0284c7",
      bg: "#e0f2fe",
      Icon: AirplaneTilt,
      text: "Chuyến bay thẳng đi Tokyo hoặc Seoul nào đang có ưu đãi?",
      highlight: "Tokyo hoặc Seoul",
    },
    {
      category: "hotels",
      label: "Hotels · Khách sạn",
      color: "#2563eb",
      bg: "#dbeafe",
      Icon: Bed,
      text: "Gợi ý resort nghỉ dưỡng gia đình có bữa sáng miễn phí tại Nha Trang?",
      highlight: "resort nghỉ dưỡng gia đình",
    },
    {
      category: "experiences",
      label: "Experiences · Trải nghiệm",
      color: "#0d9488",
      bg: "#ccfbf1",
      Icon: Compass,
      text: "Đi Singapore nên chơi những điểm nào và đặt vé ở đâu?",
      highlight: "Singapore",
    },
    {
      category: "cars",
      label: "Car Rental · Thuê xe",
      color: "#ea580c",
      bg: "#ffedd5",
      Icon: CarProfile,
      text: "Thuê xe tự lái tại Đà Lạt giá bao nhiêu một ngày?",
      highlight: "thuê xe tự lái tại Đà Lạt",
    },
  ],
];

const FILTER_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
  { id: "experiences", label: "Experiences" },
  { id: "cars", label: "Car Rental" },
];

function renderHighlightedPrompt(text, highlight) {
  if (!highlight || !text.includes(highlight)) return text;
  const [before, ...rest] = text.split(highlight);
  return (
    <>
      {before}
      <strong className="font-extrabold text-[#091e47]">{highlight}</strong>
      {rest.join(highlight)}
    </>
  );
}

export default function ChatWindow() {
  const { messages, status, sendMessage, editMessage, close, reset } = useChat();
  const [promptSetIdx, setPromptSetIdx] = useState(0);
  const [activeTopic, setActiveTopic] = useState("all");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [personalized, setPersonalized] = useState(true);
  const [viewMode, setViewMode] = useState("chat"); // "chat" | "saved"
  const [savedItems, setSavedItems] = useState([]);
  const navigate = useNavigate();
  const isSending = status === "sending";

  // Show the signature SkyLink Welcome Screen when only the initial greeting exists (no user turns yet)
  const hasUserInteraction = useMemo(
    () => messages.some((m) => m.role === "user" || m.sender === "user") || messages.length > 1,
    [messages]
  );

  const visiblePrompts = useMemo(() => {
    const allInSet = PROMPT_SETS[promptSetIdx % PROMPT_SETS.length];
    if (activeTopic === "all") return allInSet;
    const acrossAll = PROMPT_SETS.flat().filter((p) => p.category === activeTopic);
    return acrossAll.slice(0, 4);
  }, [promptSetIdx, activeTopic]);

  const handleToggleSave = (msg) => {
    if (!msg?.id) return;
    setSavedItems((prev) => {
      const exists = prev.some((item) => item.id === msg.id);
      if (exists) return prev.filter((item) => item.id !== msg.id);
      return [{ id: msg.id, text: msg.text, savedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }, ...prev];
    });
  };

  const savedIdSet = useMemo(() => new Set(savedItems.map((i) => i.id)), [savedItems]);

  const handleQuickReply = (item) => {
    const payload = typeof item === "string" ? item : (item?.payload || item?.text || item?.label || "");
    if (!payload) return;

    if (typeof payload === "string" && payload.startsWith("open:")) {
      const targetPath = payload.slice(5);
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      close();
      if (!token && (targetPath.includes("seat-selection") || targetPath.includes("booking") || targetPath.includes("checkout"))) {
        navigate("/login", {
          state: {
            from: targetPath,
            message: "Vui lòng đăng ký hoặc đăng nhập để tiếp tục đặt vé máy bay.",
          },
        });
      } else {
        navigate(targetPath);
      }
      return;
    }
    setViewMode("chat");
    sendMessage(payload);
  };

  const handleSelectFlight = (flight) => {
    const flightId = flight?.id ?? flight?.flight_id ?? flight?.flightId;
    if (!flightId) return;

    localStorage.setItem("selected_flights", JSON.stringify([flight]));
    localStorage.removeItem("selected_seats");

    if (!localStorage.getItem("search_params")) {
      localStorage.setItem(
        "search_params",
        JSON.stringify({
          tripType: "one-way",
          flightClass: "economy",
          passengers: { adults: 1, children: 0 },
        })
      );
    }

    close();

    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      navigate("/login", {
        state: {
          from: `/seat-selection?flight_id=${encodeURIComponent(flightId)}`,
          message: "Vui lòng đăng ký hoặc đăng nhập để tiếp tục chọn ghế & đặt vé.",
        },
      });
    } else {
      navigate(`/seat-selection?flight_id=${encodeURIComponent(flightId)}`);
    }
  };

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-label="SkyGenie AI Travel Concierge"
      className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[680px] flex-col bg-white font-sans shadow-2xl"
      style={{
        borderLeft: "1px solid #dbe7fb",
        boxShadow: "-18px 0 56px rgba(15, 36, 92, 0.20)",
      }}
    >
      {/* Signature SkyLink Airy Sky-Tint Header */}
      <header
        className="relative flex h-[66px] shrink-0 items-center justify-between border-b border-blue-100/80 px-5 sm:px-6"
        style={{
          background: "linear-gradient(90deg, #f0f9ff 0%, #ffffff 60%, #eef2ff 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          {viewMode === "saved" ? (
            <button
              type="button"
              onClick={() => setViewMode("chat")}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white text-[#091e47] shadow-2xs transition hover:bg-blue-50"
              style={{ border: "1px solid #dbe7fb" }}
              title="Quay lại chat"
            >
              <ArrowLeft size={17} weight="bold" />
            </button>
          ) : (
            <AssistantAvatar size="md" isOnline />
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3
                className="font-black tracking-tight text-[#091e47]"
                style={{ margin: 0, fontSize: 17, lineHeight: 1.2 }}
              >
                {viewMode === "saved" ? "Saved Chats · Đã lưu" : "SkyGenie"}
              </h3>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-[#1d4ed8]"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
              >
                <Sparkle size={10} weight="fill" />
                SkyLink AI
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {isSending
                ? "SkyGenie đang tìm gợi ý tốt nhất cho bạn..."
                : viewMode === "saved"
                  ? `${savedItems.length} gợi ý đã lưu trong phiên này`
                  : "5-Star Travel Concierge • Flights, Hotels & Experiences"}
            </span>
          </div>
        </div>

        {/* Right Controls: More Menu (...) + Close (×) */}
        <div className="relative flex items-center gap-1.5 text-slate-600">
          {hasUserInteraction && viewMode === "chat" && (
            <button
              type="button"
              onClick={() => {
                reset();
                setShowMoreMenu(false);
              }}
              title="Bắt đầu cuộc trò chuyện mới"
              className="hidden cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#1d4ed8] shadow-2xs transition hover:bg-blue-50 sm:inline-flex"
              style={{ border: "1px solid #dbe7fb" }}
            >
              <PlusCircle size={14} weight="bold" />
              <span>New Chat</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowMoreMenu((v) => !v)}
            title="Tùy chọn thêm"
            aria-label="More options"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition hover:bg-blue-50 hover:text-[#091e47]"
            style={{ border: "none", background: "transparent" }}
          >
            <DotsThree size={22} weight="bold" />
          </button>

          <button
            type="button"
            onClick={close}
            title="Đóng SkyGenie"
            aria-label="Close chat"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-[#091e47]"
            style={{ border: "none", background: "transparent" }}
          >
            <X size={19} weight="bold" />
          </button>

          {/* TripGenie-inspired More Options Dropdown */}
          <AnimatePresence>
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-10 top-[calc(100%+8px)] z-40 w-[240px] bg-white p-2 shadow-2xl"
                  style={{ borderRadius: 16, border: "1px solid #dbe7fb" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("saved");
                      setShowMoreMenu(false);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold text-[#091e47] transition hover:bg-blue-50"
                    style={{ border: "none", background: "transparent" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <BookmarkSimple size={15} weight="duotone" className="text-[#2563eb]" />
                      Saved Chats ({savedItems.length})
                    </span>
                    <CaretRight size={12} weight="bold" className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    disabled={!hasUserInteraction}
                    onClick={() => {
                      reset();
                      setViewMode("chat");
                      setShowMoreMenu(false);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold text-[#091e47] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ border: "none", background: "transparent" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <PlusCircle size={15} weight="duotone" className="text-[#0ea5e9]" />
                      Start a New Chat
                    </span>
                    <CaretRight size={12} weight="bold" className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersonalized((v) => !v)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold text-[#091e47] transition hover:bg-blue-50"
                    style={{ border: "none", background: "transparent" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sparkle size={15} weight="duotone" className="text-indigo-500" />
                      Personalized reply
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-black"
                      style={{
                        background: personalized ? "#dcfce7" : "#f1f5f9",
                        color: personalized ? "#15803d" : "#64748b",
                      }}
                    >
                      {personalized ? "ON" : "OFF"}
                    </span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* BODY AREA: Saved Chats OR SkyLink Welcome Screen OR Active Chat */}
      {viewMode === "saved" ? (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#f8fbff] p-6">
          {savedItems.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
                <BookmarkSimple size={28} weight="duotone" />
              </div>
              <h4 className="font-black text-[#091e47]" style={{ margin: "0 0 6px 0", fontSize: 16 }}>
                Chưa có gợi ý nào được lưu
              </h4>
              <p className="max-w-xs text-xs font-medium text-slate-500">
                Bấm vào biểu tượng Bookmark dưới bất kỳ câu trả lời nào của SkyGenie để lưu lại cho chuyến đi của bạn.
              </p>
            </div>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white p-4 shadow-2xs"
                style={{ border: "1px solid #dbe7fb" }}
              >
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Saved at {item.savedAt}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSave(item)}
                    className="cursor-pointer bg-transparent text-rose-500 hover:underline"
                    style={{ border: "none", padding: 0 }}
                  >
                    Bỏ lưu
                  </button>
                </div>
                <p className="whitespace-pre-line text-xs font-medium leading-relaxed text-slate-700" style={{ margin: 0 }}>
                  {item.text}
                </p>
              </div>
            ))
          )}
        </div>
      ) : !hasUserInteraction ? (
        /* SKYLINK SIGNATURE WELCOME SCREEN (TripGenie-inspired, customized for SkyLink) */
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-7 sm:px-8">
          {/* Two-line Gradient Greeting */}
          <div className="mb-4">
            <div
              className="font-black tracking-tight"
              style={{
                fontSize: 28,
                lineHeight: 1.2,
                background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 52%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Xin chào! Hi there
            </div>
            <h1
              className="mt-0.5 font-black tracking-tight text-[#091e47]"
              style={{ margin: "2px 0 0 0", fontSize: 26, lineHeight: 1.25 }}
            >
              Khởi đầu hành trình cùng SkyGenie
            </h1>
          </div>

          {/* Soft Ice-Blue Intro Card */}
          <div
            className="mb-5 px-5 py-4 text-[13.5px] font-medium leading-relaxed text-slate-600"
            style={{
              background: "linear-gradient(135deg, #f0f7ff 0%, #f8fafc 100%)",
              border: "1px solid #e2ecfb",
              borderRadius: "4px 18px 18px 18px",
            }}
          >
            Mình là trợ lý du lịch AI của <strong className="font-extrabold text-[#091e47]">SkyLink Airlines</strong>.
            Mình có thể giúp bạn tìm chuyến bay giá tốt, gợi ý khách sạn, trải nghiệm địa phương, thuê xe sân bay hoặc
            tra cứu mã PNR nhanh chóng. Hãy chọn một gợi ý bên dưới hoặc hỏi mình bất cứ điều gì!
          </div>

          {/* SkyLink Unique Touch: Quick Service Filter Pills */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {FILTER_TABS.map((tab) => {
              const active = activeTopic === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTopic(tab.id)}
                  className="cursor-pointer px-3.5 py-1.5 text-xs font-extrabold transition"
                  style={{
                    borderRadius: 9999,
                    background: active ? "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)" : "#f8fafc",
                    color: active ? "#ffffff" : "#475569",
                    border: active ? "1px solid transparent" : "1px solid #e2e8f0",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 2-Column Suggested Prompt Cards Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visiblePrompts.map((prompt, idx) => {
              const IconComp = prompt.Icon;
              return (
                <button
                  key={`${promptSetIdx}-${idx}`}
                  type="button"
                  onClick={() => sendMessage(prompt.text)}
                  className="group flex cursor-pointer flex-col items-start justify-between bg-white p-4 text-left shadow-2xs transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  style={{
                    borderRadius: 16,
                    border: "1px solid #dbe4f0",
                    minHeight: 102,
                  }}
                >
                  <span
                    className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
                    style={{ background: prompt.bg, color: prompt.color }}
                  >
                    <IconComp size={13} weight="fill" />
                    <span>{prompt.label}</span>
                  </span>

                  <p
                    className="text-[13px] font-medium leading-snug text-slate-700 group-hover:text-[#091e47]"
                    style={{ margin: 0 }}
                  >
                    {renderHighlightedPrompt(prompt.text, prompt.highlight)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Centered Refresh Questions Pill + Disclaimer */}
          <div className="mt-6 flex flex-col items-center gap-2.5 text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTopic("all");
                setPromptSetIdx((i) => (i + 1) % PROMPT_SETS.length);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 bg-white px-4 py-2 text-xs font-extrabold text-[#091e47] shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/50"
              style={{ borderRadius: 9999, border: "1px solid #d5e2f2" }}
            >
              <ArrowClockwise size={14} weight="bold" className="text-[#2563eb]" />
              <span>Refresh Questions · Đổi gợi ý</span>
            </button>

            <p className="text-[11px] font-medium text-slate-400" style={{ margin: 0 }}>
              *Bằng việc tiếp tục trò chuyện, bạn đồng ý với Điều khoản sử dụng của SkyLink AI.
            </p>
          </div>
        </div>
      ) : (
        /* ACTIVE CONVERSATION VIEW */
        <div className="flex flex-1 flex-col overflow-hidden bg-white">
          <MessageList
            messages={messages}
            isSending={isSending}
            onQuickReply={handleQuickReply}
            onSelectFlight={handleSelectFlight}
            onEditMessage={editMessage}
            onNavigateClose={close}
            savedIdSet={savedIdSet}
            onToggleSave={handleToggleSave}
          />
        </div>
      )}

      {/* BOTTOM GLOWING INPUT AREA */}
      <ChatInput
        onSend={(msg, imgs) => {
          setViewMode("chat");
          sendMessage(msg, imgs);
        }}
        onSendMessage={(msg, imgs) => {
          setViewMode("chat");
          sendMessage(msg, imgs);
        }}
        isLoading={isSending}
        disabled={isSending}
        placeholder="Ask me anything about travel · Hỏi chuyến bay, khách sạn, Đà Nẵng..."
      />
    </motion.aside>
  );
}

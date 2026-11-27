// eslint-disable-next-line no-unused-vars
import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowClockwise,
  BookmarkSimple,
  Check,
  Copy,
  PencilSimple,
  ThumbsDown,
  ThumbsUp,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import AssistantAvatar from "./AssistantAvatar";
import FlightCardMessage from "./FlightCardMessage";
import QuickReplies from "./QuickReplies";
import TravelSuggestionCarousel, { detectDestinationFromText } from "./TravelSuggestionCarousel";

const formatTime = (timestamp) => {
  if (!timestamp) return null;
  if (typeof timestamp === "string" && timestamp.includes(":") && timestamp.length <= 5) {
    return timestamp;
  }
  return new Date(timestamp).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = String(text).split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (
              <strong key={partIdx} className="font-extrabold text-[#091e47]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <React.Fragment key={partIdx}>{part}</React.Fragment>;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export default function MessageBubble({
  message,
  isFirstMessage = false,
  onQuickReply,
  onSelectFlight,
  onEditMessage,
  onNavigateClose,
  isSaved = false,
  onToggleSave,
  disabled,
}) {
  const isUser = message.role === "user" || message.sender === "user";
  const timeLabel = formatTime(message.createdAt || message.timestamp);
  const quickRepliesList = message.quickReplies || message.suggestions || [];
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [copied, setCopied] = useState(false);
  const [localBookmarked, setLocalBookmarked] = useState(false);
  const [feedback, setFeedback] = useState(null); // "up" | "down" | null
  const bookmarked = onToggleSave ? isSaved : localBookmarked;

  const detectedDestination = useMemo(() => {
    if (isUser || message.isError || (message.flights && message.flights.length > 0)) return null;
    return detectDestinationFromText(message.text, isFirstMessage);
  }, [isUser, message.isError, message.flights, message.text, isFirstMessage]);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    if (typeof onEditMessage === "function") {
      onEditMessage(message.id, editText.trim(), message.images);
    }
    setIsEditing(false);
  };

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard?.writeText(message.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // 1. User Bubble (Right)
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="group mb-3 flex items-end justify-end gap-2"
      >
        {!isEditing && !disabled && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Chỉnh sửa câu hỏi"
            className="cursor-pointer self-center rounded-full p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-blue-600 group-hover:opacity-100"
            style={{ border: "none", background: "transparent" }}
          >
            <PencilSimple size={13} weight="bold" />
          </button>
        )}

        <div className="flex max-w-[85%] flex-col items-end gap-1">
          {message.images?.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {message.images.map((img, i) => (
                <img
                  key={i}
                  src={typeof img === "string" ? img : img.data}
                  alt="Đính kèm"
                  className="h-24 w-24 cursor-pointer rounded-xl border border-slate-200/80 object-cover shadow-2xs transition-transform hover:scale-[1.02]"
                  onClick={() => window.open(typeof img === "string" ? img : img.data, "_blank")}
                />
              ))}
            </div>
          )}

          {isEditing ? (
            <form
              onSubmit={handleSaveEdit}
              className="flex w-full min-w-[200px] flex-col gap-1.5 rounded-2xl border border-blue-200 bg-white p-2 shadow-sm"
            >
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                autoFocus
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2 text-[13px] text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.text || "");
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100"
                >
                  <X size={11} weight="bold" /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={!editText.trim()}
                  className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check size={11} weight="bold" /> Lưu &amp; Gửi lại
                </button>
              </div>
            </form>
          ) : (
            message.text && (
              <div
                className="rounded-2xl rounded-br-xs px-4 py-2.5 text-[13.5px] font-medium leading-relaxed text-white shadow-2xs"
                style={{ background: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)" }}
              >
                {message.text}
              </div>
            )
          )}

          {timeLabel && (
            <span className="mt-0.5 flex items-center justify-end gap-1 px-1.5 text-[9.5px] text-slate-400/90">
              <span>{timeLabel}</span>
              <span className="-mt-[1px] select-none font-extrabold leading-none text-blue-500">✓✓</span>
            </span>
          )}
        </div>

        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 ring-1 ring-white">
          <UserCircle size={16} weight="fill" />
        </div>
      </motion.div>
    );
  }

  // 2. AI Bubble (Left — TripGenie Editorial Layout)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="mb-3 flex w-full flex-col"
    >
      {/* 2.1 Main AI Response Content */}
      {message.text && (
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            <AssistantAvatar size="sm" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div
              className={`rounded-2xl rounded-tl-xs px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line ${
                message.isError
                  ? "border border-rose-200 bg-rose-50 text-rose-700"
                  : "border border-slate-100 bg-[#f8fbff] text-slate-800"
              }`}
            >
              {renderFormattedText(message.text)}
            </div>

            {!message.isError && (
              <>
                <div className="mt-1.5 px-1 text-[10.5px] font-medium text-slate-400">
                  *This content is generated by SkyLink AI {timeLabel ? `• ${timeLabel}` : ""}
                </div>

                {/* TripGenie Action Bar: Bookmark, Copy, Thumbs Up / Down */}
                <div className="mt-1.5 flex items-center justify-between border-t border-slate-100 pt-1.5 px-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => (onToggleSave ? onToggleSave(message) : setLocalBookmarked((v) => !v))}
                      title={bookmarked ? "Đã lưu vào Saved Chats" : "Lưu gợi ý"}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#1d4ed8]"
                      style={{ border: "none", background: "transparent", color: bookmarked ? "#1d4ed8" : undefined }}
                    >
                      <BookmarkSimple size={15} weight={bookmarked ? "fill" : "bold"} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      title="Sao chép nội dung"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-bold text-slate-400 transition hover:bg-slate-100 hover:text-[#1d4ed8]"
                      style={{ border: "none", background: "transparent", color: copied ? "#059669" : undefined }}
                    >
                      {copied ? <Check size={14} weight="bold" /> : <Copy size={15} weight="bold" />}
                      {copied && <span>Đã chép</span>}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFeedback((f) => (f === "up" ? null : "up"))}
                      title="Hữu ích"
                      className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-emerald-600"
                      style={{ border: "none", background: "transparent", color: feedback === "up" ? "#059669" : undefined }}
                    >
                      <ThumbsUp size={15} weight={feedback === "up" ? "fill" : "bold"} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedback((f) => (f === "down" ? null : "down"))}
                      title="Chưa hữu ích"
                      className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
                      style={{ border: "none", background: "transparent", color: feedback === "down" ? "#e11d48" : undefined }}
                    >
                      <ThumbsDown size={15} weight={feedback === "down" ? "fill" : "bold"} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2.2 TripGenie Horizontal Destination + Real Hotel/Experience Cards */}
      {detectedDestination && (
        <TravelSuggestionCarousel
          destination={detectedDestination}
          onNavigateClose={onNavigateClose}
        />
      )}

      {/* 2.3 Quick Replies */}
      {quickRepliesList.length > 0 && (
        <div className="mt-2 w-full">
          <QuickReplies
            items={quickRepliesList}
            onSelect={onQuickReply}
            disabled={disabled}
          />
        </div>
      )}

      {/* 2.4 Flight Cards */}
      {message.flights?.length > 0 && (
        <div className="mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          {message.flights.map((flight) => (
            <FlightCardMessage key={flight.id} flight={flight} onSelect={onSelectFlight} />
          ))}
        </div>
      )}

      {/* 2.5 Retry Button */}
      {message.isError && message.retry && (
        <div className="mt-1 pl-9">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onQuickReply && onQuickReply({ payload: message.retry })}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1 text-[11px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <ArrowClockwise size={12} weight="bold" />
            Thử lại
          </button>
        </div>
      )}
    </motion.div>
  );
}

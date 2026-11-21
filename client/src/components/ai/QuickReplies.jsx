import React from "react";
import { AirplaneTilt, SuitcaseRolling, Ticket, QrCode, Question } from "@phosphor-icons/react";

const getQuickReplyDetails = (label) => {
  const normLabel = label.toLowerCase();

  if (normLabel.includes("check-in") || normLabel.includes("thủ tục")) {
    return {
      Icon: QrCode,
      iconColor: "text-emerald-600",
      title: "Check-in trực tuyến",
    };
  }

  if (normLabel.includes("chuyến bay của tôi")) {
    return {
      Icon: Ticket,
      iconColor: "text-blue-600",
      title: "Chuyến bay của tôi",
    };
  }

  if (normLabel.includes("chuyến bay") || normLabel.includes("bay") || normLabel.includes("tìm chuyến")) {
    return {
      Icon: AirplaneTilt,
      iconColor: "text-blue-600",
      title: label.trim() || "Tìm chuyến bay",
    };
  }

  if (normLabel.includes("hành lý") || normLabel.includes("quy định")) {
    return {
      Icon: SuitcaseRolling,
      iconColor: "text-indigo-600",
      title: "Quy định hành lý",
    };
  }

  if (normLabel.includes("đặt chỗ") || normLabel.includes("tra cứu") || normLabel.includes("mã đặt")) {
    return {
      Icon: Ticket,
      iconColor: "text-amber-600",
      title: "Tra cứu mã đặt chỗ",
    };
  }

  const titleText = label.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "").trim();
  return {
    Icon: Question,
    iconColor: "text-slate-500",
    title: titleText || label,
  };
};

export const QuickReplies = ({ items = [], onSelect, disabled = false }) => {
  if (!items || items.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-1.5 w-full pb-1 pt-1.5 pl-8"
    >
      {items.map((item, idx) => {
        const label = typeof item === "string" ? item : (item.label || item.text || item.payload);
        const payload = typeof item === "string" ? item : (item.payload || item.text || item.label);

        const details = getQuickReplyDetails(label);
        const IconComponent = details.Icon;

        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelect && onSelect(payload)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[11px] font-bold text-[#163d7a] hover:text-[#0b4fd0] hover:bg-blue-50 active:scale-[0.98] transition-all shadow-2xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 select-none"
            style={{
              borderRadius: 9999,
              border: "1px solid #cde2fd",
            }}
          >
            <IconComponent size={13} className={`${details.iconColor}`} weight="fill" />
            <span>{details.title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickReplies;
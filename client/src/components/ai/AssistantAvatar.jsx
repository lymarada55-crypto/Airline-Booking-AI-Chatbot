import React from "react";

/**
 * Cute glowing SkyAI / SkyGenie Robot Mascot SVG (inspired by TripGenie)
 */
export function SkyGenieMascotSvg({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sgHeadGrad" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="sgVisorGrad" x1="16" y1="22" x2="48" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>

      {/* Cute rounded head + top genie swirl */}
      <path
        d="M35.5 8.5C38 11 39.2 13.8 40.5 16C48.5 18.6 54 25.8 54 34.4C54 45.2 44.6 53.5 32 53.5C19.4 53.5 10 45.2 10 34.4C10 24.4 17.8 16.4 27.6 15.2C29.4 11.4 32.8 7.2 35.5 8.5Z"
        fill="url(#sgHeadGrad)"
      />

      {/* Soft glossy visor mask */}
      <path
        d="M21 26.5C21 23.4 23.6 21 26.8 21H37.2C40.4 21 43 23.4 43 26.5V35C43 38.4 40 41 36.4 40.6C34.5 40.4 33.4 39.2 32 39.2C30.6 39.2 29.5 40.4 27.6 40.6C24 41 21 38.4 21 35V26.5Z"
        fill="url(#sgVisorGrad)"
      />

      {/* Friendly glowing eyes */}
      <rect x="25.5" y="26.5" width="4.4" height="9" rx="2.2" fill="#1d4ed8" />
      <rect x="34.1" y="26.5" width="4.4" height="9" rx="2.2" fill="#1d4ed8" />

      {/* Subtle eye sparkle */}
      <circle cx="27" cy="28.6" r="1" fill="#ffffff" />
      <circle cx="35.6" cy="28.6" r="1" fill="#ffffff" />
    </svg>
  );
}

const sizes = {
  sm: { box: "w-7 h-7", icon: 22, dot: "w-1.5 h-1.5" },
  md: { box: "w-9 h-9", icon: 28, dot: "w-2 h-2" },
  lg: { box: "w-11 h-11", icon: 34, dot: "w-2.5 h-2.5" },
};

export function AssistantAvatar({ size = "md", isOnline = false }) {
  const s = sizes[size] ?? sizes.md;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <div
        className={`${s.box} rounded-full flex items-center justify-center shadow-xs`}
        style={{
          background: "radial-gradient(circle at 35% 30%, #2563eb 0%, #1e3a8a 100%)",
          border: "1.5px solid rgba(191, 219, 254, 0.9)",
        }}
        aria-hidden="true"
      >
        <SkyGenieMascotSvg size={s.icon} />
      </div>

      {isOnline && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${s.dot} rounded-full bg-emerald-400 ring-1.5 ring-white shadow-xs`}
          title="Đang trực tuyến"
        />
      )}
    </div>
  );
}

export default AssistantAvatar;

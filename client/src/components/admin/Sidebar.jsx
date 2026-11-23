import { Link, useLocation, useNavigate } from "react-router-dom";

const SIDEBAR_PLANE_IMG =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/admin", label: "Home", icon: "fa-home" },
    { path: "/admin/users", label: "Users management", icon: "fa-users" },
    { path: "/admin/bookings", label: "Reservation", icon: "fa-calendar-alt" },
    { path: "/admin/travel-services", label: "Travel services", icon: "fa-concierge-bell" },
    { path: "/admin/flights", label: "Flights", icon: "fa-plane" },
    { path: "/admin/fleet", label: "Fleet", icon: "fa-layer-group" },
    { path: "/admin/airports", label: "Airports", icon: "fa-map-marker-alt" },
    { path: "/admin/payments", label: "Payment", icon: "fa-credit-card" },
    { path: "/admin/profits", label: "Profits", icon: "fa-sack-dollar" },
    { path: "/admin/offers", label: "Offers", icon: "fa-percent" },
    { path: "/admin/reports", label: "Reports", icon: "fa-file-invoice" },
    { path: "/admin/profile", label: "Profile", icon: "fa-user-circle" },
  ];

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      style={{
        width: "242px",
        minWidth: "242px",
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "linear-gradient(180deg, #092c7a 0%, #072361 52%, #051b4d 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "4px 0 28px rgba(7, 30, 84, 0.22)",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {/* BOTTOM AIRPLANE & SKY GLOW ILLUSTRATION matching mockup */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "210px",
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={SIDEBAR_PLANE_IMG}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 35%",
            opacity: 0.45,
            WebkitMaskImage:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.95) 100%)",
            maskImage:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.95) 100%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 2, overflowY: "auto" }}>
        {/* LOGO AREA — Stylized Winged SkyLink Emblem matching mockup */}
        <Link
          to="/admin"
          style={{
            padding: "22px 18px 14px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg
              width="46"
              height="36"
              viewBox="0 0 64 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0, filter: "drop-shadow(0 4px 10px rgba(56, 189, 248, 0.45))" }}
            >
              <defs>
                <linearGradient id="skyWingTop" x1="0" y1="0" x2="64" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="55%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <linearGradient id="skyWingBot" x1="0" y1="10" x2="58" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
              </defs>
              {/* Left sweeping wing */}
              <path
                d="M4 8C14 14 23 22 30 33C21 29 12 24 6 16C4.8 14.3 4 11.2 4 8Z"
                fill="url(#skyWingTop)"
              />
              <path
                d="M8 21C16 25 23 30 29 37C21 36 14 33 9.5 27C8.4 25.4 8 23.2 8 21Z"
                fill="url(#skyWingBot)"
                opacity="0.92"
              />
              {/* Right soaring wing */}
              <path
                d="M60 6C49 12 39 21 32 34C42 29 51 23 57.5 14.5C59 12.4 59.8 9.2 60 6Z"
                fill="url(#skyWingTop)"
              />
              <path
                d="M55 20C47 25 39 30 33 38C41 36.5 48.5 33 53.5 26.5C54.6 24.8 55 22.4 55 20Z"
                fill="url(#skyWingBot)"
                opacity="0.92"
              />
              {/* Center fuselage / tail accent */}
              <path
                d="M31.5 14L35 39L31.5 44L28 39L31.5 14Z"
                fill="#ffffff"
                opacity="0.95"
              />
            </svg>

            <div>
              <div
                style={{
                  fontSize: "19px",
                  fontWeight: "900",
                  color: "#ffffff",
                  letterSpacing: "-0.3px",
                  lineHeight: "1.08",
                }}
              >
                SkyLink
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#bae6fd",
                  lineHeight: "1.12",
                  letterSpacing: "0.2px",
                }}
              >
                Airlines
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: "7px",
              fontSize: "11px",
              color: "rgba(186, 230, 253, 0.82)",
              fontWeight: "500",
              letterSpacing: "0.2px",
            }}
          >
            Fly with confidence
          </div>
        </Link>

        {/* MENU ITEMS */}
        <nav style={{ padding: "6px 14px" }}>
          {menuItems.map((item, idx) => {
            const active = isActive(item.path) && (idx === 0 ? location.pathname === "/admin" : true);
            return (
              <Link
                key={idx}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "9.5px 15px",
                  marginBottom: "3px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontSize: "13.5px",
                  fontWeight: active ? "700" : "500",
                  transition: "all 0.2s ease",
                  background: active
                    ? "linear-gradient(90deg, #1b78f2 0%, #3b93ff 100%)"
                    : "transparent",
                  color: active ? "#ffffff" : "rgba(226, 238, 255, 0.85)",
                  boxShadow: active ? "0 6px 18px rgba(27, 120, 242, 0.42)" : "none",
                }}
              >
                <i
                  className={`fas ${item.icon}`}
                  style={{
                    fontSize: "14px",
                    width: "20px",
                    textAlign: "center",
                    color: active ? "#ffffff" : "rgba(191, 219, 254, 0.82)",
                  }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* GLASS LOGOUT BUTTON AT BOTTOM matching mockup */}
      <div style={{ position: "relative", zIndex: 2, padding: "12px 14px 18px 14px" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "11px 16px",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.24)",
            background: "rgba(9, 44, 122, 0.58)",
            backdropFilter: "blur(8px)",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "700",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.72)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(9, 44, 122, 0.58)";
          }}
        >
          <i className="fas fa-sign-out-alt" style={{ fontSize: "15px" }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

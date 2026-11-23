import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/admin/profile");
      const userData = res.data?.data || res.data;
      if (userData) {
        setAdminUser(userData);
      }
    } catch (err) {
      console.error("Error fetching navbar admin profile:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/bookings?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const initials = (adminUser?.name || "AD")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav
      style={{
        height: "68px",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 28px 4px 28px",
      }}
    >
      {/* FROSTED WHITE SEARCH PILL matching mockup */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255, 255, 255, 0.90)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.96)",
          borderRadius: 9999,
          padding: "8px 18px",
          width: "380px",
          maxWidth: "100%",
          boxShadow: "0 8px 22px rgba(18, 60, 130, 0.08)",
        }}
      >
        <i className="fas fa-search" style={{ color: "#64748b", fontSize: "14px" }} />
        <input
          type="text"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            flex: 1,
            fontSize: "13.5px",
            fontWeight: "500",
            color: "#0f172a",
          }}
        />
      </form>

      {/* RIGHT UTILITIES & USER PILL matching mockup */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* NOTIFICATION BELL */}
        <button
          type="button"
          onClick={() => navigate("/admin/bookings")}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.95)",
            background: "rgba(255, 255, 255, 0.92)",
            color: "#0b2559",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "16px",
            position: "relative",
            boxShadow: "0 8px 20px rgba(18, 60, 130, 0.09)",
          }}
          title="Thông báo"
        >
          <i className="far fa-bell" />
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              minWidth: "17px",
              height: "17px",
              borderRadius: "9999px",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ffffff",
            }}
          >
            3
          </span>
        </button>

        {/* USER PROFILE WHITE PILL */}
        <button
          type="button"
          onClick={() => navigate("/admin/profile")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            cursor: "pointer",
            padding: "4px 14px 4px 5px",
            borderRadius: 9999,
            border: "1px solid rgba(255, 255, 255, 0.95)",
            background: "rgba(255, 255, 255, 0.92)",
            boxShadow: "0 8px 20px rgba(18, 60, 130, 0.09)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1d75f2 0%, #0b4fd0 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "12px",
            }}
          >
            {initials}
          </div>

          <span
            style={{
              fontSize: "13.5px",
              fontWeight: "700",
              color: "#091e47",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            {adminUser?.name || "Marada"}
            <i className="fas fa-chevron-down" style={{ fontSize: "10px", color: "#64748b" }} />
          </span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";
import { Outlet } from "react-router-dom";

const HERO_ADMIN_PLANE_BG =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

function AdminLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #b8dafc 0%, #d8ecff 22%, #eef5ff 55%, #f4f8ff 100%)",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Seamless Sky & Flying Airplane Hero Backdrop matching mockup */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 310,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <img
            src={HERO_ADMIN_PLANE_BG}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "68% 42%",
              opacity: 0.94,
              WebkitMaskImage:
                "linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.82) 62%, transparent 100%)",
              maskImage:
                "linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.82) 62%, transparent 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(220,238,255,0.88) 0%, rgba(220,238,255,0.45) 38%, rgba(185,220,255,0.04) 68%, rgba(165,210,255,0.06) 100%)",
            }}
          />
        </div>

        <div style={{ position: "relative", zIndex: 10 }}>
          <Navbar />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            flex: 1,
            padding: "8px 28px 28px 28px",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;

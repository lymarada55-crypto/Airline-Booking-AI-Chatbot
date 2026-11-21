import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api";
import {
  AirplaneTilt,
  ArrowLeft,
  ArrowRight,
  Baby,
  BowlFood,
  CheckCircle,
  Clock,
  FishSimple,
  ForkKnife,
  Grains,
  Headset,
  Heart,
  Info,
  Leaf,
  MagnifyingGlass,
  MoonStars,
  PaperPlaneTilt,
  ShieldCheck,
  SquaresFour,
  Ticket,
  X,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

const mealRequests = [
  {
    icon: Leaf,
    code: "VGML",
    title: "Suất ăn thuần chay",
    category: "Chay",
    badgeLabel: "Ăn chay",
    badgeBg: "#22a559",
    badgeTextColor: "#ffffff",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",
    description:
      "Không chứa thịt, cá, trứng, sữa và sản phẩm từ động vật; thành phần tùy hãng.",
  },
  {
    icon: ForkKnife,
    code: "LFML",
    title: "Suất ăn ít dầu mỡ",
    category: "Dinh dưỡng",
    badgeLabel: "Dinh dưỡng",
    badgeBg: "#bae6fd",
    badgeTextColor: "#0369a1",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=85",
    description:
      "Phù hợp cho chế độ ăn kiêng, hạn chế chất béo và giảm dầu mỡ.",
  },
  {
    icon: MoonStars,
    code: "MOML",
    title: "Suất ăn Halal (Muslim)",
    category: "Tôn giáo",
    badgeLabel: "Halal",
    badgeBg: "#e9d5ff",
    badgeTextColor: "#6d28d9",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=85",
    description:
      "Đáp ứng tiêu chuẩn thực phẩm Halal dành cho hành khách Hồi giáo.",
  },
  {
    icon: Grains,
    code: "GFML",
    title: "Suất ăn không Gluten",
    category: "Dinh dưỡng",
    badgeLabel: "Không Gluten",
    badgeBg: "#fed7aa",
    badgeTextColor: "#c2410c",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=85",
    description:
      "Không chứa gluten từ lúa mì/lúa mạch, phù hợp cho người nhạy cảm.",
  },
  {
    icon: Leaf,
    code: "VLML",
    title: "Suất ăn chay có sữa/trứng",
    category: "Chay",
    badgeLabel: "Ăn chay",
    badgeBg: "#22a559",
    badgeTextColor: "#ffffff",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
    description:
      "Thực đơn chay có thể gồm sữa hoặc trứng; không dùng thịt và hải sản.",
  },
  {
    icon: Leaf,
    code: "AVML",
    title: "Suất ăn chay kiểu Á",
    category: "Chay",
    badgeLabel: "Ăn chay",
    badgeBg: "#22a559",
    badgeTextColor: "#ffffff",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
    description:
      "Suất chay chế biến theo phong cách ẩm thực châu Á giàu hương vị.",
  },
  {
    icon: Leaf,
    code: "VJML",
    title: "Suất ăn chay Jain",
    category: "Chay",
    badgeLabel: "Ăn chay",
    badgeBg: "#22a559",
    badgeTextColor: "#ffffff",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85",
    description:
      "Suất chay theo tiêu chuẩn Jain, không dùng các loại củ mọc dưới đất.",
  },
  {
    icon: Leaf,
    code: "RVML",
    title: "Suất ăn chay thực phẩm sống",
    category: "Chay",
    badgeLabel: "Ăn chay",
    badgeBg: "#22a559",
    badgeTextColor: "#ffffff",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",
    description:
      "Kết hợp rau củ quả tươi sống và trái cây tự nhiên không qua chế biến nhiệt.",
  },
  {
    icon: MoonStars,
    code: "KSML",
    title: "Suất ăn Kosher",
    category: "Tôn giáo",
    badgeLabel: "Tôn giáo",
    badgeBg: "#e9d5ff",
    badgeTextColor: "#6d28d9",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
    description:
      "Suất ăn chế biến và đóng gói theo quy định Kosher của Do Thái giáo.",
  },
  {
    icon: MoonStars,
    code: "HNML",
    title: "Suất ăn Hindu",
    category: "Tôn giáo",
    badgeLabel: "Tôn giáo",
    badgeBg: "#e9d5ff",
    badgeTextColor: "#6d28d9",
    image:
      "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=900&q=85",
    description:
      "Chế biến theo truyền thống Ấn Độ giáo, không sử dụng thịt bò và thịt heo.",
  },
  {
    icon: Baby,
    code: "CHML",
    title: "Suất ăn trẻ em",
    category: "Trẻ em",
    badgeLabel: "Trẻ em",
    badgeBg: "#fde68a",
    badgeTextColor: "#b45309",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",
    description:
      "Thực đơn mềm, dễ ăn, giàu dinh dưỡng và trình bày bắt mắt cho trẻ em.",
  },
  {
    icon: Baby,
    code: "BBML",
    title: "Suất ăn em bé",
    category: "Trẻ em",
    badgeLabel: "Trẻ em",
    badgeBg: "#fde68a",
    badgeTextColor: "#b45309",
    image:
      "https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=900&q=85",
    description:
      "Thức ăn nghiền mịn dễ tiêu hóa dành riêng cho trẻ nhỏ dưới 2 tuổi.",
  },
  {
    icon: ForkKnife,
    code: "DBML",
    title: "Suất ăn cho người tiểu đường",
    category: "Dinh dưỡng",
    badgeLabel: "Dinh dưỡng",
    badgeBg: "#bae6fd",
    badgeTextColor: "#0369a1",
    image:
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=900&q=85",
    description:
      "Kiểm soát lượng đường và carbohydrate, giàu chất xơ và đạm lành mạnh.",
  },
  {
    icon: ForkKnife,
    code: "NLML",
    title: "Suất ăn không Lactose",
    category: "Dinh dưỡng",
    badgeLabel: "Dinh dưỡng",
    badgeBg: "#bae6fd",
    badgeTextColor: "#0369a1",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85",
    description:
      "Hạn chế sữa và các chế phẩm chứa lactose cho người không dung nạp.",
  },
  {
    icon: ForkKnife,
    code: "LSML",
    title: "Suất ăn ít muối",
    category: "Dinh dưỡng",
    badgeLabel: "Dinh dưỡng",
    badgeBg: "#bae6fd",
    badgeTextColor: "#0369a1",
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=85",
    description:
      "Giảm lượng natri và muối trong quá trình chế biến, tốt cho tim mạch.",
  },
  {
    icon: ForkKnife,
    code: "LCML",
    title: "Suất ăn ít Calo",
    category: "Dinh dưỡng",
    badgeLabel: "Dinh dưỡng",
    badgeBg: "#bae6fd",
    badgeTextColor: "#0369a1",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85",
    description:
      "Thực đơn cân bằng năng lượng thấp, ưu tiên rau xanh và thịt nạc.",
  },
  {
    icon: ForkKnife,
    code: "BLML",
    title: "Suất ăn thanh đạm",
    category: "Dinh dưỡng",
    badgeLabel: "Dinh dưỡng",
    badgeBg: "#bae6fd",
    badgeTextColor: "#0369a1",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=85",
    description:
      "Món ăn nhẹ vị, ít gia vị cay nồng, chế biến mềm dễ tiêu hóa.",
  },
  {
    icon: ForkKnife,
    code: "FPML",
    title: "Đĩa trái cây tươi",
    category: "Thực đơn khác",
    badgeLabel: "Thực đơn khác",
    badgeBg: "#dbeafe",
    badgeTextColor: "#1d4ed8",
    image:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85",
    description:
      "Phần trái cây tươi theo mùa thanh mát, giàu vitamin trên chuyến bay.",
  },
  {
    icon: FishSimple,
    code: "SFML",
    title: "Suất ăn hải sản",
    category: "Thực đơn khác",
    badgeLabel: "Thực đơn khác",
    badgeBg: "#dbeafe",
    badgeTextColor: "#1d4ed8",
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=85",
    description:
      "Thực đơn chế biến từ cá và hải sản tươi ngon phục vụ nóng trên chuyến bay.",
  },
  {
    icon: ForkKnife,
    code: "ORML",
    title: "Suất ăn phương Đông",
    category: "Thực đơn khác",
    badgeLabel: "Thực đơn khác",
    badgeBg: "#dbeafe",
    badgeTextColor: "#1d4ed8",
    image:
      "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=900&q=85",
    description:
      "Món nóng mang đậm hương vị ẩm thực phương Đông truyền thống.",
  },
];

const filterCategories = [
  { key: "Tất cả", label: "Tất cả (20)", icon: SquaresFour, iconColor: "#1d4ed8" },
  { key: "Chay", label: "Chay (5)", icon: Leaf, iconColor: "#16a34a" },
  { key: "Dinh dưỡng", label: "Dinh dưỡng (7)", icon: BowlFood, iconColor: "#d97706" },
  { key: "Tôn giáo", label: "Tôn giáo (3)", icon: MoonStars, iconColor: "#7c3aed" },
  { key: "Trẻ em", label: "Trẻ em (2)", icon: Baby, iconColor: "#ea580c" },
  { key: "Thực đơn khác", label: "Thực đơn khác (3)", icon: ForkKnife, iconColor: "#1e40af" },
];

const featureItems = [
  { icon: Leaf, title: "Thực đơn", detail: "đa dạng" },
  { icon: ShieldCheck, title: "Đảm bảo", detail: "chất lượng" },
  { icon: Headset, title: "Hỗ trợ", detail: "24/7" },
];

function ClocheSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      style={{ width: 44, height: 44, color: "#0b57d0" }}
      aria-hidden="true"
    >
      <circle cx="32" cy="15" r="3.6" fill="currentColor" />
      <path
        d="M12 40C12 28.954 20.954 20 32 20C43.046 20 52 28.954 52 40H12Z"
        fill="currentColor"
      />
      <path
        d="M21 27.5C17.8 30.2 15.6 34.1 15.2 38"
        stroke="#93c5fd"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <rect x="8" y="42.5" width="48" height="4" rx="2" fill="currentColor" />
      <path
        d="M14 48.5H50"
        stroke="#60a5fa"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SpecialMeals() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState({});
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [savedMealNotice, setSavedMealNotice] = useState(null);
  const [mealByPnr, setMealByPnr] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skylink_flight_special_meals") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!selectedMeal) return;
    const token =
      localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      setBookings([]);
      setSelectedBookingId("");
      return;
    }

    let cancelled = false;
    setLoadingBookings(true);
    api
      .get("/bookings")
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const activeList = list.filter((b) => b.status !== "cancelled");
        setBookings(activeList);
        setSelectedBookingId(activeList[0] ? String(activeList[0].id) : "");
      })
      .catch(() => {
        if (!cancelled) {
          setBookings([]);
          setSelectedBookingId("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingBookings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMeal]);

  const toggleFavorite = (code) => {
    setFavorites((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const handleSelectMeal = (meal) => {
    setSavedMealNotice(null);
    setSelectedMeal(meal);
  };

  const handleConfirmAttachToFlight = () => {
    if (!selectedMeal) return;
    const targetBooking = bookings.find((b) => String(b.id) === String(selectedBookingId));
    if (!targetBooking) return;

    const pnr = targetBooking.pnr_code || `VE-${targetBooking.id}`;
    const updatedMap = {
      ...mealByPnr,
      [pnr]: {
        code: selectedMeal.code,
        title: selectedMeal.title,
        category: selectedMeal.category,
        attachedAt: new Date().toISOString(),
      },
    };
    setMealByPnr(updatedMap);
    localStorage.setItem("skylink_flight_special_meals", JSON.stringify(updatedMap));
    localStorage.setItem(
      "preferred_special_meal",
      JSON.stringify({
        code: selectedMeal.code,
        title: selectedMeal.title,
        category: selectedMeal.category,
        pnr,
      })
    );

    const dep =
      targetBooking.flight?.departure_airport?.city ||
      targetBooking.flight?.departure_airport?.code ||
      "Điểm đi";
    const arr =
      targetBooking.flight?.arrival_airport?.city ||
      targetBooking.flight?.arrival_airport?.code ||
      "Điểm đến";

    setSavedMealNotice({
      type: "attached",
      mealCode: selectedMeal.code,
      mealTitle: selectedMeal.title,
      pnr,
      route: `${dep} → ${arr}`,
    });
  };

  const handleBookFlightWithMeal = () => {
    if (!selectedMeal) return;
    localStorage.setItem(
      "preferred_special_meal",
      JSON.stringify({
        code: selectedMeal.code,
        title: selectedMeal.title,
        category: selectedMeal.category,
      })
    );
    setSelectedMeal(null);
    navigate("/");
  };

  const filteredMeals = mealRequests.filter((meal) => {
    const matchCategory =
      activeCategory === "Tất cả" || meal.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchCategory;
    return (
      matchCategory &&
      (meal.code.toLowerCase().includes(q) ||
        meal.title.toLowerCase().includes(q) ||
        meal.description.toLowerCase().includes(q) ||
        meal.badgeLabel.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="min-h-screen pb-16 font-sans text-[#102d63]"
      style={{
        background:
          "linear-gradient(180deg, #e6f1ff 0%, #f1f7ff 50%, #dfeeff 100%)",
      }}
    >
      <Navbar />

      {/* HERO BANNER */}
      <section
        className="relative isolate overflow-hidden"
        style={{
          minHeight: 335,
          paddingTop: 86,
          paddingBottom: 52,
          background:
            "linear-gradient(100deg, #cde3fe 0%, #dfeeff 36%, #c2dbfa 54%, #1f4987 100%)",
        }}
      >
        {/* Fluffy Clouds Layer */}
        <div
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 18% 26% at 8% 30%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.55) 50%, transparent 100%), radial-gradient(ellipse 22% 20% at 22% 78%, rgba(255,255,255,.92) 0%, rgba(255,255,255,.55) 54%, transparent 100%), radial-gradient(ellipse 20% 18% at 38% 82%, rgba(255,255,255,.88) 0%, rgba(255,255,255,.42) 52%, transparent 100%)",
          }}
        />

        {/* Full Hero Background: Sky & Clouds on Left + Cabin Window & Meal Tray on Right */}
        <div
          className="absolute inset-0 -z-10"
        >
          <img
            src="/hero-meals-bg.jpg"
            alt="Suất ăn trên chuyến bay SkyLink"
            className="h-full w-full object-cover"
            style={{ objectPosition: "right 76%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(215, 236, 255, 0.72) 0%, rgba(226, 241, 255, 0.45) 36%, transparent 55%)",
            }}
          />
        </div>

        {/* Left Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-10">
          <div
            className="relative z-10 w-full"
            style={{ maxWidth: 460, paddingBottom: 14, paddingTop: 4 }}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/90 px-3.5 py-1.5 text-xs font-extrabold text-blue-700 shadow-sm backdrop-blur transition hover:bg-white"
                style={{ textDecoration: "none" }}
              >
                <ArrowLeft size={14} weight="bold" aria-hidden="true" />
                Quay lại dịch vụ
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/80 px-3.5 py-1.5 text-xs font-extrabold text-[#1251b5] shadow-sm backdrop-blur">
                <ForkKnife size={14} weight="fill" aria-hidden="true" />
                Dịch vụ trên chuyến bay
              </span>
            </div>

            <p
              className="text-xs font-black tracking-widest uppercase"
              style={{ color: "#1558c0", margin: "0 0 4px 0" }}
            >
              SKYLINK AIRLINES
            </p>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl"
              style={{ color: "#0b2b66", margin: 0 }}
            >
              Bữa ăn trên chuyến bay
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-2.5 text-sm font-medium leading-6"
              style={{ color: "#35507c", maxWidth: 430, margin: "10px 0 0 0" }}
            >
              Lựa chọn suất ăn phù hợp cho chuyến bay của bạn và kiểm tra điều
              kiện phục vụ trước khi gửi yêu cầu.
            </motion.p>

            {/* Curved Flight Path & Airplane Graphic */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.14 }}
              className="mt-1.5"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 220 38"
                fill="none"
                style={{ width: 175, height: 32, overflow: "visible" }}
              >
                <path
                  d="M4 30C54 12 118 10 174 16"
                  stroke="#2563eb"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeOpacity="0.55"
                />
                <g transform="translate(176, 4) rotate(12)">
                  <path
                    d="M22 10L14 11.5L7 3L4.5 3.8L8.2 12.5L3 13.5L1 10.5L-0.5 11L1 15.2L-0.5 19.2L1 19.7L3 16.8L8.2 17.8L4.5 26.5L7 27.2L14 18.8L22 20C23.8 20 25 18.8 25 15C25 11.2 23.8 10 22 10Z"
                    fill="#1565d8"
                  />
                </g>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-10"
        style={{ marginTop: -32 }}
      >
        {/* FLOATING CARD: ĐẶT SUẤT ĂN CÙNG VÉ */}
        <section
          aria-labelledby="booking-meal-title"
          className="grid gap-6 rounded-[28px] border border-white/90 bg-white/95 backdrop-blur-xl lg:grid-cols-3 lg:items-center"
          style={{
            minHeight: "unset",
            padding: "16px 26px",
            boxShadow: "0 16px 42px rgba(45, 92, 168, 0.14)",
          }}
        >
          <div className="flex items-center gap-4 sm:gap-5 lg:col-span-2 lg:pr-8">
            <div
              className="hidden shrink-0 items-center justify-center rounded-full sm:flex"
              style={{
                width: 76,
                height: 76,
                background:
                  "linear-gradient(180deg, #d7ebff 0%, #edf6ff 100%)",
                boxShadow:
                  "inset 0 2px 6px rgba(255,255,255,0.9), 0 8px 18px rgba(25,103,210,0.12)",
                border: "1px solid #ffffff",
              }}
            >
              <ClocheSvg />
            </div>

            <div className="min-w-0">
              <h2
                id="booking-meal-title"
                className="text-xl font-black sm:text-2xl"
                style={{ color: "#0b2b66", margin: 0 }}
              >
                Đặt suất ăn cùng vé
              </h2>
              <p
                className="mt-1 max-w-2xl text-xs font-medium leading-5 sm:text-sm"
                style={{ color: "#4b6387", margin: "4px 0 0 0" }}
              >
                Trong bước chọn dịch vụ của SkyLink, bạn có thể thêm suất ăn
                nóng vào booking. Các lựa chọn ăn uống đặc biệt như ăn kiêng, ăn
                chay, hoặc thực đơn theo tôn giáo cũng được hỗ trợ.
              </p>
              <a
                href="#meal-options"
                className="mt-2.5 inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5 sm:text-sm"
                style={{
                  background:
                    "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                  boxShadow: "0 6px 16px rgba(13, 96, 216, 0.25)",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
              >
                Tìm hiểu thêm về các loại suất ăn
                <ArrowRight size={15} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-blue-200 border-t border-blue-100 pt-3 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
            {featureItems.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="px-2 text-center">
                <span
                  className="mx-auto flex items-center justify-center rounded-full text-blue-600"
                  style={{
                    width: 42,
                    height: 42,
                    background:
                      "linear-gradient(180deg, #e2efff 0%, #f1f7ff 100%)",
                    boxShadow: "0 4px 10px rgba(25, 103, 210, 0.10)",
                  }}
                >
                  <Icon size={20} weight="fill" aria-hidden="true" />
                </span>
                <p
                  className="mt-1.5 text-xs font-extrabold leading-4"
                  style={{ color: "#0e2f69", margin: "6px 0 0 0" }}
                >
                  {title}
                </p>
                <p
                  className="text-xs font-extrabold leading-4"
                  style={{ color: "#0e2f69", margin: 0 }}
                >
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 24-HOUR NOTICE PILL BANNER (MATCHING MOCKUP) */}
        <div
          className="mt-4 flex items-center gap-3 rounded-full border border-white/90 px-4 py-2.5 backdrop-blur-md"
          style={{
            background:
              "linear-gradient(90deg, rgba(215, 234, 255, 0.88) 0%, rgba(235, 245, 255, 0.92) 65%, rgba(218, 236, 255, 0.85) 100%)",
            boxShadow: "0 6px 20px rgba(38, 84, 160, 0.08)",
          }}
        >
          <span
            className="flex shrink-0 items-center justify-center rounded-full text-white"
            style={{
              width: 26,
              height: 26,
              background: "linear-gradient(180deg, #1d78f0 0%, #0b5ed7 100%)",
              boxShadow: "0 2px 8px rgba(13, 94, 215, 0.3)",
            }}
          >
            <Info size={16} weight="bold" aria-hidden="true" />
          </span>
          <p
            className="text-xs font-semibold sm:text-sm"
            style={{ color: "#153973", margin: 0 }}
          >
            Vui lòng đăng ký suất ăn ít nhất 24 giờ trước giờ khởi hành để đảm
            bảo phục vụ tốt nhất.
          </p>
        </div>

        {/* FILTER PILLS BAR + SEARCH INPUT (1:1 WITH IMAGE) */}
        <section
          id="meal-options"
          aria-labelledby="meal-options-title"
          className="scroll-mt-24 pt-4"
        >
          <div
            className="flex flex-wrap items-center justify-between gap-2.5 rounded-3xl border border-white bg-white/95 backdrop-blur-xl lg:flex-nowrap"
            style={{
              borderRadius: 24,
              padding: "10px 14px",
              boxShadow: "0 12px 32px rgba(38, 84, 160, 0.10)",
            }}
          >
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 lg:flex-nowrap">
              {filterCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveCategory(cat.key)}
                    className="inline-flex items-center gap-1.5 rounded-full text-xs font-extrabold transition"
                    style={{
                      cursor: "pointer",
                      padding: "7px 12px",
                      borderRadius: 9999,
                      whiteSpace: "nowrap",
                      border: isActive
                        ? "1px solid #0b5ed7"
                        : "1px solid #dce8fa",
                      background: isActive
                        ? "linear-gradient(90deg, #0b5ed7 0%, #1e78f0 100%)"
                        : "#f4f8ff",
                      color: isActive ? "#ffffff" : "#1c3d72",
                      boxShadow: isActive
                        ? "0 6px 16px rgba(13, 94, 215, 0.28)"
                        : "none",
                    }}
                  >
                    <Icon
                      size={15}
                      weight="fill"
                      style={{
                        color: isActive ? "#ffffff" : cat.iconColor,
                      }}
                      aria-hidden="true"
                    />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Vertical Divider on Desktop */}
            <div
              className="hidden lg:block"
              style={{
                width: 1,
                height: 26,
                background: "#dbe7f9",
                flexShrink: 0,
              }}
            />

            {/* Search Input Box */}
            <div
              className="flex items-center gap-2 rounded-full border bg-[#f8fbff] px-3.5 py-1.5"
              style={{
                borderRadius: 9999,
                borderColor: "#d4e3fa",
                minWidth: 230,
                flex: "1 1 230px",
                maxWidth: 295,
              }}
            >
              <MagnifyingGlass
                size={16}
                weight="bold"
                style={{ color: "#5b769e", flexShrink: 0 }}
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã/tên (VD: VGML, Halal...)"
                aria-label="Tìm theo mã hoặc tên suất ăn"
                className="w-full bg-transparent text-xs font-medium outline-none"
                style={{
                  color: "#0b2b66",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* Section Title & Conditions Link */}
          <div className="mt-5 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ForkKnife
                size={26}
                weight="fill"
                className="shrink-0 text-blue-700"
                aria-hidden="true"
              />
              <div>
                <h2
                  id="meal-options-title"
                  className="text-xl font-black tracking-tight sm:text-2xl"
                  style={{ color: "#0b2b66", margin: 0 }}
                >
                  Các loại bữa ăn đặc biệt ({filteredMeals.length})
                </h2>
              </div>
            </div>

            <a
              href="#meal-conditions"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-extrabold text-blue-700 shadow-sm transition hover:border-blue-400"
              style={{ textDecoration: "none" }}
            >
              Điều kiện phục vụ
              <ArrowRight size={14} weight="bold" aria-hidden="true" />
            </a>
          </div>

          {/* CARDS GRID MATCHING NEW MOCKUP 1:1 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredMeals.map((meal, index) => {
              const BadgeIcon = meal.icon;
              const isFav = !!favorites[meal.code];
              return (
                <motion.article
                  key={meal.code}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.025 * (index % 8) }}
                  className="group flex flex-col justify-between overflow-hidden border border-white bg-white transition duration-300 hover:-translate-y-1"
                  style={{
                    padding: 10,
                    borderRadius: 24,
                    boxShadow: "0 12px 30px rgba(34, 78, 152, 0.10)",
                  }}
                >
                  {/* Image Box with Top-Left Category Pill & Top-Right Heart Button */}
                  <div
                    className="relative overflow-hidden bg-blue-50"
                    style={{ height: 146, borderRadius: 16 }}
                  >
                    <img
                      src={meal.image}
                      alt={meal.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(12,45,103,0.16) 0%, transparent 45%, rgba(12,45,103,0.12) 100%)",
                      }}
                    />

                    {/* Top-Left Category Badge */}
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full font-extrabold shadow-sm"
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        zIndex: 10,
                        background: meal.badgeBg,
                        color: meal.badgeTextColor,
                        fontSize: 11,
                        lineHeight: "16px",
                        padding: "4px 11px",
                        border: "1px solid rgba(255,255,255,0.65)",
                      }}
                    >
                      <BadgeIcon size={13} weight="fill" aria-hidden="true" />
                      {meal.badgeLabel}
                    </span>

                    {/* Top-Right Heart Button */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(meal.code)}
                      aria-label={`Yêu thích ${meal.title}`}
                      className="flex items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 10,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "1px solid rgba(226, 232, 240, 0.9)",
                        cursor: "pointer",
                        color: isFav ? "#ef4444" : "#3b5998",
                      }}
                    >
                      <Heart
                        size={15}
                        weight={isFav ? "fill" : "regular"}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {/* Card Body: Title + Description + Bottom Row (IATA Code Pill + Chọn suất ăn ->) */}
                  <div
                    className="flex flex-1 flex-col justify-between"
                    style={{ padding: "12px 8px 6px 8px" }}
                  >
                    <div>
                      <h3
                        className="font-black"
                        style={{
                          color: "#0b2b66",
                          fontSize: 17,
                          lineHeight: "22px",
                          margin: 0,
                        }}
                      >
                        {meal.title}
                      </h3>
                      <p
                        className="text-xs leading-4"
                        style={{
                          color: "#4e678c",
                          margin: "6px 0 0 0",
                          minHeight: 34,
                        }}
                      >
                        {meal.description}
                      </p>
                    </div>

                    {/* Footer Row: IATA Code Pill on Left + Chọn suất ăn Button on Right */}
                    <div
                      className="flex items-center justify-between gap-2"
                      style={{ marginTop: 12 }}
                    >
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full font-extrabold"
                        style={{
                          background: "#eef6f0",
                          color: "#1e4620",
                          fontSize: 11,
                          padding: "4px 10px",
                          border: "1px solid #d3ead8",
                        }}
                      >
                        <Leaf
                          size={12}
                          weight="fill"
                          style={{ color: "#16a34a" }}
                          aria-hidden="true"
                        />
                        {meal.code}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleSelectMeal(meal)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full text-xs font-extrabold transition hover:bg-blue-600 hover:text-white"
                        style={{
                          cursor: "pointer",
                          padding: "6px 13px",
                          borderRadius: 9999,
                          border: "1.5px solid #3b82f6",
                          background: "#f4f8ff",
                          color: "#0b4fd0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Chọn suất ăn
                        <ArrowRight
                          size={12}
                          weight="bold"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* SECTION: ĐIỀU KIỆN PHỤC VỤ */}
        <section
          id="meal-conditions"
          aria-labelledby="meal-conditions-title"
          className="mt-7 scroll-mt-24 rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm sm:flex sm:items-start sm:gap-4 sm:p-6"
        >
          <span className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:mb-0">
            <CheckCircle size={22} weight="fill" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="meal-conditions-title"
              className="font-extrabold text-[#102d63]"
              style={{ fontSize: 16, margin: 0 }}
            >
              Điều kiện phục vụ cần lưu ý
            </h2>
            <p
              className="text-sm leading-6 text-[#5b6f8e]"
              style={{ margin: "6px 0 0 0" }}
            >
              Danh mục và thời hạn đăng ký thay đổi theo hãng, chuyến bay và
              chặng bay; hãy xác nhận trực tiếp với hãng khai thác. Với dị ứng
              nghiêm trọng, cần trao đổi trước với hãng vì suất ăn đặc biệt
              không bảo đảm tránh tiếp xúc chéo.
            </p>
            <p
              className="flex items-start gap-2 text-xs leading-5 text-slate-500"
              style={{ margin: "8px 0 0 0" }}
            >
              <Clock
                size={16}
                className="mt-0.5 shrink-0 text-blue-600"
                aria-hidden="true"
              />
              Gửi yêu cầu càng sớm càng tốt sau khi đặt vé; không có một mốc
              thời gian chung áp dụng cho mọi hãng.
            </p>
          </div>
        </section>

        {/* BOTTOM TAGLINE MATCHING MOCKUP */}
        <div
          className="mt-8 flex items-center justify-center gap-2 text-center"
          style={{ color: "#153e85" }}
        >
          <PaperPlaneTilt
            size={18}
            weight="fill"
            style={{ color: "#0b5ed7" }}
            aria-hidden="true"
          />
          <span className="text-xs font-bold italic sm:text-sm">
            SkyLink Airlines – Đồng hành cùng bạn trên mọi hành trình
          </span>
        </div>
      </main>

      {/* REAL-WORLD SPECIAL MEAL CONFIRMATION MODAL */}
      {selectedMeal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{
            background: "rgba(9, 25, 58, 0.52)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSelectedMeal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="special-meal-modal-title"
            className="w-full overflow-hidden bg-white shadow-2xl"
            style={{
              maxWidth: 540,
              borderRadius: 26,
              border: "1px solid #dbe9fe",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Image + Close Button */}
            <div className="relative" style={{ height: 155 }}>
              <img
                src={selectedMeal.image}
                alt={selectedMeal.title}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,28,64,0.18) 0%, rgba(10,28,64,0.78) 100%)",
                }}
              />
              <button
                type="button"
                onClick={() => setSelectedMeal(null)}
                aria-label="Đóng hộp thoại"
                className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                style={{ borderRadius: 9999 }}
              >
                <X size={18} weight="bold" />
              </button>

              <div className="absolute bottom-3.5 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
                    style={{
                      background: selectedMeal.badgeBg,
                      color: selectedMeal.badgeTextColor,
                    }}
                  >
                    {selectedMeal.code} • {selectedMeal.badgeLabel}
                  </span>
                  <h2
                    id="special-meal-modal-title"
                    className="mt-1.5 text-xl font-black text-white"
                    style={{ margin: "6px 0 0 0" }}
                  >
                    {selectedMeal.title}
                  </h2>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-extrabold"
                  style={{
                    background: "#dcfce7",
                    color: "#15803d",
                  }}
                >
                  Miễn phí kèm vé
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6">
              <p className="text-xs leading-relaxed text-slate-600" style={{ margin: "0 0 14px 0" }}>
                {selectedMeal.description}
              </p>

              {/* Free IATA Meal Real-World Notice */}
              <div
                className="mb-4 flex items-start gap-2.5 rounded-2xl p-3 text-xs"
                style={{
                  background: "#f0f7ff",
                  border: "1px solid #d5e7ff",
                  color: "#1e4280",
                }}
              >
                <Info size={17} weight="fill" className="mt-0.5 shrink-0 text-blue-600" />
                <span>
                  Theo tiêu chuẩn hàng không, <strong>suất ăn đặc biệt (IATA)</strong> được phục vụ{" "}
                  <strong>miễn phí</strong> đi kèm vé máy bay và cần đăng ký trước giờ khởi hành tối
                  thiểu <strong>24 giờ</strong> (không cần thanh toán riêng như Khách sạn / Thuê xe).
                </span>
              </div>

              {savedMealNotice ? (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={22} weight="fill" className="shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-black text-emerald-900" style={{ margin: 0 }}>
                        Đã đăng ký suất ăn thành công!
                      </p>
                      <p className="mt-1 text-xs font-semibold text-emerald-800" style={{ margin: "4px 0 0 0" }}>
                        Suất <strong>{savedMealNotice.mealCode} – {savedMealNotice.mealTitle}</strong>{" "}
                        đã được gắn vào mã đặt chỗ <strong>{savedMealNotice.pnr}</strong> (
                        {savedMealNotice.route}). Chi phí: <strong>0 ₫ (Miễn phí)</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMeal(null)}
                      className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
                      style={{ borderRadius: 9999 }}
                    >
                      Chọn suất khác
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMeal(null);
                        navigate("/my-bookings");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold text-white"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        borderRadius: 9999,
                      }}
                    >
                      Xem chuyến bay của tôi
                      <ArrowRight size={13} weight="bold" />
                    </button>
                  </div>
                </div>
              ) : loadingBookings ? (
                <div className="py-6 text-center text-xs font-semibold text-slate-500">
                  Đang kiểm tra các chuyến bay sắp tới của bạn...
                </div>
              ) : bookings.length > 0 ? (
                <div>
                  <label
                    htmlFor="special-meal-booking-select"
                    className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-[#102d63]"
                  >
                    <Ticket size={15} weight="fill" className="text-blue-600" />
                    Chọn chuyến bay muốn gắn suất ăn này:
                  </label>
                  <select
                    id="special-meal-booking-select"
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#102d63] focus:border-blue-500 focus:outline-none"
                  >
                    {bookings.map((b) => {
                      const dep =
                        b.flight?.departure_airport?.city ||
                        b.flight?.departure_airport?.code ||
                        "Điểm đi";
                      const arr =
                        b.flight?.arrival_airport?.city ||
                        b.flight?.arrival_airport?.code ||
                        "Điểm đến";
                      const flightNo = b.flight?.flight_number || "SkyLink";
                      const existing = mealByPnr[b.pnr_code];
                      return (
                        <option key={b.id} value={b.id}>
                          {b.pnr_code} • {flightNo} ({dep} → {arr})
                          {existing ? ` [Đã chọn: ${existing.code}]` : ""}
                        </option>
                      );
                    })}
                  </select>

                  <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedMeal(null)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                      style={{ borderRadius: 9999 }}
                    >
                      Để sau
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAttachToFlight}
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        boxShadow: "0 6px 16px rgba(11, 94, 215, 0.28)",
                        borderRadius: 9999,
                      }}
                    >
                      <CheckCircle size={15} weight="fill" />
                      Xác nhận gắn suất ăn (Miễn phí)
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    className="rounded-2xl p-3.5 text-xs"
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                    }}
                  >
                    Bạn chưa có vé máy bay sắp khởi hành nào để gắn suất ăn. Bạn có thể lưu suất{" "}
                    <strong>{selectedMeal.code}</strong> làm ưu tiên và đặt vé chuyến bay ngay bây
                    giờ.
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedMeal(null)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                      style={{ borderRadius: 9999 }}
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={handleBookFlightWithMeal}
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-extrabold text-white transition hover:opacity-95"
                      style={{
                        background: "linear-gradient(90deg, #0b5ed7 0%, #1d78f0 100%)",
                        boxShadow: "0 6px 16px rgba(11, 94, 215, 0.28)",
                        borderRadius: 9999,
                      }}
                    >
                      <AirplaneTilt size={15} weight="fill" />
                      Tìm chuyến bay để đặt vé
                      <ArrowRight size={13} weight="bold" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

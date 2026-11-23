import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { Spinner } from "react-bootstrap";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Users,
  CalendarCheck,
  AirplaneTilt,
  Coins,
  ChartBar,
  CalendarBlank,
  ArrowRight,
  Megaphone,
  Info,
  WarningCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendUp,
  TrendDown,
} from "@phosphor-icons/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HERO_PLANE_BG =
  "https://static.vecteezy.com/system/resources/previews/035/719/664/non_2x/ai-generated-image-of-a-large-airliner-flying-in-the-sky-free-photo.jpg";

function formatCompactVnd(val) {
  const num = Number(val || 0);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} Tỷ ₫`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} Tr ₫`;
  return `${num.toLocaleString("vi-VN")} ₫`;
}

function getCurrentMonthRangeLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, "0");
  return `01/${mm}/${y} – ${String(lastDay).padStart(2, "0")}/${mm}/${y}`;
}

function getStatusBadge(rawStatus) {
  const s = String(rawStatus || "").toLowerCase();
  if (s === "paid" || s === "confirmed" || s === "completed" || s === "success") {
    return {
      label: "Đã thanh toán",
      bg: "#ecfdf5",
      color: "#059669",
      border: "#a7f3d0",
      Icon: CheckCircle,
    };
  }
  if (s === "cancelled" || s === "canceled" || s === "failed") {
    return {
      label: "Đã hủy",
      bg: "#fef2f2",
      color: "#dc2626",
      border: "#fecaca",
      Icon: XCircle,
    };
  }
  return {
    label: "Chờ thanh toán",
    bg: "#fffbeb",
    color: "#d97706",
    border: "#fde68a",
    Icon: Clock,
  };
}

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState("year"); // "year" | "6m"

  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    totalFlights: 0,
    totalBookings: 0,
    totalUsers: 0,
    revenue: 0,
    usersGrowth: 0,
    bookingsGrowth: 0,
    flightsGrowth: 0,
    revenueGrowth: 0,
    pendingBookings: 0,
    totalAirports: 19,
    totalTravelReservations: 0,
  });

  const [analytics, setAnalytics] = useState({
    months: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    currentYearLabel: `Năm ${new Date().getFullYear()}`,
    previousYearLabel: `Năm ${new Date().getFullYear() - 1}`,
    bookings: Array(12).fill(0),
    previousBookings: Array(12).fill(0),
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [serviceDistribution, setServiceDistribution] = useState({
    total: 0,
    items: [
      { key: "flight", label: "Vé máy bay", count: 0, percentage: 100, color: "#1d75f2" },
      { key: "hotel", label: "Khách sạn", count: 0, percentage: 0, color: "#f59e0b" },
      { key: "car", label: "Thuê xe", count: 0, percentage: 0, color: "#10b981" },
      { key: "experience", label: "Trải nghiệm", count: 0, percentage: 0, color: "#ec4899" },
    ],
  });

  useEffect(() => {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    let user = null;
    try {
      user = raw ? JSON.parse(raw) : null;
    } catch {
      user = null;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    const isAdmin =
      Number(user.role) === 1 ||
      user.role === "admin" ||
      user.roles?.some((r) => r.name === "admin" || Number(r.id) === 1);

    if (!isAdmin) {
      navigate("/");
      return;
    }

    setAdminName(user.name || "Quản trị viên");
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard");
      const data = res.data || {};

      if (data.stats) {
        setStats((prev) => ({ ...prev, ...data.stats }));
      }
      if (data.analytics) {
        setAnalytics((prev) => ({ ...prev, ...data.analytics }));
      }
      if (Array.isArray(data.recentBookings)) {
        setRecentBookings(data.recentBookings);
      }
      if (data.serviceDistribution?.items) {
        setServiceDistribution(data.serviceDistribution);
      }
    } catch (err) {
      console.error("Failed to fetch admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Line Chart Data (real 12-month or last 6-month slice)
  const lineChartData = useMemo(() => {
    const sliceStart = chartRange === "6m" ? 6 : 0;
    const labels = (analytics.months || []).slice(sliceStart);
    const currData = (analytics.bookings || []).slice(sliceStart);
    const prevData = (analytics.previousBookings || []).slice(sliceStart);

    return {
      labels,
      datasets: [
        {
          label: analytics.currentYearLabel,
          data: currData,
          fill: true,
          borderColor: "#1d75f2",
          borderWidth: 3,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 260);
            gradient.addColorStop(0, "rgba(29, 117, 242, 0.24)");
            gradient.addColorStop(1, "rgba(29, 117, 242, 0.0)");
            return gradient;
          },
          tension: 0.42,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#1d75f2",
          pointBorderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: analytics.previousYearLabel,
          data: prevData,
          fill: false,
          borderColor: "#93c5fd",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.42,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#93c5fd",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [analytics, chartRange]);

  const lineChartOptions = useMemo(() => {
    const allValues = [
      ...(analytics.bookings || []),
      ...(analytics.previousBookings || []),
    ];
    const maxVal = Math.max(10, ...allValues);
    const suggestedMax = Math.ceil((maxVal * 1.25) / 5) * 5;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#ffffff",
          titleColor: "#091e47",
          bodyColor: "#0b4fd0",
          borderColor: "#cde2fd",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          displayColors: true,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} lượt đặt`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#64748b", font: { size: 11, weight: "700" } },
        },
        y: {
          beginAtZero: true,
          suggestedMax,
          grid: { color: "#eef4ff" },
          ticks: {
            color: "#64748b",
            font: { size: 11, weight: "600" },
            precision: 0,
          },
        },
      },
    };
  }, [analytics]);

  // Doughnut Chart Data (Real Service Distribution)
  const doughnutData = useMemo(() => {
    const items = serviceDistribution.items || [];
    const hasAny = items.some((i) => i.count > 0);
    return {
      labels: items.map((i) => i.label),
      datasets: [
        {
          data: hasAny ? items.map((i) => i.count) : [1, 0, 0, 0],
          backgroundColor: items.map((i) => i.color),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }, [serviceDistribution]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#091e47",
        bodyColor: "#0b4fd0",
        borderColor: "#cde2fd",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed} đơn`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "70vh" }}
      >
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "2.8rem", height: "2.8rem" }}
        />
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Tổng người dùng",
      value: Number(stats.totalUsers || 0).toLocaleString("vi-VN"),
      growth: stats.usersGrowth,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Tổng đặt vé",
      value: Number(stats.totalBookings || 0).toLocaleString("vi-VN"),
      growth: stats.bookingsGrowth,
      icon: CalendarCheck,
      href: "/admin/bookings",
    },
    {
      title: "Chuyến bay",
      value: Number(stats.totalFlights || 0).toLocaleString("vi-VN"),
      growth: stats.flightsGrowth,
      icon: AirplaneTilt,
      href: "/admin/flights",
    },
    {
      title: "Tổng doanh thu",
      value: formatCompactVnd(stats.revenue),
      growth: stats.revenueGrowth,
      icon: Coins,
      href: "/admin/profits",
    },
  ];

  const systemNotices = [
    {
      icon: stats.pendingBookings > 0 ? WarningCircle : CheckCircle,
      iconBg: stats.pendingBookings > 0 ? "#fffbeb" : "#ecfdf5",
      iconColor: stats.pendingBookings > 0 ? "#d97706" : "#059669",
      title:
        stats.pendingBookings > 0
          ? `${stats.pendingBookings} đơn đặt vé đang chờ thanh toán`
          : "Tất cả đơn đặt vé đã được xử lý",
      desc: "Kiểm tra & cập nhật trạng thái tại mục Reservation",
      time: "Trực tiếp",
      href: "/admin/bookings",
    },
    {
      icon: Megaphone,
      iconBg: "#eff6ff",
      iconColor: "#0b57d0",
      title: `Mạng bay mở rộng ${stats.totalAirports || 19} sân bay Nội địa & Quốc tế`,
      desc: `Đang có ${stats.totalTravelReservations || 0} đơn dịch vụ du lịch (Khách sạn, Tour, Xe)`,
      time: "Hệ thống",
      href: "/admin/travel-services",
    },
    {
      icon: Info,
      iconBg: "#f0f9ff",
      iconColor: "#0284c7",
      title: "Chính sách hành lý & Check-in trực tuyến 24h",
      desc: "Áp dụng đồng bộ cho 10 sân bay Việt Nam & 9 sân bay Quốc tế",
      time: "Đang áp dụng",
      href: "/admin/airports",
    },
  ];

  return (
    <div
      className="relative font-sans"
      style={{
        maxWidth: "1520px",
        margin: "0 auto",
        padding: "4px 0 12px 0",
      }}
    >
      {/* 1. GREETING HERO HEADER */}
      <div className="relative z-10 mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1
            className="font-black tracking-tight"
            style={{ fontSize: "clamp(1.6rem, 2.3vw, 2.05rem)", color: "#091e47", margin: 0 }}
          >
            Xin chào, {adminName}
          </h1>
          <p className="mt-1 text-xs font-semibold text-[#234378] sm:text-sm" style={{ margin: 0 }}>
            Chúc bạn có một ngày làm việc hiệu quả!
          </p>
        </div>

        <div
          className="inline-flex w-fit items-center gap-2 bg-white/95 px-4 py-2 text-xs font-extrabold text-[#123975] shadow-sm"
          style={{ borderRadius: 9999, border: "1px solid rgba(255,255,255,0.98)" }}
        >
          <CalendarBlank size={16} weight="duotone" className="text-blue-600" />
          <span>{getCurrentMonthRangeLabel()}</span>
        </div>
      </div>

      {/* 2. ROW 1: 4 KPI STAT CARDS */}
      <div className="relative z-10 mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const isPositive = Number(card.growth || 0) >= 0;
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => navigate(card.href)}
              className="group flex cursor-pointer items-center gap-3 bg-white text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                padding: "16px 14px",
                borderRadius: 20,
                border: "1px solid rgba(213, 230, 252, 0.9)",
                boxShadow: "0 10px 26px rgba(18, 60, 130, 0.06)",
              }}
            >
              <div
                className="flex shrink-0 items-center justify-center text-blue-600 transition group-hover:scale-105"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "#ebf3ff",
                  border: "1px solid #d5e6fc",
                }}
              >
                <Icon size={22} weight="duotone" />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="font-bold text-[#476494]"
                  style={{ margin: 0, fontSize: 12, whiteSpace: "nowrap" }}
                >
                  {card.title}
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                  <span
                    className="font-black leading-none text-[#091e47]"
                    style={{ fontSize: 22, whiteSpace: "nowrap" }}
                  >
                    {card.value}
                  </span>
                  <span
                    className="inline-flex items-center gap-0.5 text-[11px] font-extrabold"
                    style={{ color: isPositive ? "#059669" : "#dc2626", whiteSpace: "nowrap" }}
                  >
                    {isPositive ? <TrendUp size={11} weight="bold" /> : <TrendDown size={11} weight="bold" />}
                    {Math.abs(Number(card.growth || 0))}%
                  </span>
                </div>
                <p
                  className="mt-1 text-[11px] font-medium text-slate-400"
                  style={{ margin: 0, whiteSpace: "nowrap" }}
                >
                  So với tháng trước
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. ROW 2: ANALYTICS LINE CHART (6 cols) + RECENT BOOKINGS TABLE (6 cols) */}
      <div className="relative z-10 mb-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Thống kê đặt vé */}
        <div
          className="flex flex-col bg-white p-5 lg:col-span-6"
          style={{
            borderRadius: 22,
            border: "1px solid #d5e6fc",
            boxShadow: "0 10px 26px rgba(18, 60, 130, 0.06)",
          }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ChartBar size={18} weight="fill" />
              </div>
              <h2 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 16 }}>
                Thống kê đặt vé
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 text-[11px] font-bold text-[#33507f]">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1d75f2]" />
                  {analytics.currentYearLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#93c5fd]" />
                  {analytics.previousYearLabel}
                </span>
              </div>

              <select
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value)}
                aria-label="Chọn khoảng thời gian thống kê"
                className="cursor-pointer bg-[#f4f8ff] px-3 py-1.5 text-xs font-extrabold text-[#123975] outline-none"
                style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
              >
                <option value="year">Cả năm {new Date().getFullYear()}</option>
                <option value="6m">6 tháng cuối năm</option>
              </select>
            </div>
          </div>

          <div className="w-full flex-1" style={{ minHeight: 245 }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Right: Đơn đặt gần đây (100% real bookings from DB) */}
        <div
          className="flex flex-col bg-white p-5 lg:col-span-6"
          style={{
            borderRadius: 22,
            border: "1px solid #d5e6fc",
            boxShadow: "0 10px 26px rgba(18, 60, 130, 0.06)",
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 16 }}>
              Đơn đặt gần đây
            </h2>
            <button
              type="button"
              onClick={() => navigate("/admin/bookings")}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 bg-transparent text-xs font-extrabold text-blue-600 hover:text-blue-800"
              style={{ border: "none", padding: 0, whiteSpace: "nowrap" }}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={13} weight="bold" />
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-xs font-semibold text-slate-400">
              Chưa có đơn đặt vé nào trong hệ thống.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ borderCollapse: "separate", borderSpacing: "0 6px" }}>
                <thead>
                  <tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="pb-1 pr-2">Mã PNR</th>
                    <th className="pb-1 pr-2">Khách hàng</th>
                    <th className="pb-1 pr-2">Chặng bay</th>
                    <th className="pb-1 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => {
                    const badge = getStatusBadge(b.status);
                    const StatusIcon = badge.Icon;
                    const dep = b.flight?.departure_airport?.code || "HAN";
                    const arr = b.flight?.arrival_airport?.code || "SGN";
                    const passengerName =
                      b.tickets?.[0]?.passenger_name || b.user?.name || "Khách hàng";

                    return (
                      <tr
                        key={b.id}
                        onClick={() => navigate("/admin/bookings")}
                        className="cursor-pointer transition hover:bg-[#f4f8ff]"
                      >
                        <td className="py-2 pr-2 font-mono text-[11px] font-black text-[#0b4fd0]">
                          {b.pnr_code || `#${b.id}`}
                        </td>
                        <td className="max-w-[96px] truncate py-2 pr-2 text-xs font-bold text-[#091e47]">
                          {passengerName}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-2 text-[11px] font-semibold text-[#33507f]">
                          {dep} → {arr}
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap"
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              borderRadius: 9999,
                            }}
                          >
                            <StatusIcon size={11} weight="fill" />
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. ROW 3: 3 BOTTOM CARDS (Ưu đãi nổi bật + Phân bổ dịch vụ + Thông báo hệ thống) */}
      <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Card 1: Ưu đãi nổi bật */}
        <div
          className="flex flex-col justify-between bg-white p-5 lg:col-span-4"
          style={{
            borderRadius: 22,
            border: "1px solid #d5e6fc",
            boxShadow: "0 10px 26px rgba(18, 60, 130, 0.06)",
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 16, whiteSpace: "nowrap" }}>
              Ưu đãi nổi bật
            </h3>
            <button
              type="button"
              onClick={() => navigate("/admin/offers")}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 bg-transparent text-xs font-extrabold text-blue-600 hover:text-blue-800"
              style={{ border: "none", padding: 0, whiteSpace: "nowrap" }}
            >
              <span>Xem thêm</span>
              <ArrowRight size={13} weight="bold" />
            </button>
          </div>

          <div
            className="relative flex flex-1 flex-col justify-between overflow-hidden p-4 text-white"
            style={{
              minHeight: 150,
              borderRadius: 18,
              background: "linear-gradient(125deg, #0b4fd0 0%, #1d75f2 55%, #38bdf8 100%)",
            }}
          >
            <img
              src={HERO_PLANE_BG}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              style={{ opacity: 0.25, objectPosition: "left center" }}
            />
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-sky-100" style={{ margin: 0 }}>
                Chiến dịch đang chạy
              </p>
              <p className="mt-1 text-2xl font-black leading-none text-white" style={{ margin: 0 }}>
                Giảm đến 40%
              </p>
              <p className="mt-1.5 text-xs font-semibold text-blue-100" style={{ margin: 0 }}>
                Cho 9 đường bay Quốc tế mới
              </p>
            </div>

            <div className="relative z-10 mt-3">
              <button
                type="button"
                onClick={() => navigate("/admin/offers")}
                className="inline-flex cursor-pointer items-center gap-1.5 bg-white text-xs font-black text-[#0b4fd0] shadow-sm transition hover:bg-blue-50"
                style={{ borderRadius: 9999, border: "none", padding: "7px 14px", whiteSpace: "nowrap" }}
              >
                <span>Quản lý ưu đãi</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Phân bổ dịch vụ (Real DB Doughnut Chart) */}
        <div
          className="flex flex-col justify-between bg-white p-5 lg:col-span-4"
          style={{
            borderRadius: 22,
            border: "1px solid #d5e6fc",
            boxShadow: "0 10px 26px rgba(18, 60, 130, 0.06)",
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 16, whiteSpace: "nowrap" }}>
              Phân bổ dịch vụ
            </h3>
            <span className="text-[11px] font-bold text-slate-400" style={{ whiteSpace: "nowrap" }}>
              {serviceDistribution.total} đơn
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="relative shrink-0" style={{ width: 108, height: 108 }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-[#091e47]">100%</span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              {(serviceDistribution.items || []).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-1.5 text-[11px] font-bold"
                >
                  <span
                    className="inline-flex items-center gap-1.5 text-[#1e3a6b]"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0"
                      style={{ background: item.color, borderRadius: 9999 }}
                    />
                    {item.label}
                  </span>
                  <span className="font-black text-[#091e47]">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Thông báo hệ thống (Real DB Operational Notices) */}
        <div
          className="flex flex-col justify-between bg-white p-5 lg:col-span-4"
          style={{
            borderRadius: 22,
            border: "1px solid #d5e6fc",
            boxShadow: "0 10px 26px rgba(18, 60, 130, 0.06)",
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-black text-[#091e47]" style={{ margin: 0, fontSize: 15, whiteSpace: "nowrap" }}>
              Thông báo hệ thống
            </h3>
            <button
              type="button"
              onClick={() => navigate("/admin/reports")}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 bg-transparent font-extrabold text-blue-600 hover:text-blue-800"
              style={{ border: "none", padding: 0, fontSize: 11, whiteSpace: "nowrap" }}
            >
              <span>Tất cả</span>
              <ArrowRight size={12} weight="bold" />
            </button>
          </div>

          <div className="space-y-3">
            {systemNotices.map((notice) => {
              const Icon = notice.icon;
              return (
                <button
                  key={notice.title}
                  type="button"
                  onClick={() => navigate(notice.href)}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-2xl p-2 text-left transition hover:bg-[#f4f8ff]"
                  style={{ border: "none", background: "transparent" }}
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: notice.iconBg, color: notice.iconColor }}
                  >
                    <Icon size={18} weight="fill" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-xs font-extrabold text-[#091e47]" style={{ margin: 0 }}>
                        {notice.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-bold text-slate-400">
                        {notice.time}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500" style={{ margin: 0 }}>
                      {notice.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
